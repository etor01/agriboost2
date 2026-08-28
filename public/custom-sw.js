// public/custom-sw.js
// AgriBoost Custom Service Worker Extension
// Phases 4 & 5: Push Notifications + Background Sync
//
// This file is loaded by next-pwa via the `customWorkerSrc` option in next.config.ts.
// It is MERGED with the Workbox-generated sw.js, not a replacement.
// All standard caching (assets, pages, images) is handled by Workbox automatically.

// ── Phase 4: Push Notification Handler ───────────────────────────────────────

/**
 * Handle incoming push messages sent via the Web Push API.
 * The payload must be JSON: { title, body, url, icon, badge, tag }
 */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "AgriBoost", body: event.data.text() };
  }

  const options = {
    body: data.body ?? "You have a new notification from AgriBoost.",
    icon: data.icon ?? "/icons/icon-192x192.png",
    badge: data.badge ?? "/icons/icon-96x96.png",
    tag: data.tag ?? "agriboost-default",
    data: { url: data.url ?? "/dashboard" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "AgriBoost", options)
  );
});

/**
 * Handle notification click events.
 * Opens the app at the URL stored in notification.data.url,
 * or focuses an existing open window if one exists.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing window if one is open at the target URL
        for (const client of clients) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── Phase 5: Background Sync — Disease Scan Queue ────────────────────────────

/**
 * Handle the Background Sync event for queued offline disease scans.
 * When connectivity is restored, the browser fires 'sync' events for
 * each registered tag. We process the IndexedDB queue here.
 *
 * NOTE: Background Sync is a Chrome/Android feature. iOS Safari does not
 * support SyncManager. An `online` event fallback handles iOS — see ai-center page.
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-disease-scans") {
    event.waitUntil(syncDiseaseScans());
  }
});

/**
 * Open the agriboost-sync-queue IndexedDB and process all pending disease scan items.
 * On success, the item is removed from the queue.
 * On failure, the retry counter is incremented (handled by the idb helper on next trigger).
 */
async function syncDiseaseScans() {
  // We open IndexedDB directly in the SW context (no idb wrapper available here)
  const db = await openSyncQueueDB();
  if (!db) return;

  const items = await getAllFromStore(db, "syncQueue");

  for (const item of items) {
    if (item.type !== "disease-scan") continue;

    try {
      const response = await fetch("/api/detectDisease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        // Remove from queue on success
        await deleteFromStore(db, "syncQueue", item.id);

        // Notify the user via push that their queued scan completed
        self.registration.showNotification("🌿 Offline Scan Uploaded", {
          body: "Your crop scan has been uploaded and analysed. Tap to view results.",
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-96x96.png",
          tag: "sync-complete",
          data: { url: "/ai-center" },
        });
      } else {
        await incrementRetryInStore(db, item);
      }
    } catch {
      await incrementRetryInStore(db, item);
    }
  }
}

// ── Minimal IndexedDB helpers for SW context (no idb library available) ──────

function openSyncQueueDB() {
  return new Promise((resolve) => {
    const req = indexedDB.open("agriboost-sync-queue", 1);
    req.onerror = () => resolve(null);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("syncQueue")) {
        const store = db.createObjectStore("syncQueue", { keyPath: "id" });
        store.createIndex("by-type", "type", { unique: false });
      }
    };
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onerror = () => resolve([]);
    req.onsuccess = () => resolve(req.result);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

function incrementRetryInStore(db, item) {
  return new Promise((resolve) => {
    const tx = db.transaction("syncQueue", "readwrite");
    const store = tx.objectStore("syncQueue");
    if (item.retries >= 4) {
      store.delete(item.id); // give up after 5 total attempts
    } else {
      store.put({ ...item, retries: (item.retries || 0) + 1 });
    }
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}
