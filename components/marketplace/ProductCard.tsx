"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  Check,
  MapPin,
  Package,
  ShoppingCart,
  Sparkles,
  Truck,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import StarRating from "./StarRating";

interface ProductCardProps {
  listing: Listing;
  onAddToCart: (l: Listing) => void;
  inCart: boolean;
}

export default function ProductCard({
  listing,
  onAddToCart,
  inCart,
}: ProductCardProps) {
  const discountedPrice = listing.discount
    ? listing.price * (1 - listing.discount / 100)
    : null;

  const harvestDate = listing.harvest_date
    ? new Date(listing.harvest_date).toLocaleDateString("en-GH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isLowStock = listing.quantity_available <= 10;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100/80">
      {/* ── Image ── */}
      <Link
        href={`/marketplace/${encodeURIComponent(listing.id)}`}
        className="block relative h-48 overflow-hidden bg-gray-100 flex-shrink-0"
      >
        <Image
          src={listing.image_urls[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {listing.is_featured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          {listing.discount && listing.discount > 0 ? (
            <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              {listing.discount}% OFF
            </span>
          ) : null}
        </div>

        {/* Top-right: verified badge */}
        {listing.is_verified && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </span>
        )}

        {/* Bottom: delivery tag */}
        {listing.delivery_available && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 text-[10px] font-semibold bg-white/90 text-blue-600 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Truck className="h-2.5 w-2.5" />
            Delivery available
          </span>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-grow p-4 gap-2.5">
        {/* Category + Title */}
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            {listing.category}
          </span>
          <Link href={`/marketplace/${encodeURIComponent(listing.id)}`}>
            <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mt-0.5">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Rating row */}
        <StarRating rating={listing.rating} reviews={listing.reviews} />

        {/* Meta row: location + harvest date */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1 truncate min-w-0">
            <MapPin className="h-3 w-3 flex-shrink-0 text-emerald-500" />
            <span className="truncate">{listing.location}</span>
          </span>
          {harvestDate && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Calendar className="h-3 w-3 text-emerald-500" />
              {harvestDate}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Price + Availability row */}
        <div className="flex items-end justify-between">
          <div>
            {discountedPrice ? (
              <>
                <p className="text-[11px] text-gray-400 line-through leading-none">
                  GH₵{listing.price.toFixed(2)}
                </p>
                <p className="text-xl font-extrabold text-gray-900 leading-tight">
                  GH₵{discountedPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-xl font-extrabold text-gray-900 leading-tight">
                GH₵{listing.price.toFixed(2)}
              </p>
            )}
            <span className="text-[11px] text-gray-400">per {listing.unit}</span>
          </div>

          {/* Stock pill */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isLowStock
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            <Package className="h-2.5 w-2.5" />
            {isLowStock
              ? `Only ${listing.quantity_available} left`
              : `${listing.quantity_available} ${listing.unit}`}
          </span>
        </div>

        {/* Min order note */}
        {listing.min_order > 1 && (
          <p className="text-[10px] text-gray-400">
            Min. order: {listing.min_order} {listing.unit}
          </p>
        )}

        {/* CTA */}
        <button
          onClick={() => onAddToCart(listing)}
          className={`mt-auto w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 ${
            inCart
              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100"
              : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
          }`}
        >
          {inCart ? (
            <>
              <Check className="h-4 w-4" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
