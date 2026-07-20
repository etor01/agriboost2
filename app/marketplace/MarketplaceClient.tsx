"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  BadgeCheck,
  Check,
  MapPin,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  Star,
  Truck,
} from "lucide-react";
import {
  ALL_CATEGORIES,
  REGIONS_FILTER,
  type Listing,
} from "@/lib/data/marketplaceData";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
  farmer_name?: string | null;
  farmer_avatar?: string | null;
  min_order?: number | string | null;
  profiles?: {
    location?: string | null;
    verified_status?: boolean | null;
  } | null;
  crops?: {
    crop_type?: string | null;
    estimated_harvest_date?: string | null;
  } | null;
};

// ── Icons ──────────────────────────────────────────────────────────
const SearchIcon = (p: React.SVGProps<SVGSVGElement>) => <Search {...p} />;
const MapPinIcon = (p: React.SVGProps<SVGSVGElement>) => <MapPin {...p} />;
const StarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <Star {...p} fill="currentColor" stroke="none" />
);
const CartIcon = (p: React.SVGProps<SVGSVGElement>) => <ShoppingCart {...p} />;
const TruckIcon = (p: React.SVGProps<SVGSVGElement>) => <Truck {...p} />;
const FilterIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <SlidersHorizontal {...p} />
);
const CheckIcon = (p: React.SVGProps<SVGSVGElement>) => <Check {...p} />;

// ── Cart Types ─────────────────────────────────────────────────────
type CartItem = { listing: Listing; qty: number };

