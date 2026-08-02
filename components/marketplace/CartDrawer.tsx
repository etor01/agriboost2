"use client";

import Image from "next/image";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";

type CartItem = { listing: Listing; qty: number };

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onCheckout?: () => void;
}

export default function CartDrawer({
  cart,
  onClose,
  onRemove,
  onQtyChange,
  onCheckout,
}: CartDrawerProps) {
  const total = cart.reduce((s, i) => s + i.listing.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Your Cart
              {cart.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                  {cart.length}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-9 w-9 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-600">
                Your cart is empty
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Add fresh produce to get started
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.listing.id}
                  className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-200 bg-gray-50/50 transition-colors"
                >
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
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
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.listing.location}
                    </p>
                    <p className="text-emerald-600 font-bold text-sm mt-1">
                      GH₵{item.listing.price.toFixed(2)}{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        / {item.listing.unit}
                      </span>
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-1 py-0.5">
                        <button
                          onClick={() =>
                            onQtyChange(
                              item.listing.id,
                              Math.max(1, item.qty - 1),
                            )
                          }
                          className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold text-gray-800 w-5 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            onQtyChange(item.listing.id, item.qty + 1)
                          }
                          className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Subtotal + remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">
                          GH₵{(item.listing.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemove(item.listing.id)}
                          className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-100 space-y-3 bg-gray-50/50">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">
                  GH₵{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span className="text-emerald-600 font-medium text-xs">
                  Calculated at checkout
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>GH₵{total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  if (onCheckout) onCheckout();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-sm"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 border border-gray-200 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
