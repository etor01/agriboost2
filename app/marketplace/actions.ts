"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ── Constants ──────────────────────────────────────────────────────────────────
/** 5% of (subtotal + delivery_fee) goes to AgriBoost platform */
const PLATFORM_FEE_RATE = 0.05;

// ── Types ──────────────────────────────────────────────────────────────────────
export type CartCheckoutItem = {
  listingId: string;
  title: string;
  price: number;
  qty: number;
  unit: string;
  farmerProfileId: string;
};

export type CheckoutPayload = {
  items: CartCheckoutItem[];
  deliveryOption: "farm_pickup" | "standard_delivery" | "express_delivery";
  deliveryFee: number;
  deliveryAddress: string;
  phone: string;
  paystackRef?: string;
};

/**
 * Creates orders in Supabase using the buyer's wallet balance.
 * Deducts the grand total from wallet, records fee breakdown per item:
 *   - delivery_fee  → platform income
 *   - platform_fee  → 5% of (subtotal + delivery) → platform income
 *   - sales_amount  → held in escrow for farmer
 */
export async function createOrderWithEscrow(payload: CheckoutPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to place an order." };
  }

  // ── 1. Fetch buyer's wallet balance ────────────────────────────────────────
  const { data: profileData, error: profileErr } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  if (profileErr || !profileData) {
    return { success: false, error: "Could not fetch your wallet balance." };
  }

  const walletBalance = Number(profileData.wallet_balance ?? 0);

  // ── 2. Calculate grand total ────────────────────────────────────────────────
  const subtotal = payload.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFeeTotal = payload.deliveryFee;
  const platformFeeTotal = Number(
    ((subtotal + deliveryFeeTotal) * PLATFORM_FEE_RATE).toFixed(2)
  );
  const grandTotal = Number(
    (subtotal + deliveryFeeTotal + platformFeeTotal).toFixed(2)
  );

  if (walletBalance < grandTotal) {
    return {
      success: false,
      error: `Insufficient wallet balance. Available: GH₵ ${walletBalance.toFixed(
        2
      )}, Required: GH₵ ${grandTotal.toFixed(2)}. Please top up your wallet.`,
    };
  }

  // ── 3. Deduct from wallet (optimistic deduction before inserts) ────────────
  const newWalletBalance = Number((walletBalance - grandTotal).toFixed(2));
  const { error: walletDeductErr } = await supabase
    .from("profiles")
    .update({ wallet_balance: newWalletBalance })
    .eq("id", user.id);

  if (walletDeductErr) {
    return { success: false, error: "Failed to deduct from wallet. Please try again." };
  }

  // ── 4. Ensure buyer record exists ──────────────────────────────────────────
  await supabase
    .from("buyers")
    .upsert(
      { profile_id: user.id, delivery_address: payload.deliveryAddress },
      { onConflict: "profile_id" }
    );

  const createdOrders: Array<{
    orderId: string;
    title: string;
    total: number;
    otp: string;
  }> = [];

  const totalItems = payload.items.length;
  // Distribute delivery fee and platform fee proportionally across items
  const deliveryFeePerItem = totalItems > 0 ? deliveryFeeTotal / totalItems : 0;
  const platformFeePerItem = totalItems > 0 ? platformFeeTotal / totalItems : 0;

  for (const item of payload.items) {
    const itemSubtotal = Number((item.price * item.qty).toFixed(2));
    const itemDeliveryFee = Number(deliveryFeePerItem.toFixed(2));
    const itemPlatformFee = Number(platformFeePerItem.toFixed(2));
    // Sales amount = what farmer earns (subtotal minus platform fee; delivery NOT going to farmer)
    const itemSalesAmount = Number((itemSubtotal - itemPlatformFee).toFixed(2));
    // Total paid by buyer for this item
    const itemTotal = Number(
      (itemSubtotal + itemDeliveryFee + itemPlatformFee).toFixed(2)
    );
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // ── Insert Order ──────────────────────────────────────────────────────────
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        listing_id: item.listingId,
        quantity: item.qty,
        unit_price: item.price,
        total_amount: itemTotal,
        status: "processing",
        delivery_otp: otp,
      })
      .select("id, delivery_otp")
      .single();

    if (orderErr || !orderData) {
      // Rollback wallet on failure
      await supabase
        .from("profiles")
        .update({ wallet_balance: walletBalance })
        .eq("id", user.id);
      return {
        success: false,
        error: orderErr?.message || "Failed to create order record.",
      };
    }

    // ── Insert Escrow Transaction with full fee breakdown ─────────────────────
    const { error: txErr } = await supabase.from("transactions").insert({
      order_id: orderData.id,
      profile_id: item.farmerProfileId, // farmer who will receive the sales_amount
      paystack_reference:
        payload.paystackRef ||
        `WALLET-${orderData.id.slice(0, 8).toUpperCase()}`,
      amount: itemTotal,
      service_name: `Escrow: ${item.title} (${item.qty} ${item.unit}) — Order #${orderData.id.slice(0, 8).toUpperCase()}`,
      escrow_held: true,
      status: "pending",
      transaction_type: "escrow_hold",
      delivery_fee: itemDeliveryFee,
      platform_fee: itemPlatformFee,
      sales_amount: itemSalesAmount,
      platform_fee_collected: false,
      farmer_balance_credited: false,
    });

    if (txErr) {
      console.error("Error creating escrow transaction:", txErr);
    }

    // ── Log Activity for Buyer ────────────────────────────────────────────────
    await supabase.from("activities").insert({
      profile_id: user.id,
      activity_type: "payment_received",
      title: "Order Placed (Escrow Protected)",
      description: `Order #${orderData.id
        .slice(0, 8)
        .toUpperCase()} for ${item.qty} ${item.unit} of ${
        item.title
      }. GH₵ ${itemTotal.toFixed(2)} deducted from wallet and held in AgriBoost Escrow.`,
    });

    // ── Log Activity for Farmer ───────────────────────────────────────────────
    if (item.farmerProfileId) {
      await supabase.from("activities").insert({
        profile_id: item.farmerProfileId,
        activity_type: "payment_received",
        title: "New Produce Order Received 🌱",
        description: `New order for ${item.qty} ${item.unit} of ${
          item.title
        }. You'll earn GH₵ ${itemSalesAmount.toFixed(
          2
        )} once delivery is confirmed.`,
      });
    }

    createdOrders.push({
      orderId: orderData.id,
      title: item.title,
      total: itemTotal,
      otp: orderData.delivery_otp || otp,
    });
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/finances");
  revalidatePath("/orders");

  return {
    success: true,
    orders: createdOrders,
    grandTotal,
    platformFee: platformFeeTotal,
    deliveryFee: deliveryFeeTotal,
    farmerEarns: Number((subtotal - platformFeeTotal).toFixed(2)),
    message: "Your payment is securely held in AgriBoost Escrow!",
  };
}

