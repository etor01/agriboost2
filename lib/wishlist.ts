// lib/wishlist.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Listing } from "@/lib/data/marketplaceData";

export interface WishlistItem {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  delivery_available: boolean;
  added_at?: string;
}

const WISHLIST_KEY_PREFIX = "agriboost_wishlist_";
const DEFAULT_KEY = "agriboost_wishlist_guest";
const WISHLIST_EVENT = "agriboost-wishlist-change";

/**
 * Gets the localStorage key for the given user ID (or default guest).
 */
export function getWishlistKey(userId?: string | null): string {
  if (userId && userId.trim() !== "") {
    return `${WISHLIST_KEY_PREFIX}${userId}`;
  }
  return DEFAULT_KEY;
}

/**
 * Helper to convert any Listing (or partial item) to a WishlistItem.
 */
export function normalizeToWishlistItem(
  item: Listing | WishlistItem
): WishlistItem {
  if ("farmer" in item && "image" in item) {
    // Already a WishlistItem
    return item as WishlistItem;
  }
  const listing = item as Listing;
  return {
    id: listing.id,
    title: listing.title,
    category: listing.category || "General",
    price: Number(listing.price) || 0,
    unit: listing.unit || "unit",
    farmer: listing.farmer_name || "Local Farmer",
    location: listing.location || "Unknown Location",
    rating: Number(listing.rating) || 0,
    reviews: Number(listing.reviews) || 0,
    image:
      listing.image_urls?.[0] ||
      "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
    delivery_available: Boolean(listing.delivery_available),
    added_at: new Date().toISOString(),
  };
}

/**
 * Retrieves the current wishlist for a user from localStorage.
 */
export function getWishlistFromStorage(
  userId?: string | null
): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getWishlistKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId && userId.trim() !== "") {
        const guestRaw = localStorage.getItem(DEFAULT_KEY);
        if (guestRaw) {
          try {
            const guestItems = JSON.parse(guestRaw);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              localStorage.setItem(key, guestRaw);
              localStorage.removeItem(DEFAULT_KEY);
              return guestItems;
            }
          } catch {
            // ignore
          }
        }
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading wishlist from localStorage:", e);
    return [];
  }
}

/**
 * Saves a wishlist to localStorage for a user and dispatches change event.
 */
export function saveWishlistToStorage(
  items: WishlistItem[],
  userId?: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    const key = getWishlistKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent(WISHLIST_EVENT, { detail: { userId, items } })
    );
  } catch (e) {
    console.error("Error saving wishlist to localStorage:", e);
  }
}

/**
 * Fetches user's wishlist from Supabase database table `wishlist_items`.
 */
export async function fetchWishlistFromDb(
  userId: string
): Promise<WishlistItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("listing_id, listing_snapshot, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("Error fetching wishlist from DB:", error);
      return [];
    }

    return data.map((row: any) => {
      if (row.listing_snapshot && typeof row.listing_snapshot === "object") {
        return {
          ...row.listing_snapshot,
          id: row.listing_id || row.listing_snapshot.id,
          added_at: row.created_at || row.listing_snapshot.added_at,
        };
      }
      return {
        id: row.listing_id,
        title: "Saved Item",
        category: "General",
        price: 0,
        unit: "unit",
        farmer: "Local Farmer",
        location: "Unknown Location",
        rating: 0,
        reviews: 0,
        image: "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
        delivery_available: false,
        added_at: row.created_at,
      };
    });
  } catch (e) {
    console.error("Failed to fetch wishlist from DB:", e);
    return [];
  }
}

/**
 * Migrates guest items in localStorage to Supabase database table `wishlist_items`.
 */
export async function migrateGuestWishlistToDb(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const guestRaw = localStorage.getItem(DEFAULT_KEY);
  if (!guestRaw) return;

  try {
    const guestItems: WishlistItem[] = JSON.parse(guestRaw);
    if (Array.isArray(guestItems) && guestItems.length > 0) {
      const supabase = createClient();
      const rowsToInsert = guestItems.map((item) => ({
        profile_id: userId,
        listing_id: item.id,
        listing_snapshot: item,
      }));

      await supabase
        .from("wishlist_items")
        .upsert(rowsToInsert, { onConflict: "profile_id, listing_id" });

      localStorage.removeItem(DEFAULT_KEY);
    }
  } catch (e) {
    console.error("Error migrating guest wishlist to DB:", e);
  }
}

/**
 * Checks if an item is in the wishlist.
 */
export function isItemInWishlist(id: string, userId?: string | null): boolean {
  const items = getWishlistFromStorage(userId);
  return items.some((item) => item.id === id);
}

/**
 * Adds an item to the wishlist if not already present.
 */
export function addItemToWishlist(
  item: Listing | WishlistItem,
  userId?: string | null
): WishlistItem[] {
  const items = getWishlistFromStorage(userId);
  const normalized = normalizeToWishlistItem(item);
  if (!items.some((i) => i.id === normalized.id)) {
    const next = [normalized, ...items];
    saveWishlistToStorage(next, userId);
    return next;
  }
  return items;
}

