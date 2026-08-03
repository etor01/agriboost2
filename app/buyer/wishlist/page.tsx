// app/(buyer)/wishlist/page.tsx
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

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white/80 border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="pt-3 flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-1/2" />
              <div className="h-5 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl mt-4" />
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
    <div className="min-h-screen pb-16">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart className="h-5 w-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                My Wishlist
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {loading
                  ? "Loading your saved items..."
                  : `${wishlist.length} saved item${wishlist.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {wishlist.length > 0 && !loading && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 rounded-xl transition-colors"
            >
              <Trash className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
          <Link
            href="/buyer/shop"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all hover:shadow"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Browse Market →
          </Link>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <WishlistSkeleton />
      ) : wishlist.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 px-4 bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-300">
            <Heart className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Save your favorite fresh produce, seeds, and farm goods from the marketplace so you can easily view and purchase them later.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/buyer/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              Explore Buyer Shop
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
            >
              View Marketplace
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-100/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Top: Image & Overlay Buttons */}
              <div>
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Remove button */}
                  <button
                    onClick={() => removeSave(item.id)}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[11px] font-bold text-emerald-700 px-2.5 py-1 rounded-full shadow-sm">
                    {item.category}
                  </span>

                  {/* Delivery available badge */}
                  {item.delivery_available && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-blue-600 px-2 py-0.5 rounded-full shadow-sm">
                      <Truck className="h-3 w-3" />
                      Delivery available
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  <Link
                    href={`/marketplace/${encodeURIComponent(item.id)}`}
                    className="block group-hover:text-emerald-700 transition-colors"
                  >
                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                    <span className="inline-flex items-center gap-1 truncate">
                      <Store className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.farmer}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </div>

                  {/* Rating */}
                  {item.rating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {item.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item.reviews} review{item.reviews !== 1 ? "s" : ""})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">
                        Price
                      </span>
                      <p className="text-lg font-extrabold text-gray-900">
                        GH₵ {item.price.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          /{item.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 flex items-center gap-2">
                <Link
                  href={`/marketplace/${encodeURIComponent(item.id)}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <span>View Product</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => removeSave(item.id)}
                  title="Remove from wishlist"
                  className="px-3 py-2.5 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-400 hover:text-rose-600 text-xs font-bold transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
