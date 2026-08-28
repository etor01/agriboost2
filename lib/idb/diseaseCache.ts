// lib/idb/diseaseCache.ts
// Phase 3 — Offline IndexedDB Cache for AI Disease Scan History
// Allows farmers to view their past scans without internet connectivity.

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CachedDiseaseScan {
  id: string;            // Supabase record UUID (or local temp UUID if pending)
  profileId: string;     // Supabase user UUID
  cropName: string;
  diseaseName: string | null;
  isHealthy: boolean | null;
  confidence: string | null;
  imageUrl: string | null;
  diagnosis: string | null;
  healthyPractices: string[];
  createdAt: string;     // ISO timestamp
  fromCache?: boolean;   // true when loaded from IndexedDB instead of Supabase
}

// ── IndexedDB Schema ─────────────────────────────────────────────────────────

interface AgriBoostDB extends DBSchema {
  diseaseScans: {
    key: string; // scan.id
    value: CachedDiseaseScan;
    indexes: { "by-date": string; "by-profile": string };
  };
}

// ── DB Singleton ─────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<AgriBoostDB>> | null = null;

function getDB(): Promise<IDBPDatabase<AgriBoostDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AgriBoostDB>("agriboost-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("diseaseScans", { keyPath: "id" });
        store.createIndex("by-date", "createdAt");
        store.createIndex("by-profile", "profileId");
      },
    });
  }
  return dbPromise;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Write (or overwrite) a scan record to the local IndexedDB cache.
 */
export async function cacheScan(scan: CachedDiseaseScan): Promise<void> {
  const db = await getDB();
  await db.put("diseaseScans", { ...scan, fromCache: false });
}

/**
 * Retrieve the N most-recent scans for a user from the local cache.
 * Returns records marked with `fromCache: true` so the UI can show an indicator.
 */
export async function getCachedScans(
  profileId: string,
  limit = 20
): Promise<CachedDiseaseScan[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("diseaseScans", "by-profile", profileId);
  return all
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((s) => ({ ...s, fromCache: true }));
}

/**
 * Purge the oldest records, keeping only `keepCount` most-recent scans per user.
 * Call this after writing new scans to prevent unbounded growth.
 */
export async function pruneOldScans(
  profileId: string,
  keepCount = 50
): Promise<void> {
  const db = await getDB();
  const all = await db.getAllFromIndex("diseaseScans", "by-profile", profileId);
  const sorted = all.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const toDelete = sorted.slice(keepCount);
  const tx = db.transaction("diseaseScans", "readwrite");
  await Promise.all(toDelete.map((s) => tx.store.delete(s.id)));
  await tx.done;
}

/**
 * Remove a single scan from the local cache by its ID.
 */
export async function removeCachedScan(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("diseaseScans", id);
}