/**
 * Confirm delivery and release escrow funds:
 *   - Credits farmer's available_balance with sales_amount
 *   - Marks platform_fee_collected = true, farmer_balance_credited = true
 */
export async function confirmDeliveryAndReleaseEscrow(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // ── 1. Verify order exists ─────────────────────────────────────────────────
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, total_amount, listing_id")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { success: false, error: "Order not found." };
  }

  if (order.status === "delivered") {
    return {
      success: true,
      message: "Order is already marked as delivered and escrow released.",
    };
  }

  // ── 2. Update order status ────────────────────────────────────────────────
  const now = new Date().toISOString();
  const { error: updateOrderErr } = await supabase
    .from("orders")
    .update({ status: "delivered", delivery_confirmed_at: now })
    .eq("id", orderId);

  if (updateOrderErr) {
    return {
      success: false,
      error: updateOrderErr.message || "Failed to update order status.",
    };
  }

  // ── 3. Fetch escrow transaction ───────────────────────────────────────────
  const { data: txList, error: txFetchErr } = await supabase
    .from("transactions")
    .select("id, profile_id, amount, sales_amount, delivery_fee, platform_fee, service_name")
    .eq("order_id", orderId)
    .eq("transaction_type", "escrow_hold");

  if (txFetchErr || !txList || txList.length === 0) {
    console.error("Error fetching escrow transaction:", txFetchErr);
  }

  // ── 4. Release escrow → mark completed, set fee flags ────────────────────
  const { error: txReleaseErr } = await supabase
    .from("transactions")
    .update({
      escrow_held: false,
      status: "completed",
      transaction_type: "escrow_release",
      release_date: now,
      farmer_payout_date: now,
      platform_fee_collected: true,
      farmer_balance_credited: true,
    })
    .eq("order_id", orderId);

  if (txReleaseErr) {
    console.error("Error releasing escrow transaction:", txReleaseErr);
  }

  // ── 5. Credit farmer's available_balance with sales_amount ───────────────
  if (txList && txList.length > 0) {
    for (const tx of txList) {
      if (tx.profile_id) {
        const salesAmt = Number(tx.sales_amount ?? tx.amount ?? 0);

        // Fetch current available_balance
        const { data: farmerProfile } = await supabase
          .from("profiles")
          .select("available_balance")
          .eq("id", tx.profile_id)
          .single();

        const currentAvail = Number(farmerProfile?.available_balance ?? 0);
        const newAvail = Number((currentAvail + salesAmt).toFixed(2));

        await supabase
          .from("profiles")
          .update({ available_balance: newAvail })
          .eq("id", tx.profile_id);

        // ── Notify farmer ───────────────────────────────────────────────────
        await supabase.from("activities").insert({
          profile_id: tx.profile_id,
          activity_type: "payment_received",
          title: "Escrow Released! 💰",
          description: `Delivery confirmed for Order #${orderId
            .slice(0, 8)
            .toUpperCase()}. GH₵ ${salesAmt.toFixed(
            2
          )} added to your Available Payout balance!`,
        });
      }
    }
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/finances");
  revalidatePath("/orders");
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/orders");

  return {
    success: true,
    message: "Delivery confirmed and escrow funds released to the farmer!",
  };
}

