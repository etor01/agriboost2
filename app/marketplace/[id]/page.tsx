// app/marketplace/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, use } from "react";
import { DUMMY_LISTINGS, type Listing } from "@/lib/data/marketplaceData";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

// ── Icons ──────────────────────────────────────────────────────────
const MapPinIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ArrowLeftIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);
const StarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const TruckIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
);
const CartIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);
const ShieldIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const LeafIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg {...p} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);

// ── Star Rating ────────────────────────────────────────────────────
const StarRating = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => {
  const cls = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <StarIcon key={s} className={`${cls} ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`} />
      ))}
    </div>
  );
};

// ── Related Card ───────────────────────────────────────────────────
const RelatedCard = ({ listing }: { listing: Listing }) => (
  <Link href={`/marketplace/${listing.id}`} className="group flex gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-200">
    <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
      <Image src={listing.image_urls[0]} alt={listing.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 truncate transition-colors">{listing.title}</p>
      <p className="text-xs text-gray-500 truncate">{listing.location}</p>
      <p className="text-sm font-bold text-emerald-600 mt-0.5">GH₵{listing.price.toFixed(2)} <span className="text-xs font-normal text-gray-400">/{listing.unit}</span></p>
    </div>
  </Link>
);

// ── Detail Page ────────────────────────────────────────────────────
export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = DUMMY_LISTINGS.find(l => l.id === id);
  if (!listing) notFound();

  const [qty, setQty] = useState(listing.min_order);
  const [added, setAdded] = useState(false);

  const discountedPrice = listing.discount
    ? listing.price * (1 - listing.discount / 100)
    : null;
  const effectivePrice = discountedPrice ?? listing.price;
  const totalCost = (effectivePrice * qty).toFixed(2);

  const related = DUMMY_LISTINGS
    .filter(l => l.category === listing.category && l.id !== listing.id)
    .slice(0, 5);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-7xl mt-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/marketplace" className="hover:text-emerald-600 flex items-center gap-1.5 font-medium">
            <ArrowLeftIcon className="h-4 w-4" /> Marketplace
          </Link>
          <span>/</span>
          <span className="text-emerald-600">{listing.category}</span>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Image + Farmer */}
          <div className="lg:col-span-1 space-y-5">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-square shadow-lg">
              <Image src={listing.image_urls[0]} alt={listing.title} fill className="object-cover" />
              {listing.discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-extrabold px-3 py-1 rounded-full shadow">
                  {listing.discount}% OFF
                </span>
              )}
              {listing.is_featured && (
                <span className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Farmer Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Sold By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-emerald-200">
                  <Image src={listing.farmer_avatar} alt={listing.farmer_name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{listing.farmer_name}</p>
                  {listing.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-0.5">
                      <ShieldIcon className="h-3 w-3" /> Verified Farmer
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-400" /> {listing.location}</div>
                <div className="flex items-center gap-2"><LeafIcon className="h-4 w-4 text-gray-400" /> Harvest: {listing.harvest_date}</div>
                {listing.delivery_available && (
                  <div className="flex items-center gap-2 text-blue-600 font-medium"><TruckIcon className="h-4 w-4" /> Delivery Available</div>
                )}
              </div>
              <button className="w-full mt-4 py-2.5 border border-emerald-400 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors text-sm">
                Contact Farmer
              </button>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔒</span><span>Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">✅</span><span>Quality Assured</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🚜</span><span>Farm Fresh</span>
              </div>
            </div>
          </div>

          {/* CENTER: Product Info + Buy */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{listing.category}</span>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mt-1 leading-tight">{listing.title}</h1>

              <div className="flex items-center gap-3 mt-3">
                <StarRating rating={listing.rating} size="md" />
                <span className="text-sm text-gray-500 font-medium">{listing.rating} ({listing.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4" /> {listing.location}
              </div>

              {/* Price block */}
              <div className="mt-5 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                {discountedPrice ? (
                  <>
                    <p className="text-sm text-gray-400 line-through">GH₵{listing.price.toFixed(2)}</p>
                    <p className="text-4xl font-extrabold text-emerald-700">GH₵{discountedPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-0.5">per {listing.unit} · <span className="text-red-500 font-semibold">{listing.discount}% savings</span></p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-extrabold text-gray-900">GH₵{listing.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-0.5">per {listing.unit}</p>
                  </>
                )}
                <p className="text-xs text-gray-400 mt-1">{listing.quantity_available} {listing.unit}s available</p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (min. {listing.min_order})</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(q => Math.max(listing.min_order, q - 1))}
                    className="h-10 w-10 rounded-xl border border-gray-200 hover:border-emerald-400 flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600 transition-colors"
                  >-</button>
                  <span className="text-xl font-extrabold text-gray-900 w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(listing.quantity_available, q + 1))}
                    className="h-10 w-10 rounded-xl border border-gray-200 hover:border-emerald-400 flex items-center justify-center font-bold text-gray-600 hover:text-emerald-600 transition-colors"
                  >+</button>
                  <span className="ml-2 text-sm text-gray-500">× GH₵{effectivePrice.toFixed(2)}</span>
                  <span className="ml-auto text-lg font-extrabold text-emerald-700">= GH₵{totalCost}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-5 space-y-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] ${
                    added
                      ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-400"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  }`}
                >
                  <CartIcon className="h-5 w-5" />
                  {added ? "✓ Added to Cart!" : "Add to Cart"}
                </button>
                <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]">
                  Buy Now — GH₵{totalCost}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-800 mb-3">Product Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">Min Order</p>
                  <p className="font-bold text-gray-800 mt-0.5">{listing.min_order} {listing.unit}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">In Stock</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{listing.quantity_available} units</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">Delivery</p>
                  <p className={`font-bold mt-0.5 ${listing.delivery_available ? "text-blue-600" : "text-gray-400"}`}>
                    {listing.delivery_available ? "Available" : "Pickup Only"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">Harvest Date</p>
                  <p className="font-bold text-gray-800 mt-0.5">{listing.harvest_date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Related Products */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-base font-bold text-gray-800 mb-1">More in {listing.category}</h2>
              <p className="text-xs text-gray-400 mb-4">Similar products you may like</p>
              <div className="space-y-1">
                {related.map(r => <RelatedCard key={r.id} listing={r} />)}
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
