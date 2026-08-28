// lib/idb/pushSubscription.ts
// Phase 4 — Web Push Subscription Helper (Client-side)
// Handles requesting notification permission, subscribing to push,
// and persisting the PushSubscription to the backend API.

/**
 * Convert a base64url VAPID public key to a Uint8Array for use with
 * pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Request notification permission, subscribe the service worker to Web Push,
 * and POST the resulting subscription to `/api/push/subscribe`.
 *
 * @returns `true` if successfully subscribed, `false` otherwise.
 */
export async function registerPushSubscription(): Promise<boolean> {
  // Check browser support
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[AgriBoost PWA] Push notifications not supported in this browser.");
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.info("[AgriBoost PWA] Notification permission denied.");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("[AgriBoost PWA] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
      return false;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend for storage in Supabase
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!res.ok) {
      console.error("[AgriBoost PWA] Failed to register push subscription with server.");
      return false;
    }

    console.info("[AgriBoost PWA] Push subscription registered successfully.");
    return true;
  } catch (err) {
    console.error("[AgriBoost PWA] Error registering push subscription:", err);
    return false;
  }
}

/**
 * Check if push notifications are currently enabled for this browser.
 */
export async function isPushEnabled(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  if (Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub !== null;
  } catch {
    return false;
  }
}
