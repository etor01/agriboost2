// components/marketplace/CartDrawer.tsx
"use client";

import React from "react";
import Image from "next/image";
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import { FarmerBadge } from "@/components/farmer/ui";

type CartItem = { listing: Listing; qty: number };

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onClear?: () => void;
  onCheckout?: () => void;
}

export default function CartDrawer({
  cart,
  onClose,
  onRemove,
  onQtyChange,
  onClear,
  onCheckout,
}: CartDrawerProps) {
  const total = cart.reduce((s, i) => s + i.listing.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-zinc-900">
              Shopping Cart
            </h2>
            {cart.length > 0 && (
              <FarmerBadge variant="success">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </FarmerBadge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {cart.length > 0 && onClear && (
              <button
                onClick={onClear}
                title="Clear all items from cart"
                className="text-[11px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-3 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800">
                Your cart is empty
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Add fresh produce from verified local farmers to order.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors shadow-2xs"
            >
              Browse Produce
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.map((item) => (
                <div
                  key={item.listing.id}
                  className="flex gap-3 p-3 rounded-lg border border-zinc-200 bg-white shadow-2xs hover:border-zinc-300 transition-colors"
                >
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-100">
                    <Image
                      src={item.listing.image_urls[0]}
                      alt={item.listing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-semibold text-xs text-zinc-900 truncate">
                        {item.listing.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {item.listing.location}
                      </p>
                      <p className="text-xs font-bold text-zinc-900 mt-1">
                        GH₵{item.listing.price.toFixed(2)}{" "}
                        <span className="text-zinc-400 font-normal text-[10px]">
                          / {item.listing.unit}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
                        <button
                          onClick={() =>
                            onQtyChange(
                              item.listing.id,
                              Math.max(1, item.qty - 1)
                            )
                          }
                          className="h-5 w-5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 rounded transition-colors"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="text-xs font-semibold text-zinc-800 w-5 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            onQtyChange(item.listing.id, item.qty + 1)
                          }
                          className="h-5 w-5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 rounded transition-colors"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>

                      {/* Subtotal + remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-900">
                          GH₵{(item.listing.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemove(item.listing.id)}
                          title="Remove item"
                          className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t border-zinc-200 space-y-3 bg-zinc-50/50">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-800">
                    GH₵{total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Delivery Logistics</span>
                  <span className="text-emerald-700 font-medium text-[11px]">
                    Calculated at Checkout
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
                  <span>Total Amount</span>
                  <span>GH₵{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (onCheckout) onCheckout();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Escrow Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 border border-zinc-200 text-zinc-600 font-medium rounded-md hover:bg-zinc-100 transition-colors text-xs text-center"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

