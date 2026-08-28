// lib/idb/syncQueue.ts
// Phase 5 — Background Sync Queue (Disease Scans Only)
// When a farmer submits an AI scan while offline, the scan payload is queued here.
// The service worker (or an `online` event fallback) processes the queue when
// connectivity is restored.

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SyncQueueItem {
  id: string;            // local UUID (crypto.randomUUID)
  type: "disease-scan";
  payload: {
    imageBase64: string; // the base64-encoded crop image
    cropName?: string;   // optional crop name pre-fill
  };
  createdAt: string;     // ISO timestamp
  retries: number;       // number of failed send attempts
}

// ── Schema ────────────────────────────────────────────────────────────────────

interface SyncQueueDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-type": string };
  };
}

// ── DB Singleton ──────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<SyncQueueDB>> | null = null;

function getDB(): Promise<IDBPDatabase<SyncQueueDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SyncQueueDB>("agriboost-sync-queue", 1, {
      upgrade(db) {
        const store = db.createObjectStore("syncQueue", { keyPath: "id" });
        store.createIndex("by-type", "type");
      },
    });
  }
  return dbPromise;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Add a disease scan to the pending sync queue.
 */
export async function enqueueDiseaseScan(payload: SyncQueueItem["payload"]): Promise<string> {
  const db = await getDB();
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    type: "disease-scan",
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  await db.put("syncQueue", item);
  return item.id;
}

/**
 * Get all pending disease scans from the queue.
 */
export async function getPendingScans(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-type", "disease-scan");
}

/**
 * Remove a successfully synced item from the queue.
 */
export async function removeSyncItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

/**
 * Increment retry counter for a failed item.
 * After 5 retries, the item is removed to prevent infinite loops.
 */
export async function incrementRetry(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get("syncQueue", id);
  if (!item) return;
  if (item.retries >= 4) {
    await db.delete("syncQueue", id); // give up after 5 total attempts
  } else {
    await db.put("syncQueue", { ...item, retries: item.retries + 1 });
  }
}

/**
 * Count all pending items in the queue.
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDB();
  return db.count("syncQueue");
}
