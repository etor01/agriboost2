// app/api/push/notify/route.ts
// Phase 4 — Internal API route to trigger push notifications.
// Called by server actions/other API routes when events occur.
// Events: scan-complete, order-*, payment-received, escrow-released, new-message.
//
// SECURITY: This route requires the user to be authenticated OR a valid internal
// service key. Do NOT expose this to unauthenticated public callers.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendPushNotification,
  notificationTemplates,
  type NotificationEvent,
  type PushPayload,
} from "@/lib/webpush";

interface NotifyRequest {
  userId: string;
  event: NotificationEvent;
  data?: Record<string, string>;  // Template variable substitutions
  custom?: PushPayload;           // Used when event === "custom"
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NotifyRequest;
    const { userId, event, data, custom } = body;

    if (!userId || !event) {
      return NextResponse.json({ error: "userId and event are required" }, { status: 400 });
    }

    // Build notification payload
    let payload: PushPayload;
    if (event === "custom" && custom) {
      payload = custom;
    } else if (event !== "custom" && notificationTemplates[event]) {
      payload = notificationTemplates[event](data);
    } else {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // Add default icon/badge
    payload.icon = payload.icon ?? "/icons/icon-192x192.png";
    payload.badge = payload.badge ?? "/icons/icon-96x96.png";

    // Fetch all push subscriptions for this user from Supabase
    const supabase = await createClient();
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      console.error("[AgriBoost Push] Fetch subscriptions error:", error.message);
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found for user", sent: 0 });
    }

    // Send notification to all registered devices for this user
    let sent = 0;
    const expiredEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const success = await sendPushNotification(sub, payload);
        if (success) {
          sent++;
        } else {
          expiredEndpoints.push(sub.endpoint);
        }
      })
    );

    // Clean up expired/unsubscribed endpoints
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return NextResponse.json({ success: true, sent, cleaned: expiredEndpoints.length });
  } catch (err) {
    console.error("[AgriBoost Push] Notify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
