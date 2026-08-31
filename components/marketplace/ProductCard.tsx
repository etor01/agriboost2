// components/marketplace/ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Calendar,
  Check,
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import StarRating from "./StarRating";
import { useWishlist } from "@/lib/wishlist";
import { FarmerBadge } from "@/components/farmer/ui";

interface ProductCardProps {
  listing: Listing;
  onAddToCart: (l: Listing) => void;
  onRemoveFromCart?: (id: string) => void;
  inCart: boolean;
}

export default function ProductCard({
  listing,
  onAddToCart,
  onRemoveFromCart,
  inCart,
}: ProductCardProps) {
  const { isSaved, toggleSave } = useWishlist();
  const saved = isSaved(listing.id);
  const discountedPrice = listing.discount
    ? listing.price * (1 - listing.discount / 100)
    : null;

  const harvestDate = listing.harvest_date
    ? new Date(listing.harvest_date).toLocaleDateString("en-GH", {
        month: "short",
        day: "numeric",
      })
    : null;

  const isLowStock =
    listing.quantity_available <= 10 && listing.quantity_available > 0;
  const isSoldOut =
    listing.quantity_available === 0 || listing.status === "sold";

  return (
    <div className="group flex flex-col bg-white rounded-lg overflow-hidden border border-zinc-200 hover:border-zinc-300 shadow-2xs hover:shadow-xs transition-all duration-200">
      {/* Image Container */}
      <Link
        href={`/marketplace/${encodeURIComponent(listing.id)}`}
        className="block relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 flex-shrink-0"
      >
        <Image
          src={listing.image_urls[0]}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-md text-xs tracking-wider uppercase shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {listing.is_verified ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50/95 backdrop-blur-xs border border-emerald-200/80 px-2 py-0.5 rounded-md shadow-2xs">
              <BadgeCheck className="h-3 w-3 text-emerald-600" />
              Verified
            </span>
          ) : <span />}

          {listing.discount ? (
            <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50/95 backdrop-blur-xs border border-red-200 px-1.5 py-0.5 rounded-md shadow-2xs">
              -{listing.discount}%
            </span>
          ) : null}
        </div>

        {listing.delivery_available && (
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-700 bg-white/95 backdrop-blur-xs border border-zinc-200/80 px-1.5 py-0.5 rounded-md shadow-2xs">
              <Truck className="h-2.5 w-2.5 text-zinc-500" />
              Delivery
            </span>
          </div>
        )}
      </Link>

      {/* Body Content */}
      <div className="flex flex-col flex-grow p-3.5 gap-2 justify-between">
        <div className="space-y-1.5">
          {/* Category & Title */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 block">
              {listing.category}
            </span>
            <Link href={`/marketplace/${encodeURIComponent(listing.id)}`}>
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mt-0.5">
                {listing.title}
              </h3>
            </Link>
          </div>

          {/* Rating */}
          <StarRating rating={listing.rating} reviews={listing.reviews} />

          {/* Meta Info: Location & Harvest */}
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 truncate min-w-0">
              <MapPin className="h-3 w-3 flex-shrink-0 text-zinc-400" />
              <span className="truncate">{listing.location}</span>
            </span>
            {harvestDate && (
              <>
                <span className="text-zinc-300">·</span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  {harvestDate}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-zinc-100">
          {/* Price & Stock */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              {discountedPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <p className="text-base font-bold text-zinc-900">
                    GH₵{discountedPrice.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-through">
                    GH₵{listing.price.toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-base font-bold text-zinc-900">
                  GH₵{listing.price.toFixed(2)}
                </p>
              )}
              <span className="text-[10px] text-zinc-400 block -mt-0.5">
                per {listing.unit}
              </span>
            </div>

            {/* Stock status badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                isSoldOut
                  ? "bg-zinc-100 text-zinc-500 border-zinc-200"
                  : isLowStock
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              <Package className="h-2.5 w-2.5" />
              {isSoldOut
                ? "Out of stock"
                : isLowStock
                ? `${listing.quantity_available} left`
                : `${listing.quantity_available} ${listing.unit}`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={isSoldOut}
              onClick={() => onAddToCart(listing)}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-2xs ${
                isSoldOut
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200"
                  : inCart
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isSoldOut ? (
                "Sold Out"
              ) : inCart ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            {inCart && onRemoveFromCart && (
              <button
                onClick={() => onRemoveFromCart(listing.id)}
                title="Remove from cart"
                className="h-7 w-7 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors flex items-center justify-center shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => toggleSave(listing)}
              title={saved ? "Remove from wishlist" : "Add to wishlist"}
              className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors shadow-2xs ${
                saved
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-zinc-200 text-zinc-400 hover:text-rose-600 hover:border-rose-200"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  saved ? "fill-rose-600 text-rose-600" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

