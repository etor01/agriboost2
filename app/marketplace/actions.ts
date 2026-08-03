"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
 * Creates orders in Supabase, generates 4-digit Delivery OTPs,
 * and records transactions held in AgriBoost Escrow for the farmer.
 */
export async function createOrderWithEscrow(payload: CheckoutPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in to place an order." };
  }

  // Ensure buyer record exists in buyers table
  const { error: buyerErr } = await supabase
    .from("buyers")
    .upsert(
      {
        profile_id: user.id,
        delivery_address: payload.deliveryAddress,
      },
      { onConflict: "profile_id" }
    );

  if (buyerErr) {
    console.warn("Buyer profile upsert warning:", buyerErr.message);
  }

  const createdOrders: Array<{
    orderId: string;
    title: string;
    total: number;
    otp: string;
  }> = [];

  const totalItems = payload.items.length;
  // Distribute delivery fee across items proportionally or add to first item
  const feePerItem = totalItems > 0 ? payload.deliveryFee / totalItems : 0;

  for (const item of payload.items) {
    const itemSubtotal = item.price * item.qty;
    const itemTotal = Number((itemSubtotal + feePerItem).toFixed(2));
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Insert Order
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
      console.error("Error inserting order:", orderErr);
      return {
        success: false,
        error: orderErr?.message || "Failed to create order record.",
      };
    }

    // 2. Insert Transaction in Escrow (Held for Farmer)
    const { error: txErr } = await supabase.from("transactions").insert({
      order_id: orderData.id,
      profile_id: item.farmerProfileId,
      paystack_reference:
        payload.paystackRef || `ESCROW-${orderData.id.slice(0, 8).toUpperCase()}`,
      amount: itemTotal,
      service_name: `Escrow: ${item.title} (${item.qty} ${item.unit})`,
      escrow_held: true,
      status: "pending",
    });

    if (txErr) {
      console.error("Error creating escrow transaction:", txErr);
    }

    // 3. Log Activity for Buyer
    await supabase.from("activities").insert({
      profile_id: user.id,
      activity_type: "payment_received",
      title: "Order Placed (Escrow Protected)",
      description: `Order #${orderData.id.slice(0, 8).toUpperCase()} for ${item.qty} ${item.unit} of ${item.title} placed. GH₵ ${itemTotal.toFixed(2)} held in AgriBoost Escrow.`,
    });

    // 4. Log Activity for Farmer
    if (item.farmerProfileId) {
      await supabase.from("activities").insert({
        profile_id: item.farmerProfileId,
        activity_type: "payment_received",
        title: "New Produce Order Received",
        description: `New order for ${item.qty} ${item.unit} of ${item.title}. GH₵ ${itemTotal.toFixed(2)} is locked in escrow until delivery is confirmed.`,
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
    message: "Your payment is securely held in AgriBoost Escrow!",
  };
}

/**
 * Confirm delivery and release escrow funds to the farmer's payout balance.
 */
export async function confirmDeliveryAndReleaseEscrow(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // 1. Verify order exists
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

  // 2. Update order status
  const now = new Date().toISOString();
  const { error: updateOrderErr } = await supabase
    .from("orders")
    .update({
      status: "delivered",
      delivery_confirmed_at: now,
    })
    .eq("id", orderId);

  if (updateOrderErr) {
    return {
      success: false,
      error: updateOrderErr.message || "Failed to update order status.",
    };
  }

  // 3. Release escrow transaction to completed
  const { data: txList, error: txErr } = await supabase
    .from("transactions")
    .update({
      escrow_held: false,
      status: "completed",
      release_date: now,
      farmer_payout_date: now,
    })
    .eq("order_id", orderId)
    .select("profile_id, amount, service_name");

  if (txErr) {
    console.error("Error releasing escrow transaction:", txErr);
  }

  // 4. Notify farmer via activity log
  if (txList && txList.length > 0) {
    const tx = txList[0];
    if (tx.profile_id) {
      await supabase.from("activities").insert({
        profile_id: tx.profile_id,
        activity_type: "payment_received",
        title: "Escrow Released! 💰",
        description: `Delivery confirmed for Order #${orderId.slice(0, 8).toUpperCase()}. GH₵ ${Number(tx.amount).toFixed(2)} has been released to your available payout balance!`,
      });
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

  // Fetch transactions where farmer is profile_id and order_id is not null
  const { data: txs, error: txErr } = await supabase
    .from("transactions")
    .select(`
      id,
      order_id,
      amount,
      escrow_held,
      status,
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
 * Get farmer's escrow summary (Total in Escrow, Available Payout, Total Earned).
 */
export async function getFarmerEscrowSummary() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalEscrow: 0,
      availablePayout: 0,
      totalEarned: 0,
    };
  }

  const { data: txList, error } = await supabase
    .from("transactions")
    .select("amount, escrow_held, status")
    .eq("profile_id", user.id);

  if (error || !txList) {
    return {
      totalEscrow: 0,
      availablePayout: 0,
      totalEarned: 0,
    };
  }

  let totalEscrow = 0;
  let availablePayout = 0;
  let totalEarned = 0;

  for (const tx of txList) {
    const amt = Number(tx.amount) || 0;
    if (tx.escrow_held && tx.status !== "completed") {
      totalEscrow += amt;
    } else if (tx.status === "completed") {
      availablePayout += amt;
      totalEarned += amt;
    }
  }

  return {
    totalEscrow,
    availablePayout,
    totalEarned,
  };
}
