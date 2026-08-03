// app/marketplace/[id]/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  BadgeCheck,
  Heart,
  Leaf,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tractor,
  Truck,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useWishlist } from "@/lib/wishlist";

const supabase = createClient();

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

const mapListing = (item: SupabaseListingRow): Listing => ({
  id: item.id,
  title: item.name,
  category: item.crops?.crop_type || "General",
  price: Number(item.price_per_unit) || 0,
  unit: item.unit_type || "unit",
  quantity_available: Number(item.quantity) || 0,
  location: item.profiles?.location || "Unknown Location",
  image_urls: item.image_urls || [
    "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
  ],
  description:
    item.description || "Fresh produce from a verified local farmer.",
  rating: Number(item.rating) || 0,
  reviews: Number(item.reviews) || 0,
  farmer_name: item.farmer_name || "Local Farmer",
  farmer_avatar: item.farmer_avatar || "https://i.pravatar.cc/150?img=1",
  is_verified: Boolean(item.profiles?.verified_status),
  is_featured: Boolean(item.is_featured),
  discount: Number(item.discount) || undefined,
  harvest_date: item.crops?.estimated_harvest_date || new Date().toISOString(),
  delivery_available: Boolean(item.delivery_available),
  min_order: Number(item.min_order) || 1,
});

// ── Icons ──────────────────────────────────────────────────────────
const MapPinIcon = (p: React.SVGProps<SVGSVGElement>) => <MapPin {...p} />;
const ArrowLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <ArrowLeft {...p} />
);
const StarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <Star {...p} fill="currentColor" stroke="none" />
);
const TruckIcon = (p: React.SVGProps<SVGSVGElement>) => <Truck {...p} />;
const CartIcon = (p: React.SVGProps<SVGSVGElement>) => <ShoppingCart {...p} />;
const ShieldIcon = (p: React.SVGProps<SVGSVGElement>) => <ShieldCheck {...p} />;
const LeafIcon = (p: React.SVGProps<SVGSVGElement>) => <Leaf {...p} />;

// ── Star Rating ────────────────────────────────────────────────────
const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => {
  const cls = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
};

