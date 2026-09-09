// app/buyer/shop/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BadgeCheck,
  MapPin,
  ShoppingCart,
  Sprout,
  Search,
  RefreshCw,
} from "lucide-react";
import {
  ALL_CATEGORIES,
  REGIONS_FILTER,
  type Listing,
} from "@/lib/data/marketplaceData";

import CartDrawer from "@/components/marketplace/CartDrawer";
import CheckoutModal from "@/components/marketplace/CheckoutModal";
import CategoryBar from "@/components/marketplace/CategoryBar";
import FilterBar from "@/components/marketplace/FilterBar";
import ProductCard from "@/components/marketplace/ProductCard";
import { FarmerPageHeader, FarmerEmptyState } from "@/components/farmer/ui";

const supabase = createClient();

type CartItem = { listing: Listing; qty: number };

type SupabaseListingRow = {
  id: string;
  profile_id?: string | null;
  name: string;
  quantity?: number | string | null;
  unit_type?: string | null;
  price_per_unit?: number | string | null;
  status?: string | null;
  image_urls?: string[] | null;
  rating?: number | string | null;
  reviews?: number | string | null;
  is_featured?: boolean | null;
  discount?: number | string | null;
  delivery_available?: boolean | null;
  description?: string | null;
  farmers?: {
    profiles?: {
      location?: string | null;
      verified_status?: boolean | null;
    } | null;
  } | null;
  crops?: {
    crop_type?: string | null;
    estimated_harvest_date?: string | null;
  } | null;
};

type CartRow = {
  id: string;
  listing_id: string;
  quantity: number;
};

const PER_PAGE = 24;

function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 bg-white animate-pulse">
      <div className="aspect-[4/3] bg-zinc-100" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 bg-zinc-100 rounded w-1/4" />
        <div className="h-4 bg-zinc-100 rounded w-4/5" />
        <div className="h-3 bg-zinc-100 rounded w-1/2" />
        <div className="h-7 bg-zinc-100 rounded mt-3" />
      </div>
    </div>
  );
}

