// app/marketplace/MarketplaceClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BadgeCheck,
  MapPin,
  RefreshCw,
  ShoppingCart,
  Sprout,
  Search,
} from "lucide-react";
import {
  ALL_CATEGORIES,
  REGIONS_FILTER,
  type Listing,
} from "@/lib/data/marketplaceData";

// ── Component imports ───────────────────────────────────────────────
import CartDrawer from "@/components/marketplace/CartDrawer";
import CheckoutModal from "@/components/marketplace/CheckoutModal";
import CategoryBar from "@/components/marketplace/CategoryBar";
import FilterBar from "@/components/marketplace/FilterBar";
import ProductCard from "@/components/marketplace/ProductCard";
import { FarmerBadge, FarmerEmptyState } from "@/components/farmer/ui";

const supabase = createClient();

// ── Types ───────────────────────────────────────────────────────────
type CartItem = { listing: Listing; qty: number };

type SupabaseListingRow = {
  id: string;
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
  created_at?: string | null;
  farmers?: {
    profiles?: {
      location?: string | null;
      verified_status?: boolean | null;
      firstname?: string | null;
      lastname?: string | null;
    } | null;
  } | null;
  crops?: {
    crop_type?: string | null;
    estimated_harvest_date?: string | null;
  } | null;
};

const PER_PAGE = 24;

// ── Loading Skeleton ────────────────────────────────────────────────
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