// ── Related Card ───────────────────────────────────────────────────
const RelatedCard = ({ listing }: { listing: Listing }) => {
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(listing.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(listing);
  };

  return (
    <div className="group relative flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
      <Link
        href={`/marketplace/${encodeURIComponent(listing.id)}`}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={listing.image_urls[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 truncate transition-colors">
            {listing.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{listing.location}</p>
          <p className="text-sm font-bold text-emerald-600 mt-0.5">
            GH₵{listing.price.toFixed(2)}{" "}
            <span className="text-xs font-normal text-gray-400">
              /{listing.unit}
            </span>
          </p>
        </div>
      </Link>

      <button
        onClick={handleSave}
        title={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all z-10 ${
          saved
            ? "bg-rose-100 text-rose-600 border border-rose-200 shadow-sm"
            : "bg-gray-100/80 hover:bg-rose-50 text-gray-400 hover:text-rose-500 border border-gray-200/60"
        }`}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-rose-600" : ""}`} />
      </button>
    </div>
  );
};

// ── Detail Page ────────────────────────────────────────────────────
export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const resolvedId = decodeURIComponent(String(id ?? "")).trim();
  const [listing, setListing] = useState<Listing | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { isSaved, toggleSave } = useWishlist();
  const saved = listing ? isSaved(listing.id) : false;

  useEffect(() => {
    let active = true;

    async function fetchListing() {
      setLoading(true);
      setListing(null);
      setRelated([]);
      setQty(1);

      if (!resolvedId) {
        setLoading(false);
        return;
      }

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
          description,
          farmer_name,
          farmer_avatar,
          min_order,
          profiles ( location, verified_status ),
          crops ( crop_type, estimated_harvest_date )
        `,
        )
        .eq("status", "active")
        .eq("id", resolvedId);

      if (!active) return;

      if (error || !data?.[0]) {
        setLoading(false);
        return;
      }

      const selectedListing = mapListing(data[0] as SupabaseListingRow);
      setListing(selectedListing);
      setQty(Math.max(selectedListing.min_order, 1));

      const { data: relatedData, error: relatedError } = await supabase
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
          description,
          farmer_name,
          farmer_avatar,
          min_order,
          profiles ( location, verified_status ),
          crops ( crop_type, estimated_harvest_date )
        `,
        )
        .eq("status", "active");

      if (!active) return;

      if (!relatedError && relatedData) {
        const filteredRelated = (relatedData as SupabaseListingRow[])
          .filter(
            (item) =>
              item.crops?.crop_type === selectedListing.category &&
              item.id !== selectedListing.id,
          )
          .slice(0, 5)
          .map(mapListing);

        setRelated(filteredRelated);
      }

      setLoading(false);
    }

    fetchListing();

    return () => {
      active = false;
    };
  }, [resolvedId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="text-emerald-600 font-bold text-xl animate-pulse">
            Loading product details...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Product not found
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              We couldn’t find that listing right now. Please try another
              product or go back to the marketplace.
            </p>
            <Link
              href="/marketplace"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Back to marketplace
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discountedPrice = listing.discount
    ? listing.price * (1 - listing.discount / 100)
    : null;
  const effectivePrice = discountedPrice ?? listing.price;
  const totalCost = (effectivePrice * qty).toFixed(2);

  const handleAddToCart = () => {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-7xl mt-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link
            href="/marketplace"
            className="hover:text-emerald-600 flex items-center gap-1.5 font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Marketplace
          </Link>
          <span>/</span>
          <span className="text-emerald-600">{listing.category}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">
            {listing.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Image + Farmer */}
          <div className="lg:col-span-1 space-y-5">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
              <Image
                src={listing.image_urls[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />
              {listing.discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow">
                  {listing.discount}% OFF
                </span>
              )}
              {listing.is_featured && (
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured
                </span>
              )}

              {/* Wishlist Heart Button on Image */}
              <button
                onClick={() => listing && toggleSave(listing)}
                title={saved ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute bottom-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all shadow-md hover:scale-105 ${
                  saved
                    ? "bg-rose-500 text-white shadow-rose-500/20"
                    : "bg-white/90 text-gray-600 hover:text-rose-500 hover:bg-white"
                }`}
              >
                <Heart className={`h-5 w-5 ${saved ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* Farmer Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Sold By
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-emerald-200">
                  <Image
                    src={listing.farmer_avatar}
                    alt={listing.farmer_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {listing.farmer_name}
                  </p>
                  {listing.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                      <ShieldIcon className="h-3 w-3" /> Verified Farmer
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />{" "}
                  {listing.location}
                </div>
                <div className="flex items-center gap-2">
                  <LeafIcon className="h-4 w-4 text-gray-400" /> Harvest:{" "}
                  {listing.harvest_date}
                </div>
                {listing.delivery_available && (
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <TruckIcon className="h-4 w-4" /> Delivery Available
                  </div>
                )}
              </div>
              <button className="w-full mt-4 py-2.5 border border-emerald-400 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors text-sm">
                Contact Farmer
              </button>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <BadgeCheck className="h-5 w-5 text-emerald-600" />
                <span>Quality Assured</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Tractor className="h-5 w-5 text-emerald-600" />
                <span>Farm Fresh</span>
              </div>
            </div>
          </div>

          {/* CENTER: Product Info + Buy */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                {listing.category}
              </span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1 leading-tight">
                {listing.title}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={listing.rating} size="md" />
                <span className="text-sm text-gray-500 font-medium">
                  {listing.rating} ({listing.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" /> {listing.location}
              </div>

              {/* Price block */}
              <div className="mt-5 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                {discountedPrice ? (
                  <>
                    <p className="text-sm text-gray-400 line-through">
                      GH₵{listing.price.toFixed(2)}
                    </p>
                    <p className="text-4xl font-extrabold text-emerald-700">
                      GH₵{discountedPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      per {listing.unit} ·{" "}
                      <span className="text-red-500 font-semibold">
                        {listing.discount}% savings
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-extrabold text-gray-900">
                      GH₵{listing.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      per {listing.unit}
                    </p>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {listing.quantity_available} {listing.unit}s available
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (min. {listing.min_order})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQty((q) => Math.max(listing.min_order, q - 1))
                    }
                    className="h-10 w-10 rounded-xl border border-gray-200 hover:border-emerald-400 flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-extrabold text-gray-900 w-8 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(listing.quantity_available, q + 1))
                    }
                    className="h-10 w-10 rounded-xl border border-gray-200 hover:border-emerald-400 flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    +
                  </button>
                  <span className="ml-2 text-sm text-gray-500">
                    × GH₵{effectivePrice.toFixed(2)}
                  </span>
                  <span className="ml-auto text-lg font-extrabold text-emerald-700">
                    = GH₵{totalCost}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-5 space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] ${
                      added
                        ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-400"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                    }`}
                  >
                    <CartIcon className="h-5 w-5" />
                    {added ? "✓ Added to Cart!" : "Add to Cart"}
                  </button>
                  <button
                    onClick={() => listing && toggleSave(listing)}
                    title={saved ? "Remove from wishlist" : "Add to wishlist"}
                    className={`px-5 py-3.5 rounded-xl font-bold text-sm border-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${
                      saved
                        ? "bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100"
                        : "bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        saved ? "fill-rose-600 text-rose-600" : ""
                      }`}
                    />
                    <span>{saved ? "Saved" : "Save"}</span>
                  </button>
                </div>
                <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]">
                  Buy Now — GH₵{totalCost}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-3">
                Product Description
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {listing.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">
                    Min Order
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {listing.min_order} {listing.unit}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">
                    In Stock
                  </p>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {listing.quantity_available} units
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">
                    Delivery
                  </p>
                  <p
                    className={`font-bold mt-0.5 ${listing.delivery_available ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {listing.delivery_available ? "Available" : "Pickup Only"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">
                    Harvest Date
                  </p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {listing.harvest_date}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Related Products */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-base font-bold text-gray-800 mb-1">
                More in {listing.category}
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Similar products you may like
              </p>
              <div className="space-y-1">
                {related.map((r) => (
                  <RelatedCard key={r.id} listing={r} />
                ))}
              </div>
              <Link
                href={`/marketplace?category=${encodeURIComponent(listing.category)}`}
                className="block mt-4 text-center text-sm text-emerald-600 font-semibold hover:text-emerald-700 underline underline-offset-2"
              >
                View all in {listing.category} →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