// ── Star Rating ────────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <StarIcon
        key={s}
        className={`h-3 w-3 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

// ── Cart Drawer ────────────────────────────────────────────────────
const CartDrawer = ({
  cart,
  onClose,
  onRemove,
  onQtyChange,
}: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
}) => {
  const total = cart.reduce((s, i) => s + i.listing.price * i.qty, 0);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Your Cart ({cart.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-2xl font-light"
          >
            &times;
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <CartIcon className="h-16 w-16 opacity-30" />
            <p className="text-lg font-medium">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.listing.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
                >
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.listing.image_urls[0]}
                      alt={item.listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {item.listing.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.listing.location}
                    </p>
                    <p className="text-emerald-600 font-bold text-sm mt-1">
                      GH₵{item.listing.price.toFixed(2)} / {item.listing.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          onQtyChange(
                            item.listing.id,
                            Math.max(1, item.qty - 1),
                          )
                        }
                        className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          onQtyChange(item.listing.id, item.qty + 1)
                        }
                        className="h-6 w-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.listing.id)}
                        className="ml-auto text-xs text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="text-emerald-600">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-3">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>
              <button className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
                Proceed to Checkout
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Product Card ───────────────────────────────────────────────────
const ProductCard = ({
  listing,
  onAddToCart,
  inCart,
}: {
  listing: Listing;
  onAddToCart: (l: Listing) => void;
  inCart: boolean;
}) => {
  const discountedPrice = listing.discount
    ? listing.price * (1 - listing.discount / 100)
    : null;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100">
      {/* Image */}
      <Link
        href={`/marketplace/${encodeURIComponent(listing.id)}`}
        className="block relative h-44 overflow-hidden bg-gray-100"
      >
        <Image
          src={listing.image_urls[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {listing.is_featured && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
          {listing.discount && (
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
              {listing.discount}% OFF
            </span>
          )}
        </div>
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <BadgeCheck className="h-3.5 w-3.5" />
          In Stock
        </span>
        {listing.delivery_available && (
          <span className="absolute bottom-2.5 left-2.5 text-xs font-semibold bg-white/90 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TruckIcon className="h-3 w-3" /> Delivery
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-4">
        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
          {listing.category}
        </span>
        <Link href={`/marketplace/${encodeURIComponent(listing.id)}`}>
          <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1.5">
          <StarRating rating={listing.rating} />
          <span className="text-xs text-gray-400">({listing.reviews})</span>
        </div>

        <div className="flex items-center mt-1.5 text-xs text-gray-500">
          <MapPinIcon className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex-grow" />

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-end justify-between mb-3">
            <div>
              {discountedPrice ? (
                <>
                  <p className="text-xs text-gray-400 line-through">
                    GH₵{listing.price.toFixed(2)}
                  </p>
                  <p className="text-lg font-extrabold text-gray-900 leading-none">
                    GH₵{discountedPrice.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-extrabold text-gray-900 leading-none">
                  GH₵{listing.price.toFixed(2)}
                </p>
              )}
              <span className="text-xs text-gray-400">per {listing.unit}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Qty</p>
              <p className="text-sm font-bold text-emerald-600">
                {listing.quantity_available}
              </p>
            </div>
          </div>

          <button
            onClick={() => onAddToCart(listing)}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
              inCart
                ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
            }`}
          >
            {inCart ? (
              <>
                <CheckIcon className="h-4 w-4" /> Added to Cart
              </>
            ) : (
              <>
                <CartIcon className="h-4 w-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────
export default function MarketplaceClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All Regions");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const PER_PAGE = 24;

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);

      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          id,
          name,
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
          profiles ( location, verified_status ),
          crops ( crop_type, estimated_harvest_date )
        `,
        )
        .eq("status", "active");

      if (error) {
        console.error("Error fetching listings:", error);
        setListings([]);
      } else if (data) {
        const formattedListings: Listing[] = (data as SupabaseListingRow[]).map(
          (item) => ({
            id: item.id,
            title: item.name,
            category: item.crops?.crop_type || "General",
            price: Number(item.price_per_unit),
            unit: item.unit_type || "unit",
            quantity_available: Number(item.quantity),
            location: item.profiles?.location || "Unknown Location",
            is_verified: item.profiles?.verified_status || false,
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
            farmer_name: item.farmer_name || "Local Farmer",
            farmer_avatar:
              item.farmer_avatar || "https://i.pravatar.cc/150?img=1",
            min_order: Number(item.min_order) || 1,
          }),
        );

        setListings(formattedListings);
      }

      setLoading(false);
    }

    fetchListings();
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartIds = new Set(cart.map((i) => i.listing.id));

  const addToCart = (listing: Listing) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.listing.id === listing.id);
      if (existing)
        return prev.map((i) =>
          i.listing.id === listing.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { listing, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.listing.id !== id));
  const changeQty = (id: string, qty: number) =>
    setCart((prev) =>
      prev.map((i) => (i.listing.id === id ? { ...i, qty } : i)),
    );

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

    if (sort === "price_asc")
      items = [...items].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc")
      items = [...items].sort((a, b) => b.price - a.price);
    else if (sort === "rating")
      items = [...items].sort((a, b) => b.rating - a.rating);
    else if (sort === "featured")
      items = [...items].sort(
        (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
      );
    else if (sort === "newest")
      items = [...items].sort((a, b) =>
        b.harvest_date.localeCompare(a.harvest_date),
      );

    return items;
  }, [listings, search, category, region, sort]);

  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-emerald-600 font-bold text-xl animate-pulse">
          Loading Marketplace Data...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onQtyChange={changeQty}
        />
      )}

      {/* Sticky Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2.5 font-semibold"
        >
          <CartIcon className="h-5 w-5" />
          <span>Cart</span>
          <span className="bg-white text-emerald-700 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}

      {/* Stats Bar */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-white/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-gray-600">
              <Sprout className="h-4 w-4 text-emerald-600" />
              <strong className="text-gray-900">{listings.length}</strong>{" "}
              products listed
            </span>
            <span className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <strong className="text-gray-900">10</strong> regions covered
            </span>
            <span className="flex items-center gap-2 text-gray-600">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <strong className="text-gray-900">
                {listings.filter((l) => l.is_verified).length}
              </strong>{" "}
              verified farmers
            </span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800"
          >
            <CartIcon className="h-4 w-4" />
            Cart ({cartCount})
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-white/40 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 min-w-max">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/60 flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search maize, yams, tomatoes, spices..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 text-sm"
            >
              {REGIONS_FILTER.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-gray-700 text-sm"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Harvest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 mt-3 mb-5 text-sm text-gray-600">
          <FilterIcon className="h-4 w-4" />
          <span>
            Showing{" "}
            <strong className="text-gray-900">{paginated.length}</strong> of{" "}
            <strong className="text-gray-900">{filtered.length}</strong>{" "}
            products
          </span>
          {(search || category !== "All" || region !== "All Regions") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setRegion("All Regions");
                setPage(1);
              }}
              className="ml-2 text-xs text-red-400 hover:text-red-600 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/70 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mb-3 flex justify-center">
              <Sprout className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No products found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginated.map((listing) => (
                <ProductCard
                  key={listing.id}
                  listing={listing}
                  onAddToCart={addToCart}
                  inCart={cartIds.has(listing.id)}
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Load More Products ({filtered.length - paginated.length}{" "}
                  remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
