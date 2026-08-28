// lib/webpush.ts
// Phase 4 — Server-Side Web Push Notification Helper
// Used by API routes to send push notifications to subscribed users.
// Events covered: AI scan complete, order updates, messages, payment events.

import webpush from "web-push";

// ── VAPID Initialization ──────────────────────────────────────────────────────
// Generate keys once with: npx web-push generate-vapid-keys
// Then set in .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
//   VAPID_PRIVATE_KEY=...

webpush.setVapidDetails(
  "mailto:admin@agriboost.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// ── Notification Payload Types ────────────────────────────────────────────────

export type NotificationEvent =
  | "scan-complete"
  | "order-placed"
  | "order-confirmed"
  | "order-delivered"
  | "escrow-released"
  | "payment-received"
  | "new-message"
  | "custom";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;          // Deep-link: click notification → navigate here
  icon?: string;         // Override default app icon
  badge?: string;        // Small icon shown in notification bar (Android)
  tag?: string;          // Allows replacing an existing notification with the same tag
  event?: NotificationEvent;
}

export interface StoredSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// ── Notification Templates ────────────────────────────────────────────────────
// Pre-built payloads for each event type to ensure consistent messaging.

export const notificationTemplates: Record<
  Exclude<NotificationEvent, "custom">,
  (data?: Record<string, string>) => PushPayload
> = {
  "scan-complete": (data) => ({
    title: "🌿 AI Scan Complete",
    body: data?.cropName
      ? `Your ${data.cropName} scan is ready. Tap to view the diagnosis.`
      : "Your crop scan result is ready. Tap to view.",
    url: "/ai-center",
    tag: "scan-complete",
    event: "scan-complete",
  }),
  "order-placed": (data) => ({
    title: "🛒 New Order Received",
    body: data?.productName
      ? `A buyer placed an order for your ${data.productName}.`
      : "You have a new order. Tap to review.",
    url: "/orders",
    tag: "order-placed",
    event: "order-placed",
  }),
  "order-confirmed": (data) => ({
    title: "✅ Order Confirmed",
    body: data?.productName
      ? `Your order for ${data.productName} has been confirmed.`
      : "Your order has been confirmed by the seller.",
    url: "/orders",
    tag: "order-confirmed",
    event: "order-confirmed",
  }),
  "order-delivered": (data) => ({
    title: "📦 Order Delivered",
    body: "Your order has been marked as delivered. Please confirm receipt.",
    url: "/orders",
    tag: "order-delivered",
    event: "order-delivered",
  }),
  "escrow-released": (data) => ({
    title: "💰 Payment Released",
    body: data?.amount
      ? `GHS ${data.amount} has been released from escrow to your wallet.`
      : "Your escrow payment has been released. Check your wallet.",
    url: "/finances",
    tag: "escrow-released",
    event: "escrow-released",
  }),
  "payment-received": (data) => ({
    title: "💳 Payment Received",
    body: data?.amount
      ? `GHS ${data.amount} has been added to your AgriBoost wallet.`
      : "A payment has been received into your wallet.",
    url: "/finances",
    tag: "payment-received",
    event: "payment-received",
  }),
  "new-message": (data) => ({
    title: `💬 New Message${data?.senderName ? ` from ${data.senderName}` : ""}`,
    body: data?.preview ?? "You have a new message. Tap to read.",
    url: "/dashboard",
    tag: "new-message",
    event: "new-message",
  }),
};

// ── Core Send Function ────────────────────────────────────────────────────────

/**
 * Send a push notification to a single stored subscription.
 * Returns `true` on success, `false` on expiry/unsubscription (subscription should be deleted).
 */
export async function sendPushNotification(
  subscription: StoredSubscription,
  payload: PushPayload
): Promise<boolean> {
  const pushSubscription: webpush.PushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    // 410 Gone or 404 Not Found = subscription no longer valid
    if (status === 410 || status === 404) {
      return false; // Caller should delete this subscription from DB
    }
    console.error("[AgriBoost WebPush] Send error:", err);
    return false;
  }
}
