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
  Star,
  Tractor,
  Truck,
  Check,
  Package,
  Calendar,
  Phone,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { useWishlist } from "@/lib/wishlist";
import { FarmerBadge } from "@/components/farmer/ui";

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
  farmers?: {
    profiles?: {
      location?: string | null;
      verified_status?: boolean | null;
      firstname?: string | null;
      lastname?: string | null;
    } | null;
  } | null;
  profiles?: {
    location?: string | null;
    verified_status?: boolean | null;
    firstname?: string | null;
    lastname?: string | null;
  } | null;
  crops?: {
    crop_type?: string | null;
    estimated_harvest_date?: string | null;
  } | null;
};

const mapListing = (item: SupabaseListingRow): Listing => {
  const profile = item.farmers?.profiles || item.profiles;
  const farmerName = profile
    ? [profile.firstname, profile.lastname].filter(Boolean).join(" ")
    : "";

  return {
    id: item.id,
    title: item.name,
    category: item.crops?.crop_type || "General",
    price: Number(item.price_per_unit) || 0,
    unit: item.unit_type || "unit",
    quantity_available: Number(item.quantity) || 0,
    location: profile?.location || "Unknown Location",
    image_urls: item.image_urls || [
      "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image",
    ],
    description:
      item.description || "Fresh produce from a verified local farmer.",
    rating: Number(item.rating) || 0,
    reviews: Number(item.reviews) || 0,
    farmer_name: farmerName || item.farmer_name || "Local Farmer",
    farmer_avatar: item.farmer_avatar || "https://i.pravatar.cc/150?img=1",
    is_verified: Boolean(profile?.verified_status),
    is_featured: Boolean(item.is_featured),
    discount: Number(item.discount) || undefined,
    harvest_date: item.crops?.estimated_harvest_date || new Date().toISOString(),
    delivery_available: Boolean(item.delivery_available),
    min_order: Number(item.min_order) || 1,
  };
};