/**
 * Removes an item from the wishlist by ID.
 */
export function removeItemFromWishlist(
  id: string,
  userId?: string | null
): WishlistItem[] {
  const items = getWishlistFromStorage(userId);
  const next = items.filter((i) => i.id !== id);
  saveWishlistToStorage(next, userId);
  return next;
}

/**
 * Toggles an item in the wishlist. Returns { inWishlist: boolean, items: WishlistItem[] }.
 */
export function toggleItemInWishlist(
  item: Listing | WishlistItem,
  userId?: string | null
): {
  inWishlist: boolean;
  items: WishlistItem[];
} {
  const items = getWishlistFromStorage(userId);
  const exists = items.some((i) => i.id === item.id);
  if (exists) {
    const next = removeItemFromWishlist(item.id, userId);
    return { inWishlist: false, items: next };
  } else {
    const next = addItemToWishlist(item, userId);
    return { inWishlist: true, items: next };
  }
}

/**
 * Clears all items in the user's wishlist.
 */
export function clearUserWishlist(userId?: string | null): void {
  saveWishlistToStorage([], userId);
}

/**
 * React Hook for managing the user's wishlist synchronized with Supabase DB & localStorage.
 */
export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncWishlist = useCallback(async (uid: string | null) => {
    setLoading(true);
    if (uid && uid.trim() !== "") {
      // 1. Migrate any guest items saved before logging in
      await migrateGuestWishlistToDb(uid);
      // 2. Fetch DB wishlist
      const dbItems = await fetchWishlistFromDb(uid);
      setWishlist(dbItems);
      saveWishlistToStorage(dbItems, uid);
    } else {
      // Guest mode
      const guestItems = getWishlistFromStorage(null);
      setWishlist(guestItems);
    }
    setLoading(false);
  }, []);

  // Load current user & sync wishlist from Supabase
  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (active) {
          const uid = user?.id ?? null;
          setUserId(uid);
          await syncWishlist(uid);
        }
      } catch (e) {
        if (active) {
          setUserId(null);
          setWishlist(getWishlistFromStorage(null));
          setLoading(false);
        }
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (active) {
        const uid = session?.user?.id ?? null;
        setUserId(uid);
        await syncWishlist(uid);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [syncWishlist]);

  // Sync with window events and storage events
  useEffect(() => {
    const handleWishlistChange = () => {
      setWishlist(getWishlistFromStorage(userId));
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === getWishlistKey(userId)) {
        setWishlist(getWishlistFromStorage(userId));
      }
    };
    window.addEventListener(WISHLIST_EVENT, handleWishlistChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleWishlistChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [userId]);

  const isSaved = useCallback(
    (id: string) => wishlist.some((item) => item.id === id),
    [wishlist]
  );

  const toggleSave = useCallback(
    (item: Listing | WishlistItem) => {
      const normalized = normalizeToWishlistItem(item);
      const exists = wishlist.some((i) => i.id === normalized.id);
      const next = exists
        ? wishlist.filter((i) => i.id !== normalized.id)
        : [normalized, ...wishlist];

      setWishlist(next);
      saveWishlistToStorage(next, userId);

      if (userId) {
        const supabase = createClient();
        if (exists) {
          supabase
            .from("wishlist_items")
            .delete()
            .eq("profile_id", userId)
            .eq("listing_id", normalized.id)
            .then(({ error }) => {
              if (error) console.error("Failed to delete wishlist item from DB:", error);
            });
        } else {
          supabase
            .from("wishlist_items")
            .upsert(
              {
                profile_id: userId,
                listing_id: normalized.id,
                listing_snapshot: normalized,
              },
              { onConflict: "profile_id, listing_id" }
            )
            .then(({ error }) => {
              if (error) console.error("Failed to upsert wishlist item to DB:", error);
            });
        }
      }

      return !exists;
    },
    [wishlist, userId]
  );

  const removeSave = useCallback(
    (id: string) => {
      const next = wishlist.filter((i) => i.id !== id);
      setWishlist(next);
      saveWishlistToStorage(next, userId);

      if (userId) {
        const supabase = createClient();
        supabase
          .from("wishlist_items")
          .delete()
          .eq("profile_id", userId)
          .eq("listing_id", id)
          .then(({ error }) => {
            if (error) console.error("Failed to remove wishlist item from DB:", error);
          });
      }
    },
    [wishlist, userId]
  );

  const clearAll = useCallback(() => {
    setWishlist([]);
    saveWishlistToStorage([], userId);

    if (userId) {
      const supabase = createClient();
      supabase
        .from("wishlist_items")
        .delete()
        .eq("profile_id", userId)
        .then(({ error }) => {
          if (error) console.error("Failed to clear wishlist from DB:", error);
        });
    }
  }, [userId]);

  return {
    wishlist,
    isSaved,
    toggleSave,
    removeSave,
    clearAll,
    userId,
    loading,
  };
}