// ── Main Component ──────────────────────────────────────────────────
export default function MarketplaceClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category");
  const regionParam = searchParams.get("region");
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "featured";

  const category = categoryParam
    ? ALL_CATEGORIES.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      ) || categoryParam
    : "All";

  const region = regionParam
    ? REGIONS_FILTER.find(
        (r) => r.toLowerCase() === regionParam.toLowerCase()
      ) || regionParam
    : "All Regions";

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const setFilter = (key: string, value: string) => {
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    const valLower = value.trim().toLowerCase();
    if (
      !value ||
      valLower === "all" ||
      valLower === "all regions" ||
      (key === "sort" && valLower === "featured")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  // ── Data fetch with server-side pagination & filtering ────────────
  useEffect(() => {
    let isMounted = true;

    async function fetchListings() {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const farmersSelect =
        region !== "All Regions"
          ? "farmers!listings_profile_id_fkey!inner(profiles!inner(location, verified_status, firstname, lastname))"
          : "farmers!listings_profile_id_fkey(profiles(location, verified_status, firstname, lastname))";

      const cropsSelect =
        category !== "All"
          ? "crops!inner(crop_type, estimated_harvest_date)"
          : "crops(crop_type, estimated_harvest_date)";

      let query = supabase
        .from("listings")
        .select(
          `
          id,
          name,
          description,
          quantity,
          unit_type,
          price_per_unit,
          status,
          image_urls,
          rating,
          reviews,
          is_featured,
          discount,
          delivery_available,
          created_at,
          ${farmersSelect},
          ${cropsSelect}
        `,
          { count: "exact" }
        )
        .eq("status", "active");

      if (search.trim()) {
        query = query.ilike("name", `%${search.trim()}%`);
      }

      if (category !== "All") {
        query = query.eq("crops.crop_type", category);
      }

      if (region !== "All Regions") {
        query = query.eq("farmers.profiles.location", region);
      }

      if (sort === "price_asc") {
        query = query.order("price_per_unit", { ascending: true });
      } else if (sort === "price_desc") {
        query = query.order("price_per_unit", { ascending: false });
      } else if (sort === "rating") {
        query = query.order("rating", { ascending: false });
      } else if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
      }

      const from = (page - 1) * PER_PAGE;
      const to = page * PER_PAGE - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (!isMounted) return;

      if (error) {
        console.error("Error fetching listings:", error);
        if (page === 1) {
          setListings([]);
          setTotalCount(0);
        }
      } else if (data) {
        const formattedListings: Listing[] = (data as SupabaseListingRow[]).map(
          (item) => {
            const profile = item.farmers?.profiles;
            const farmerName = profile
              ? [profile.firstname, profile.lastname].filter(Boolean).join(" ")
              : "";
            return {
              id: item.id,
              title: item.name,
              category: item.crops?.crop_type || "General",
              price: Number(item.price_per_unit),
              unit: item.unit_type || "unit",
              quantity_available: Number(item.quantity),
              location: profile?.location || "Unknown Location",
              is_verified: profile?.verified_status || false,
              harvest_date:
                item.crops?.estimated_harvest_date ||
                item.created_at ||
                new Date().toISOString(),
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
              farmer_name: farmerName || "Local Farmer",
              farmer_avatar: "https://i.pravatar.cc/150?img=1",
              min_order: 1,
            };
          }
        );

        if (page === 1) {
          setListings(formattedListings);
        } else {
          setListings((prev) => [...prev, ...formattedListings]);
        }

        if (count !== null) {
          setTotalCount(count);
        }
      }

      setLoading(false);
      setLoadingMore(false);
    }

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [page, search, category, region, sort]);

  // ── Cart helpers ──────────────────────────────────────────────────
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartIds = new Set(cart.map((i) => i.listing.id));

  const addToCart = (listing: Listing) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      if (existing)
        return prev.map((i) =>
          i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { listing, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.listing.id !== id));

  const changeQty = (id: string, qty: number) =>
    setCart((prev) =>
      prev.map((i) => (i.listing.id === id ? { ...i, qty } : i))
    );

  const clearCart = () => {
    setCart([]);
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
      category !== "All" ||
      region !== "All Regions" ||
      sort !== "featured"
  );

  const clearFilters = () => {
    setPage(1);
    router.push(pathname, { scroll: false });
  };

  const hasMore = listings.length < totalCount;
  const verifiedCount = listings.filter((l) => l.is_verified).length;

  return (
    <div className="min-h-screen bg-zinc-50/50">
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
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium text-xs sm:text-sm border border-emerald-500"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>Cart</span>
          <span className="bg-white text-emerald-800 text-[11px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* ── Stats Sub-header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-zinc-200 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              <strong className="text-zinc-900 font-semibold">{totalCount}</strong>{" "}
              listings
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <strong className="text-zinc-900 font-semibold">10</strong> regions
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              <strong className="text-zinc-900 font-semibold">{verifiedCount}</strong>{" "}
              verified
            </span>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-1.5 text-zinc-700 font-semibold hover:text-zinc-900 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-zinc-500" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="text-emerald-700 font-bold">({cartCount})</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Category Bar ──────────────────────────────────────────── */}
      <CategoryBar
        categories={ALL_CATEGORIES}
        active={category}
        onChange={(cat) => setFilter("category", cat)}
      />

      {/* ── Main Listings Area ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Filter bar */}
        <FilterBar
          search={search}
          region={region}
          sort={sort}
          regions={REGIONS_FILTER}
          filteredCount={listings.length}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={(v) => setFilter("q", v)}
          onRegionChange={(v) => setFilter("region", v)}
          onSortChange={(v) => setFilter("sort", v)}
          onClearFilters={clearFilters}
        />

        {/* Product Grid */}
        <div className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <FarmerEmptyState
              icon={Search}
              title="No produce listings found"
              description="Try adjusting your search criteria, crop category, or selected region."
              action={{
                label: "Clear All Filters",
                onClick: clearFilters,
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((listing) => (
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
                    disabled={loadingMore}
                    className="px-5 py-2 bg-white border border-zinc-200 text-zinc-700 font-medium rounded-md hover:bg-zinc-50 transition-colors shadow-2xs text-xs disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-500" />
                        <span>Loading more listings…</span>
                      </>
                    ) : (
                      <span>Load More ({totalCount - listings.length} remaining)</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