const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) => {
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= Math.round(rating)
              ? "text-amber-500 fill-amber-500"
              : "text-zinc-200 fill-zinc-200"
          }`}
          strokeWidth={0}
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
    <div className="group relative flex items-center justify-between gap-2.5 p-2 rounded-md hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200">
      <Link
        href={`/marketplace/${encodeURIComponent(listing.id)}`}
        className="flex items-center gap-2.5 min-w-0 flex-1"
      >
        <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-100">
          <Image
            src={listing.image_urls[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-700 truncate transition-colors">
            {listing.title}
          </p>
          <p className="text-[11px] text-zinc-400 truncate">{listing.location}</p>
          <p className="text-xs font-bold text-zinc-900 mt-0.5">
            GH₵{listing.price.toFixed(2)}{" "}
            <span className="text-[10px] font-normal text-zinc-400">
              /{listing.unit}
            </span>
          </p>
        </div>
      </Link>

      <button
        onClick={handleSave}
        title={saved ? "Remove from wishlist" : "Add to wishlist"}
        className={`flex-shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-colors shadow-2xs ${
          saved
            ? "bg-rose-50 text-rose-600 border border-rose-200"
            : "bg-white text-zinc-400 hover:text-rose-600 border border-zinc-200"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${saved ? "fill-rose-600" : ""}`} />
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
          farmers!listings_profile_id_fkey (
            profiles ( location, verified_status, firstname, lastname )
          ),
          profiles ( location, verified_status, firstname, lastname ),
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
          farmers!listings_profile_id_fkey (
            profiles ( location, verified_status, firstname, lastname )
          ),
          profiles ( location, verified_status, firstname, lastname ),
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
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="text-xs text-zinc-500 font-medium animate-pulse">
            Loading produce details…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-20">
          <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-6 text-center shadow-2xs">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <Leaf className="h-5 w-5" />
            </div>
            <h1 className="text-base font-bold text-zinc-900">
              Produce Not Found
            </h1>
            <p className="mt-1.5 text-xs text-zinc-500">
              This listing might have been harvested, sold out, or removed by the farmer.
            </p>
            <Link
              href="/marketplace"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 shadow-2xs"
            >
              Back to Marketplace
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
    <div className="min-h-screen bg-zinc-50/50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mt-14">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-5">
          <Link
            href="/marketplace"
            className="hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-600">{listing.category}</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900 font-semibold truncate">
            {listing.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Image & Farmer Card */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Product Image Card */}
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden aspect-square bg-zinc-100 shadow-2xs">
              <Image
                src={listing.image_urls[0]}
                alt={listing.title}
                fill
                className="object-cover"
              />

              {/* Wishlist Floating Button */}
              <button
                onClick={() => listing && toggleSave(listing)}
                title={saved ? "Remove from wishlist" : "Add to wishlist"}
                className={`absolute bottom-3 right-3 z-10 p-2.5 rounded-md backdrop-blur-xs transition-colors shadow-2xs ${
                  saved
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-white/90 text-zinc-600 hover:text-rose-600 border border-zinc-200"
                }`}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Farmer Profile Card */}
            <div className="bg-white rounded-lg p-4 shadow-2xs border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Verified Producer
                </span>
                {listing.is_verified && (
                  <FarmerBadge variant="success">Verified Farmer</FarmerBadge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0">
                  <Image
                    src={listing.farmer_avatar}
                    alt={listing.farmer_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-zinc-900 truncate">
                    {listing.farmer_name}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {listing.location}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                  <span className="truncate">{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                  <span>Harvested: {listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString() : "Recent"}</span>
                </div>
                {listing.delivery_available && (
                  <div className="flex items-center gap-2 text-emerald-700 font-medium">
                    <Truck className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Courier Delivery Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Assurance Strip */}
            <div className="bg-white rounded-lg p-3 shadow-2xs border border-zinc-200 grid grid-cols-3 gap-2 text-center text-[10px] text-zinc-600">
              <div className="flex flex-col items-center gap-1 p-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Escrow Protected</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-1">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Quality Audited</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-1">
                <Tractor className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Farm Direct</span>
              </div>
            </div>
          </div>

          {/* CENTER: Product Purchasing & Specs */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg p-4 sm:p-5 shadow-2xs border border-zinc-200 space-y-4">
              <div>
                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                  {listing.category}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">
                  {listing.title}
                </h1>

                <div className="flex items-center gap-2.5 mt-2">
                  <StarRating rating={listing.rating} size="md" />
                  <span className="text-xs text-zinc-500 font-medium">
                    {listing.rating.toFixed(1)} ({listing.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200">
                {discountedPrice ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-zinc-900">
                        GH₵{discountedPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-400 line-through">
                        GH₵{listing.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      per {listing.unit} ·{" "}
                      <span className="text-red-600 font-semibold">
                        -{listing.discount}% Discount
                      </span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-zinc-900">
                      GH₵{listing.price.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      per {listing.unit}
                    </p>
                  </div>
                )}
                <span className="text-[10px] text-zinc-400 block mt-1">
                  {listing.quantity_available} {listing.unit}s currently available in stock
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-900">
                  Order Quantity (min. {listing.min_order})
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
                    <button
                      onClick={() =>
                        setQty((q) => Math.max(listing.min_order, q - 1))
                      }
                      className="h-7 w-7 flex items-center justify-center font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-zinc-900 w-8 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() =>
                        setQty((q) =>
                          Math.min(listing.quantity_available, q + 1)
                        )
                      }
                      className="h-7 w-7 flex items-center justify-center font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500 ml-1">
                    × GH₵{effectivePrice.toFixed(2)}
                  </span>
                  <span className="ml-auto text-sm font-bold text-zinc-900">
                    GH₵{totalCost}
                  </span>
                </div>
              </div>

              {/* Order Actions */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-2.5 rounded-md font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-2xs ${
                    added
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-700" />
                      <span>Added to Your Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart (GH₵{totalCost})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div className="bg-white rounded-lg p-4 sm:p-5 shadow-2xs border border-zinc-200 space-y-3">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Produce Specifications
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {listing.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    Min Order
                  </span>
                  <span className="font-semibold text-zinc-800">
                    {listing.min_order} {listing.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    Availability
                  </span>
                  <span className="font-semibold text-zinc-800">
                    {listing.quantity_available} {listing.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    Delivery Options
                  </span>
                  <span className="font-semibold text-zinc-800">
                    {listing.delivery_available ? "Courier / Pickup" : "Farm Pickup"}
                  </span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 font-medium block">
                    Harvest Date
                  </span>
                  <span className="font-semibold text-zinc-800 truncate">
                    {listing.harvest_date ? new Date(listing.harvest_date).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Related Products */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-2xs border border-zinc-200 sticky top-20 space-y-3">
              <div>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Similar in {listing.category}
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Other verified harvests from regional farmers
                </p>
              </div>

              <div className="space-y-1">
                {related.length > 0 ? (
                  related.map((r) => <RelatedCard key={r.id} listing={r} />)
                ) : (
                  <p className="text-xs text-zinc-400 py-3">No other listings in this category.</p>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <Link
                  href={`/marketplace?category=${encodeURIComponent(listing.category)}`}
                  className="block text-center text-xs text-zinc-700 font-medium hover:text-zinc-900 transition-colors"
                >
                  Browse all {listing.category} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