/**
 * Farmer verifies the buyer's 4-digit Delivery OTP to complete delivery and release escrow.
 */
export async function verifyDeliveryOtpAndReleaseEscrow(
  orderId: string,
  inputOtp: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, delivery_otp")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { success: false, error: "Order not found." };
  }

  if (!order.delivery_otp || order.delivery_otp !== inputOtp.trim()) {
    return {
      success: false,
      error: "Invalid Delivery OTP. Please check the 4-digit code from the buyer.",
    };
  }

  // OTP matched! Call release logic
  return await confirmDeliveryAndReleaseEscrow(orderId);
}

/**
 * Get buyer orders with listing details and escrow transaction status.
 */
export async function getBuyerOrdersWithEscrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      quantity,
      unit_price,
      total_amount,
      status,
      delivery_otp,
      delivery_confirmed_at,
      created_at,
      listings (
        name,
        unit_type,
        image_urls,
        profile_id,
        farmers!listings_profile_id_fkey (
          profiles (
            firstname,
            lastname,
            location
          )
        )
      ),
      transactions (
        id,
        escrow_held,
        status,
        amount,
        delivery_fee,
        platform_fee,
        sales_amount,
        release_date
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buyer orders:", error);
    return [];
  }

  return orders || [];
}

/**
 * Get farmer's incoming orders with buyer details and escrow status.
 */
export async function getFarmerOrdersWithEscrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: txs, error: txErr } = await supabase
    .from("transactions")
    .select(`
      id,
      order_id,
      amount,
      sales_amount,
      delivery_fee,
      platform_fee,
      escrow_held,
      status,
      transaction_type,
      created_at,
      release_date,
      orders (
        id,
        quantity,
        unit_price,
        total_amount,
        status,
        delivery_otp,
        delivery_confirmed_at,
        created_at,
        listings (
          name,
          unit_type,
          image_urls
        ),
        buyers (
          delivery_address,
          profiles (
            firstname,
            lastname,
            phone
          )
        )
      )
    `)
    .eq("profile_id", user.id)
    .not("order_id", "is", null)
    .order("created_at", { ascending: false });

  if (txErr) {
    console.error("Error fetching farmer orders:", txErr);
    return [];
  }

  return txs || [];
}

/**
 * Get farmer's escrow summary:
 *  - totalEscrow: funds still locked
 *  - availablePayout: ready to withdraw (available_balance on profile)
 *  - totalEarned: lifetime sales_amount released
 */
export async function getFarmerEscrowSummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalEscrow: 0, availablePayout: 0, totalEarned: 0 };
  }

  // Get profile balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("available_balance")
    .eq("id", user.id)
    .single();

  const { data: txList, error } = await supabase
    .from("transactions")
    .select("amount, sales_amount, escrow_held, status, transaction_type")
    .eq("profile_id", user.id);

  if (error || !txList) {
    return {
      totalEscrow: 0,
      availablePayout: Number(profile?.available_balance ?? 0),
      totalEarned: 0,
    };
  }

  let totalEscrow = 0;
  let totalEarned = 0;

  for (const tx of txList) {
    // Escrow: held, not released
    if (tx.escrow_held && tx.status !== "completed") {
      totalEscrow += Number(tx.sales_amount ?? tx.amount ?? 0);
    }
    // Earned: released escrow (sales amounts only)
    if (
      tx.transaction_type === "escrow_release" &&
      tx.status === "completed" &&
      !tx.escrow_held
    ) {
      totalEarned += Number(tx.sales_amount ?? 0);
    }
  }

  return {
    totalEscrow: Number(totalEscrow.toFixed(2)),
    availablePayout: Number(profile?.available_balance ?? 0),
    totalEarned: Number(totalEarned.toFixed(2)),
  };
}

/**
 * Get buyer's wallet balance.
 */
export async function getBuyerWalletBalance(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  return Number(data?.wallet_balance ?? 0);
}
