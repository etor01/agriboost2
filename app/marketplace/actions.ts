"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notifications";

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

  // ── 1. Calculate grand total ────────────────────────────────────────────────
  //      (totals computed before the RPC so we can pass grandTotal atomically)
  const subtotal = payload.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFeeTotal = payload.deliveryFee;
  const platformFeeTotal = Number(
    ((subtotal + deliveryFeeTotal) * PLATFORM_FEE_RATE).toFixed(2)
  );
  const grandTotal = Number(
    (subtotal + deliveryFeeTotal + platformFeeTotal).toFixed(2)
  );

  // ── 2. Atomic wallet deduction via row-locked RPC ───────────────────────────
  //      The SQL function acquires a FOR UPDATE lock on the profiles row,
  //      checks the balance, deducts, and returns the result — all inside a
  //      single DB transaction. Two concurrent checkouts will serialize here;
  //      the second will see the already-deducted balance and fail gracefully.
  let walletBalance: number = 0;
  let newWalletBalance: number = 0;

  const { data: rpcRows, error: rpcErr } = await supabase.rpc(
    "deduct_wallet_balance",
    { user_id: user.id, deduct_amount: grandTotal }
  );

  if (!rpcErr) {
    // rpc() with a RETURNS TABLE function returns an array; grab the first row.
    const rpcResult = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

    if (!rpcResult?.success) {
      return {
        success: false,
        error: rpcResult?.error_message ?? "Insufficient wallet balance. Please top up your wallet.",
      };
    }

    newWalletBalance = Number(rpcResult.new_balance);
    walletBalance = Number((newWalletBalance + grandTotal).toFixed(2));
  } else {
    console.warn("[createOrderWithEscrow] deduct_wallet_balance RPC unavailable or failed, executing fallback:", rpcErr.message);

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return { success: false, error: "Failed to verify wallet balance. Please try again." };
    }

    walletBalance = Number(profile.wallet_balance ?? 0);
    if (walletBalance < grandTotal) {
      return {
        success: false,
        error: `Insufficient wallet balance. Required: GH₵ ${grandTotal.toFixed(2)}, Available: GH₵ ${walletBalance.toFixed(2)}. Please top up your wallet.`,
      };
    }

    newWalletBalance = Number((walletBalance - grandTotal).toFixed(2));
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ wallet_balance: newWalletBalance })
      .eq("id", user.id);

    if (updateErr) {
      return { success: false, error: "Failed to deduct wallet balance. Please try again." };
    }
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

    // Fetch the real farmer profile_id directly from the database to ensure correctness
    let farmerProfileId = item.farmerProfileId;
    if (item.listingId) {
      const { data: listingData } = await supabase
        .from("listings")
        .select("profile_id, name")
        .eq("id", item.listingId)
        .single();
      if (listingData?.profile_id) {
        farmerProfileId = listingData.profile_id;
      }
    }

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

    // NOTE: Inventory is deducted when the farmer confirms the order,
    // not at checkout. This keeps listings visible until the farmer
    // explicitly accepts — preventing double-deduction.

    // ── Insert Escrow Transaction with full fee breakdown ─────────────────────
    if (farmerProfileId && farmerProfileId.trim().length > 0) {
      const { error: txErr } = await supabase.from("transactions").insert({
        order_id: orderData.id,
        profile_id: farmerProfileId, // verified farmer who will receive the sales_amount
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
    } else {
      console.warn("Could not determine farmerProfileId for order", orderData.id);
    }

    // ── Insert Buyer Purchase Transaction (so buyer sees deduction in wallet) ──
    await supabase.from("transactions").insert({
      order_id: orderData.id,
      profile_id: user.id, // Buyer
      paystack_reference:
        payload.paystackRef ||
        `PURCHASE-${orderData.id.slice(0, 8).toUpperCase()}`,
      amount: itemTotal,
      service_name: `Produce Order — ${item.title} (${item.qty} ${item.unit})`,
      escrow_held: true,
      status: "completed",
      transaction_type: "purchase",
      delivery_fee: itemDeliveryFee,
      platform_fee: itemPlatformFee,
      sales_amount: itemSalesAmount,
      platform_fee_collected: false,
      farmer_balance_credited: false,
    });

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
    if (farmerProfileId) {
      await supabase.from("activities").insert({
        profile_id: farmerProfileId,
        activity_type: "payment_received",
        title: "New Produce Order Received 🌱",
        description: `New order for ${item.qty} ${item.unit} of ${
          item.title
        }. You'll earn GH₵ ${itemSalesAmount.toFixed(
          2
        )} once delivery is confirmed.`,
      });

      await createNotification(
        farmerProfileId,
        "order_placed",
        "New Order Received!",
        `You have a new order for ${item.qty} ${item.unit} of ${item.title}. The funds (GH₵ ${itemSalesAmount.toFixed(2)}) are secured in escrow.`
      );
    }

    createdOrders.push({
      orderId: orderData.id,
      title: item.title,
      total: itemTotal,
      otp: orderData.delivery_otp || otp,
    });
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/buyer/shop");
  revalidatePath("/marketplace");
  revalidatePath("/my-listings");
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
    .select("id, status, total_amount, listing_id, buyer_id, listings(profile_id)")
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

  if (order.status === "cancelled") {
    return {
      success: false,
      error: "Cannot release escrow for a cancelled order.",
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
    .eq("order_id", orderId)
    .eq("transaction_type", "escrow_hold");

  if (txReleaseErr) {
    console.error("Error releasing escrow transaction:", txReleaseErr);
  }

  // Also release the escrow hold flag on the buyer's purchase record
  await supabase
    .from("transactions")
    .update({ escrow_held: false })
    .eq("order_id", orderId)
    .eq("transaction_type", "purchase");

  // ── 5. Credit farmer's available_balance with sales_amount ───────────────
  let creditedFarmer = false;
  if (txList && txList.length > 0) {
    for (const tx of txList) {
      if (tx.profile_id) {
        const salesAmt = Number(tx.sales_amount) > 0 ? Number(tx.sales_amount) : Number(tx.amount ?? 0);

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

        creditedFarmer = true;

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

  // Fallback: if no tx record was found, credit the listing's farmer profile
  const listingFarmerId = (order as any).listings?.profile_id;
  if (!creditedFarmer && listingFarmerId) {
    const subtotal = Number(order.total_amount) || 0;
    const salesAmt = Number((subtotal * (1 - PLATFORM_FEE_RATE)).toFixed(2));

    const { data: farmerProfile } = await supabase
      .from("profiles")
      .select("available_balance")
      .eq("id", listingFarmerId)
      .single();

    const currentAvail = Number(farmerProfile?.available_balance ?? 0);
    const newAvail = Number((currentAvail + salesAmt).toFixed(2));

    await supabase
      .from("profiles")
      .update({ available_balance: newAvail })
      .eq("id", listingFarmerId);

    await supabase.from("activities").insert({
      profile_id: listingFarmerId,
      activity_type: "payment_received",
      title: "Escrow Released! 💰",
      description: `Delivery confirmed for Order #${orderId
        .slice(0, 8)
        .toUpperCase()}. GH₵ ${salesAmt.toFixed(
        2
      )} added to your Available Payout balance!`,
    });
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

// ── OTP Rate Limiter (Module Level) ───────────────────────────────────────────
type OtpAttemptRecord = { count: number; resetAt: number };
const otpAttemptMap = new Map<string, OtpAttemptRecord>();
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes

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

  const rateLimitKey = `${user.id}-${orderId}`;
  const now = Date.now();
  let record = otpAttemptMap.get(rateLimitKey);

  // Clear expired lockout record
  if (record && now > record.resetAt) {
    otpAttemptMap.delete(rateLimitKey);
    record = undefined;
  }

  // Enforce lockout if max failed attempts reached
  if (record && record.count >= MAX_OTP_ATTEMPTS) {
    const mins = Math.ceil((record.resetAt - now) / 60000);
    return {
      success: false,
      error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, delivery_otp")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { success: false, error: "Order not found." };
  }

  const trimmedOtp = inputOtp.trim();
  if (!order.delivery_otp || order.delivery_otp !== trimmedOtp) {
    // Record failed attempt
    if (!record) {
      record = { count: 1, resetAt: now + OTP_LOCKOUT_MS };
    } else {
      record.count += 1;
    }
    otpAttemptMap.set(rateLimitKey, record);

    if (record.count >= MAX_OTP_ATTEMPTS) {
      const mins = Math.ceil((record.resetAt - now) / 60000);
      return {
        success: false,
        error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
      };
    }

    const remaining = MAX_OTP_ATTEMPTS - record.count;
    return {
      success: false,
      error: `Invalid Delivery OTP. Please check the 4-digit code from the buyer. (${remaining} attempt${remaining === 1 ? "" : "s"} remaining)`,
    };
  }

  // OTP matched! Reset rate limit counter and call release logic
  otpAttemptMap.delete(rateLimitKey);
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
      ),
      reviews (
        id,
        rating
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

  const { data: orders, error: ordersErr } = await supabase
    .from("orders")
    .select(`
      id,
      quantity,
      unit_price,
      total_amount,
      status,
      delivery_otp,
      delivery_confirmed_at,
      confirmed_at,
      packed_at,
      shipped_at,
      cancelled_at,
      cancellation_note,
      created_at,
      listing_id,
      buyer_id,
      listings!inner (
        id,
        name,
        unit_type,
        image_urls,
        quantity,
        profile_id
      ),
      buyers (
        delivery_address,
        profiles (
          id,
          firstname,
          lastname,
          phone
        )
      ),
      transactions (
        id,
        amount,
        sales_amount,
        delivery_fee,
        platform_fee,
        escrow_held,
        status,
        transaction_type,
        created_at,
        release_date
      )
    `)
    .eq("listings.profile_id", user.id)
    .order("created_at", { ascending: false });

  if (ordersErr) {
    console.error("Error fetching farmer orders:", ordersErr);
    return [];
  }

  return orders || [];
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

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function submitReview(payload: {
  orderId: string;
  farmerId: string;
  listingId: string;
  rating: number;
  comment: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if review already exists
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", payload.orderId)
    .single();

  if (existing) {
    return { success: false, error: "Review already submitted for this order" };
  }

  const { error } = await supabase
    .from("reviews")
    .insert({
      order_id: payload.orderId,
      buyer_id: user.id,
      farmer_id: payload.farmerId,
      listing_id: payload.listingId,
      rating: payload.rating,
      comment: payload.comment
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/marketplace");

  return { success: true };
}

export async function getFarmerAverageRating(farmerId: string): Promise<{
  average: number;
  count: number;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("farmer_id", farmerId);
    
  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const total = data.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Number((total / data.length).toFixed(1)),
    count: data.length
  };
}

// ── Farmer Order Management Actions ───────────────────────────────────────────

/**
 * Farmer confirms (accepts) an incoming order:
 *  - Updates status to 'confirmed'
 *  - Deducts listing inventory
 *  - Notifies buyer
 */
export async function confirmFarmerOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, listing_id, quantity, buyer_id")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) return { success: false, error: "Order not found." };
  if (order.status !== "processing") {
    return { success: false, error: "Order is not in a state that can be confirmed." };
  }

  const now = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status: "confirmed", confirmed_at: now })
    .eq("id", orderId);

  if (updateErr) return { success: false, error: updateErr.message };

  // Deduct listing inventory now that farmer has confirmed
  if (order.listing_id) {
    const { data: listingData } = await supabase
      .from("listings")
      .select("quantity")
      .eq("id", order.listing_id)
      .single();

    if (listingData) {
      const currentQty = Number(listingData.quantity ?? 0);
      const newQty = Math.max(0, currentQty - (order.quantity ?? 1));
      await supabase
        .from("listings")
        .update({
          quantity: newQty,
          status: newQty === 0 ? "sold" : "active",
          updated_at: now,
        })
        .eq("id", order.listing_id);
    }
  }

  // Notify buyer
  if (order.buyer_id) {
    await createNotification(
      order.buyer_id,
      "order_placed",
      "Order Confirmed! 🎉",
      "Order #" + orderId.slice(0, 8).toUpperCase() + " has been confirmed by the farmer and is being prepared."
    );
    await supabase.from("activities").insert({
      profile_id: order.buyer_id,
      activity_type: "payment_received",
      title: "Order Confirmed",
      description: "Your order #" + orderId.slice(0, 8).toUpperCase() + " has been confirmed by the farmer.",
    });
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/orders");
  revalidatePath("/my-listings");
  return { success: true };
}

/**
 * Farmer updates order status to 'packed' or 'shipped'.
 * Final delivery step is handled by OTP verification.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: "packed" | "shipped"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, buyer_id")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) return { success: false, error: "Order not found." };

  const now = new Date().toISOString();
  const updatePayload: Record<string, string> = { status: newStatus };
  if (newStatus === "packed") updatePayload.packed_at = now;
  if (newStatus === "shipped") updatePayload.shipped_at = now;

  const { error: updateErr } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId);

  if (updateErr) return { success: false, error: updateErr.message };

  const statusLabel = newStatus === "packed" ? "Packed & Ready 📦" : "Out for Delivery 🚚";
  const statusDesc =
    newStatus === "packed"
      ? "Order #" + orderId.slice(0, 8).toUpperCase() + " has been packed and is ready for dispatch."
      : "Order #" + orderId.slice(0, 8).toUpperCase() + " is out for delivery. Prepare your 4-digit OTP to confirm receipt.";

  if (order.buyer_id) {
    await createNotification(order.buyer_id, "order_placed", statusLabel, statusDesc);
    await supabase.from("activities").insert({
      profile_id: order.buyer_id,
      activity_type: "payment_received",
      title: statusLabel,
      description: statusDesc,
    });
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/orders");
  return { success: true };
}

/**
 * Farmer cancels an incoming order:
 *  - Updates status to 'cancelled'
 *  - Refunds buyer's wallet balance (full total_amount)
 *  - Voids the escrow transaction
 *  - Notifies buyer
 */
export async function cancelFarmerOrder(orderId: string, note?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, total_amount, buyer_id, listing_id, quantity, listings(profile_id)")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) return { success: false, error: "Order not found." };
  const listingProfileId = (order as any).listings?.profile_id;
  if (listingProfileId && listingProfileId !== user.id) {
    return { success: false, error: "You are not authorized to cancel this order." };
  }
  if (order.status === "delivered" || order.status === "cancelled") {
    return { success: false, error: "Order cannot be cancelled at this stage." };
  }

  const now = new Date().toISOString();

  // Restore listing inventory if order was confirmed, packed, or shipped
  if (
    order.listing_id &&
    ["confirmed", "packed", "shipped"].includes(order.status)
  ) {
    const { data: listingData } = await supabase
      .from("listings")
      .select("quantity")
      .eq("id", order.listing_id)
      .single();

    if (listingData) {
      const currentQty = Number(listingData.quantity ?? 0);
      const restoredQty = currentQty + (order.quantity ?? 1);
      await supabase
        .from("listings")
        .update({
          quantity: restoredQty,
          status: "active",
          updated_at: now,
        })
        .eq("id", order.listing_id);
    }
  }

  const { error: cancelErr } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: now,
      cancellation_note: note || "Cancelled by farmer.",
    })
    .eq("id", orderId);

  if (cancelErr) return { success: false, error: cancelErr.message };

  // Void escrow transaction
  await supabase
    .from("transactions")
    .update({
      escrow_held: false,
      status: "refunded",
      release_date: now,
    })
    .eq("order_id", orderId);

  // Refund buyer's wallet
  if (order.buyer_id && order.total_amount) {
    const refundAmt = Number(order.total_amount);

    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", order.buyer_id)
      .single();

    const currentBal = Number(buyerProfile?.wallet_balance ?? 0);
    const newBal = Number((currentBal + refundAmt).toFixed(2));

    await supabase
      .from("profiles")
      .update({ wallet_balance: newBal })
      .eq("id", order.buyer_id);

    await createNotification(
      order.buyer_id,
      "order_placed",
      "Order Cancelled — Refund Issued 💳",
      "Your order #" + orderId.slice(0, 8).toUpperCase() + " was cancelled by the farmer. GH₵ " + refundAmt.toFixed(2) + " has been refunded to your wallet."
    );
    await supabase.from("activities").insert({
      profile_id: order.buyer_id,
      activity_type: "payment_received",
      title: "Order Cancelled — Wallet Refunded",
      description: "Order #" + orderId.slice(0, 8).toUpperCase() + " cancelled. GH₵ " + refundAmt.toFixed(2) + " refunded to your wallet.",
    });
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/orders");
  revalidatePath("/finances");
  revalidatePath("/my-listings");
  return { success: true };
}

/**
 * Buyer cancels an order before farmer has accepted it (status === 'processing'):
 *  - Updates status to 'cancelled'
 *  - Restores buyer's wallet balance
 *  - Voids escrow transaction
 *  - Notifies farmer
 */
export async function cancelBuyerOrder(orderId: string, note?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, total_amount, buyer_id, listing_id, quantity, listings(name, profile_id)")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) return { success: false, error: "Order not found." };
  if (order.buyer_id !== user.id) {
    return { success: false, error: "You are not authorized to cancel this order." };
  }
  if (order.status !== "processing") {
    return {
      success: false,
      error: "Orders can only be cancelled while awaiting farmer acceptance.",
    };
  }

  const now = new Date().toISOString();

  const { error: cancelErr } = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      cancelled_at: now,
      cancellation_note: note || "Cancelled by buyer before confirmation.",
    })
    .eq("id", orderId);

  if (cancelErr) return { success: false, error: cancelErr.message };

  // Void escrow transaction
  await supabase
    .from("transactions")
    .update({
      escrow_held: false,
      status: "refunded",
      release_date: now,
    })
    .eq("order_id", orderId);

  // Refund buyer's wallet
  if (order.total_amount) {
    const refundAmt = Number(order.total_amount);

    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    const currentBal = Number(buyerProfile?.wallet_balance ?? 0);
    const newBal = Number((currentBal + refundAmt).toFixed(2));

    await supabase
      .from("profiles")
      .update({ wallet_balance: newBal })
      .eq("id", user.id);

    await supabase.from("activities").insert({
      profile_id: user.id,
      activity_type: "payment_received",
      title: "Order Cancelled — Wallet Refunded",
      description: `Order #${orderId.slice(0, 8).toUpperCase()} cancelled. GH₵ ${refundAmt.toFixed(2)} refunded to your wallet.`,
    });
  }

  // Notify farmer
  const farmerProfileId = (order as any).listings?.profile_id;
  if (farmerProfileId) {
    await createNotification(
      farmerProfileId,
      "order_placed",
      "Order Cancelled by Buyer",
      `Order #${orderId.slice(0, 8).toUpperCase()} for ${(order as any).listings?.name || "produce"} was cancelled by the buyer.`
    );
  }

  revalidatePath("/buyer/orders");
  revalidatePath("/orders");
  revalidatePath("/finances");
  return { success: true };
}
