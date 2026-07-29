// app/(buyer)/wishlist/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";

interface WishlistItem {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  delivery_available: boolean;
}

const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: "w1",
    title: "Premium Watermelons",
    category: "Fruit",
    price: 12.0,
    unit: "each",
    farmer: "Kofi Boateng Farm",
    location: "Volta Region",
    rating: 4.8,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop",
    delivery_available: true,
  },
  {
    id: "w2",
    title: "Organic Cocoyam",
    category: "Root Veg",
    price: 3.5,
    unit: "kg",
    farmer: "Mensah Family Farm",
    location: "Ashanti Region",
    rating: 4.5,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop",
    delivery_available: false,
  },
  {
    id: "w3",
    title: "Ripe Mangoes",
    category: "Fruit",
    price: 7.0,
    unit: "dozen",
    farmer: "Ama Serwaa Harvest",
    location: "Northern Region",
    rating: 4.9,
    reviews: 104,
    image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop",
    delivery_available: true,
  },
  {
    id: "w4",
    title: "Fresh Okra",
    category: "Vegetable",
    price: 2.5,
    unit: "kg",
    farmer: "Ekow's Agri Co.",
    location: "Central Region",
    rating: 4.3,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop",
    delivery_available: true,
  },
];

export default function BuyerWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(MOCK_WISHLIST);

  const removeItem = (id: string) =>
    setWishlist((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
          </p>
        </div>
        {wishlist.length > 0 && (
          <Link
            href="/buyer/shop"
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Browse more →
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 bg-white/70 rounded-2xl border-2 border-dashed border-gray-200">
          <Heart className="h-12 w-12 text-rose-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Browse the market and save your favourite items here.
          </p>
          <Link
            href="/buyer/shop"
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  title="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white transition-all shadow"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {/* Category badge */}
                <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-[11px] font-bold text-gray-600 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {item.farmer} · {item.location}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1.5">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-gray-700">{item.rating}</span>
                  <span className="text-xs text-gray-400">({item.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-base font-extrabold text-gray-900">
                    GH₵ {item.price.toFixed(2)}
                    <span className="text-xs font-normal text-gray-400">/{item.unit}</span>
                  </p>
                  {item.delivery_available && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Delivery
                    </span>
                  )}
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