export default function BuyerShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All Regions");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Get current user ────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // ── Fetch listings ───────────────────────────────────────────────
  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          id, profile_id, name, description, quantity, unit_type, price_per_unit,
          status, image_urls, rating, reviews, is_featured, discount,
          delivery_available,
          farmers!listings_profile_id_fkey (
            profiles ( location, verified_status )
          ),
          crops ( crop_type, estimated_harvest_date )
        `
        )
        .eq("status", "active");

      if (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } else if (data) {
        const formatted: Listing[] = (data as SupabaseListingRow[]).map(
          (item) => ({
            id: item.id,
            profile_id: item.profile_id || undefined,
            title: item.name,
            category: item.crops?.crop_type || "General",
            price: Number(item.price_per_unit),
            unit: item.unit_type || "unit",
            quantity_available: Number(item.quantity),
            location: item.farmers?.profiles?.location || "Unknown Location",
            is_verified: item.farmers?.profiles?.verified_status || false,
            harvest_date:
              item.crops?.estimated_harvest_date || new Date().toISOString(),
            image_urls: item.image_urls || [
              "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
            ],
            rating: Number(item.rating) || 0,
            reviews: Number(item.reviews) || 0,
            is_featured: item.is_featured || false,
            discount: Number(item.discount) || 0,
            delivery_available: item.delivery_available ?? false,
            description:
              item.description || "Fresh produce from a verified local farmer.",
            farmer_name: "Local Farmer",
            farmer_avatar: "https://i.pravatar.cc/150?img=1",
            min_order: 1,
          })
        );
        setListings(formatted);
      }
      setLoading(false);
    }
    fetchListings();
  }, []);

  // ── Load persisted cart from Supabase ───────────────────────────
  useEffect(() => {
    if (!userId || listings.length === 0) return;
    async function loadCart() {
      const { data } = await supabase
        .from("buyer_cart")
        .select("id, listing_id, quantity")
        .eq("buyer_id", userId as string);

      if (data) {
        const cartItems: CartItem[] = (data as CartRow[])
          .map((row) => {
            const listing = listings.find((l) => l.id === row.listing_id);
            return listing ? { listing, qty: row.quantity } : null;
          })
          .filter(Boolean) as CartItem[];
        setCart(cartItems);
      }
    }
    loadCart();
  }, [userId, listings]);

  // ── Persist cart change to Supabase ─────────────────────────────
  const persistCart = useCallback(
    async (updatedCart: CartItem[]) => {
      if (!userId) return;
      await supabase.from("buyer_cart").delete().eq("buyer_id", userId);
      if (updatedCart.length === 0) return;
      const rows = updatedCart.map((item) => ({
        buyer_id: userId,
        listing_id: item.listing.id,
        quantity: item.qty,
      }));
      await supabase.from("buyer_cart").insert(rows);
    },
    [userId]
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartIds = new Set(cart.map((i) => i.listing.id));

  const addToCart = (listing: Listing) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      let next: CartItem[];
      if (existing) {
        next = prev.map((i) =>
          i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        next = [...prev, { listing, qty: 1 }];
      }
      persistCart(next);
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = prev.filter((i) => i.listing.id !== id);
      persistCart(next);
      return next;
    });
  };

  const changeQty = (id: string, qty: number) => {
    setCart((prev) => {
      const next = prev.map((i) => (i.listing.id === id ? { ...i, qty } : i));
      persistCart(next);
      return next;
    });
  };

  const clearCart = useCallback(() => {
    setCart([]);
    persistCart([]);
  }, [persistCart]);

  // ── Filter + sort ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let items = listings.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);
      const matchCat = category === "All" || l.category === category;
      const matchRegion = region === "All Regions" || l.location === region;
      return matchSearch && matchCat && matchRegion;
    });

    if (sort === "price_asc") items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === "rating") items = [...items].sort((a, b) => b.rating - a.rating);
    else if (sort === "featured")
      items = [...items].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    else if (sort === "newest")
      items = [...items].sort((a, b) => b.harvest_date.localeCompare(a.harvest_date));

    return items;
  }, [listings, search, category, region, sort]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;
  const hasActiveFilters = !!search || category !== "All" || region !== "All Regions";
  const verifiedCount = listings.filter((l) => l.is_verified).length;

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setRegion("All Regions");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onQtyChange={changeQty}
          onClear={clearCart}
          onCheckout={() => {
            setCartOpen(false);
            setCheckoutOpen(true);
          }}
        />
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={clearCart}
        />
      )}

      {/* Sticky Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2 font-semibold text-xs sm:text-sm border border-emerald-500/80 active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Cart</span>
          <span className="bg-white text-emerald-800 text-[11px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Page Header */}
      <FarmerPageHeader
        badge="Marketplace"
        title="Fresh Produce Market"
        description="Browse, filter, and order directly from verified local farmers with escrow payment protection."
      />

      {/* Stats Sub-strip */}
      <div className="bg-white rounded-xl border border-zinc-200/90 py-2.5 px-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              <strong className="text-zinc-900 font-semibold">{listings.length}</strong> listings
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <strong className="text-zinc-900 font-semibold">10</strong> regions
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              <strong className="text-zinc-900 font-semibold">{verifiedCount}</strong> verified farmers
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-1.5 text-zinc-700 font-semibold hover:text-emerald-700 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-zinc-500" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="text-emerald-700 font-bold">({cartCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* Category Bar */}
      <CategoryBar
        categories={ALL_CATEGORIES}
        active={category}
        onChange={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
      />

      {/* Filter Bar & Grid */}
      <FilterBar
        search={search}
        region={region}
        sort={sort}
        regions={REGIONS_FILTER}
        filteredCount={filtered.length}
        totalCount={listings.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onRegionChange={(v) => {
          setRegion(v);
          setPage(1);
        }}
        onSortChange={(v) => {
          setSort(v);
          setPage(1);
        }}
        onClearFilters={clearFilters}
      />

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <FarmerEmptyState
            icon={Search}
            title="No produce found"
            description="Try adjusting your keyword search, category, or selected regional location."
            action={{
              label: "Clear All Filters",
              onClick: clearFilters,
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginated.map((listing) => (
                <ProductCard
                  key={listing.id}
                  listing={listing}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  inCart={cartIds.has(listing.id)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-5 py-2 bg-white border border-zinc-200 text-zinc-700 font-semibold rounded-lg hover:bg-zinc-50 transition-colors shadow-2xs text-xs"
                >
                  Load More ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

