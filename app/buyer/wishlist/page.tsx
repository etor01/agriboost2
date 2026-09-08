// app/buyer/wishlist/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  Trash2,
  ArrowUpRight,
  MapPin,
  Store,
  Truck,
  Trash,
} from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { FarmerPageHeader, FarmerEmptyState } from "@/components/farmer/ui";

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs animate-pulse"
        >
          <div className="aspect-[4/3] bg-zinc-100" />
          <div className="p-4 space-y-2.5">
            <div className="h-2.5 bg-zinc-100 rounded w-1/3" />
            <div className="h-4 bg-zinc-100 rounded w-4/5" />
            <div className="h-3 bg-zinc-100 rounded w-2/3" />
            <div className="pt-2 flex items-center justify-between">
              <div className="h-4 bg-zinc-100 rounded w-1/2" />
              <div className="h-4 bg-zinc-100 rounded w-1/4" />
            </div>
            <div className="h-8 bg-zinc-100 rounded-lg mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BuyerWishlistPage() {
  const { wishlist, removeSave, clearAll, loading } = useWishlist();
  const [clearing, setClearing] = useState(false);

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all items from your wishlist?")) {
      setClearing(true);
      clearAll();
      setTimeout(() => setClearing(false), 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <FarmerPageHeader
        badge="Saved Items"
        title="My Saved Wishlist"
        description="Review your bookmarked farm produce and quickly navigate to checkout or product details."
        action={
          <div className="flex items-center gap-2">
            {wishlist.length > 0 && !loading && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg transition-colors shadow-2xs"
              >
                <Trash className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
            <Link
              href="/buyer/shop"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Browse Market →
            </Link>
          </div>
        }
      />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <WishlistSkeleton />
      ) : wishlist.length === 0 ? (
        /* Empty state */
        <FarmerEmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save your favorite fresh produce, seeds, and farm goods from the marketplace so you can easily purchase them later."
          action={{
            label: "Explore Market",
            onClick: () => {
              window.location.href = "/buyer/shop";
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs hover:border-emerald-500/40 hover:shadow-sm transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Top: Image & Overlay Buttons */}
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Remove button */}
                  <button
                    onClick={() => removeSave(item.id)}
                    title="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-white hover:scale-110 transition-all shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Category badge */}
                  <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[10px] font-bold text-emerald-800 px-2 py-0.5 rounded-full shadow-2xs border border-zinc-100">
                    {item.category}
                  </span>

                  {/* Delivery available badge */}
                  {item.delivery_available && (
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-blue-700 px-2 py-0.5 rounded-full shadow-2xs border border-zinc-100">
                      <Truck className="h-3 w-3" />
                      Delivery
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-2">
                  <Link
                    href={`/marketplace/${encodeURIComponent(item.id)}`}
                    className="block group-hover:text-emerald-700 transition-colors"
                  >
                    <h3 className="font-bold text-zinc-900 text-sm line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2.5 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Store className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{item.farmer}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </div>

                  {/* Rating */}
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-zinc-800">
                        {item.rating.toFixed(1)}
                      </span>
                      <span className="text-zinc-400">
                        ({item.reviews})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-2 border-t border-zinc-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-medium uppercase">
                        Price
                      </span>
                      <p className="text-base font-extrabold text-zinc-900">
                        GH₵ {item.price.toFixed(2)}{" "}
                        <span className="text-[11px] font-normal text-zinc-500">
                          /{item.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 pt-0 flex items-center gap-2">
                <Link
                  href={`/marketplace/${encodeURIComponent(item.id)}`}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => removeSave(item.id)}
                  title="Remove from wishlist"
                  className="p-2 rounded-lg border border-zinc-200 hover:border-rose-300 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 text-xs transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

