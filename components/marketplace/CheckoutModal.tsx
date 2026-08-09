/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Sparkles,
  Store,
  Zap,
  Wallet,
  AlertCircle,
  RefreshCw,
  Plus,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import { createOrderWithEscrow } from "@/app/marketplace/actions";
import { createClient } from "@/lib/supabase/client";

type CartItem = { listing: Listing; qty: number };

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}

type DeliveryOption = "farm_pickup" | "standard_delivery" | "express_delivery";

const PLATFORM_FEE_RATE = 0.05; // must match actions.ts

const DELIVERY_OPTIONS: Array<{
  id: DeliveryOption;
  label: string;
  fee: number;
  time: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: "standard_delivery",
    label: "Standard Delivery",
    fee: 25.0,
    time: "24 – 48 Hours",
    desc: "Delivered directly to your address by verified logistics.",
    icon: Truck,
  },
  {
    id: "express_delivery",
    label: "Express Priority",
    fee: 45.0,
    time: "Same Day",
    desc: "Priority dispatch for urgent farm produce orders.",
    icon: Zap,
  },
  {
    id: "farm_pickup",
    label: "Farm Pickup",
    fee: 0.0,
    time: "Ready Today",
    desc: "Pick up directly from the farmer's designated location.",
    icon: Store,
  },
];

export default function CheckoutModal({
  cart,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("standard_delivery");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);

  // Success celebration state
  const [createdOrders, setCreatedOrders] = useState<
    Array<{
      orderId: string;
      title: string;
      total: number;
      otp: string;
    }> | null
  >(null);
  const [checkoutSummary, setCheckoutSummary] = useState<{
    grandTotal: number;
    platformFee: number;
    deliveryFee: number;
    farmerEarns: number;
  } | null>(null);

  // Pre-fill user profile info + fetch wallet balance
  useEffect(() => {
    const fetchUser = async () => {
      setWalletLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, location, wallet_balance")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.phone) setPhone(profile.phone);
          if (profile.location) setAddress(profile.location);
          setWalletBalance(Number(profile.wallet_balance ?? 0));
        }
      }
      setWalletLoading(false);
    };
    fetchUser();
  }, []);

  const selectedDelivery =
    DELIVERY_OPTIONS.find((o) => o.id === deliveryOption) ||
    DELIVERY_OPTIONS[0];

  const subtotal = cart.reduce((s, i) => s + i.listing.price * i.qty, 0);
  const deliveryFee = selectedDelivery.fee;
  const platformFee = Number(
    ((subtotal + deliveryFee) * PLATFORM_FEE_RATE).toFixed(2)
  );
  const grandTotal = Number((subtotal + deliveryFee + platformFee).toFixed(2));
  const farmerEarns = Number((subtotal - platformFee).toFixed(2));

  const hasEnoughBalance = walletBalance !== null && walletBalance >= grandTotal;

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const executeCheckout = async () => {
    if (!address.trim() && deliveryOption !== "farm_pickup") {
      setError("Please enter a delivery address.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter a phone number so the courier can reach you.");
      return;
    }
    if (walletBalance === null) {
      setError("Could not load wallet balance. Please try again.");
      return;
    }
    if (walletBalance < grandTotal) {
      setError(
        `Insufficient wallet balance. You need GH₵ ${grandTotal.toFixed(
          2
        )} but have GH₵ ${walletBalance.toFixed(2)}. Please top up your wallet first.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: cart.map((item) => ({
          listingId: item.listing.id,
          title: item.listing.title,
          price: item.listing.price,
          qty: item.qty,
          unit: item.listing.unit,
          farmerProfileId:
            (item.listing as any).profile_id ||
            (item.listing as any).farmer_id ||
            "",
        })),
        deliveryOption,
        deliveryFee,
        deliveryAddress:
          deliveryOption === "farm_pickup" ? "Farm Pickup" : address,
        phone,
        paystackRef: `WALLET-${Date.now()}`,
      };

      const res = await createOrderWithEscrow(payload);

      if (!res.success || !res.orders) {
        setError(res.error || "Something went wrong creating your order.");
        setLoading(false);
        return;
      }

      setCreatedOrders(res.orders);
      setCheckoutSummary({
        grandTotal: res.grandTotal ?? grandTotal,
        platformFee: res.platformFee ?? platformFee,
        deliveryFee: res.deliveryFee ?? deliveryFee,
        farmerEarns: res.farmerEarns ?? farmerEarns,
      });
      // Update local wallet balance display
      if (walletBalance !== null) {
        setWalletBalance(
          Number((walletBalance - (res.grandTotal ?? grandTotal)).toFixed(2))
        );
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className={`relative w-full ${createdOrders ? "max-w-4xl h-[90vh] lg:h-[80vh]" : "max-w-2xl max-h-[90vh]"} bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-white to-green-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Escrow Checkout
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                100% Secure · Protected by AgriBoost Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* ── SUCCESS SCREEN ────────────────────────────────────────────────── */}
          {createdOrders ? (
            <div className="flex flex-col lg:flex-row gap-8 py-4 h-full">
              {/* Left Column: Success Message & Breakdown */}
              <div className="flex-1 space-y-6 lg:border-r lg:border-gray-100 lg:pr-8 flex flex-col justify-center">
                <div className="text-center lg:text-left">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner mb-6 mx-auto lg:mx-0">
                    <CheckCircle2 className="h-11 w-11 text-emerald-600 animate-bounce" />
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
                    <Lock className="h-3 w-3" />
                    AgriBoost Escrow Protected
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                    <strong>GH₵ {(checkoutSummary?.grandTotal ?? grandTotal).toFixed(2)}</strong> deducted from your wallet and securely held in escrow. It will only be released to the farmer after you inspect and confirm your delivery.
                  </p>
                </div>

                {checkoutSummary && (
                  <div className="bg-gray-50 border border-gray-200 rounded-3xl p-5 text-sm space-y-3 mt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Breakdown</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Products subtotal</span>
                      <span className="font-semibold">GH₵ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery fee</span>
                      <span className="font-semibold">{checkoutSummary.deliveryFee === 0 ? "FREE" : `GH₵ ${checkoutSummary.deliveryFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Platform fee (5%)</span>
                      <span className="font-semibold text-red-600">GH₵ {checkoutSummary.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-gray-900 pt-3 border-t border-gray-200 text-lg">
                      <span>Total Charged</span>
                      <span className="text-emerald-700">GH₵ {checkoutSummary.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: OTPs & Actions */}
              <div className="flex-1 space-y-6 flex flex-col justify-center">
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 text-white rounded-3xl p-7 text-left shadow-2xl relative overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                  
                  <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-sm font-bold uppercase tracking-widest text-emerald-300 block mb-0.5">
                          Delivery OTPs
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          Hand to farmer upon delivery
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {createdOrders.map((order) => (
                      <div
                        key={order.orderId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl p-4 border border-white/10"
                      >
                        <div>
                          <p className="text-sm font-bold text-white mb-1">
                            {order.title}
                          </p>
                          <p className="text-xs text-emerald-200/80 font-medium">
                            Order #{order.orderId.slice(0, 8).toUpperCase()} · GH₵ {order.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xl font-black tracking-widest bg-black/40 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30 shadow-inner">
                            {order.otp}
                          </span>
                          <button
                            onClick={() => handleCopyOtp(order.otp)}
                            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Copy OTP"
                          >
                            {copiedOtp === order.otp ? (
                              <Check className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <a
                    href="/buyer/orders"
                    className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all text-center shadow-lg hover:shadow-xl text-sm"
                  >
                    View My Orders →
                  </a>
                  <button
                    onClick={() => {
                      onSuccess();
                      onClose();
                    }}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ── CHECKOUT FORM ─────────────────────────────────────────────── */}

              {/* Escrow Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-2xl shadow-md flex items-start gap-3.5">
                <div className="p-2 bg-white/20 rounded-xl flex-shrink-0">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="text-xs leading-relaxed">
                  <p className="font-extrabold text-sm text-white mb-0.5">
                    AgriBoost 100% Escrow Guarantee
                  </p>
                  Your payment is held in secure escrow and is{" "}
                  <strong>NEVER released to the farmer</strong> until you
                  confirm receipt of your produce via your Delivery OTP.
                </div>
              </div>

              {/* ── Wallet Balance Banner ─────────────────────────────────────── */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                  walletLoading
                    ? "border-gray-200 bg-gray-50"
                    : hasEnoughBalance
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-red-300 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      walletLoading
                        ? "bg-gray-200"
                        : hasEnoughBalance
                        ? "bg-emerald-600"
                        : "bg-red-500"
                    } text-white`}
                  >
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Your Wallet Balance
                    </p>
                    <p
                      className={`text-xl font-extrabold ${
                        walletLoading
                          ? "text-gray-400"
                          : hasEnoughBalance
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {walletLoading
                        ? "Loading..."
                        : `GH₵ ${(walletBalance ?? 0).toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {!walletLoading && !hasEnoughBalance && (
                  <a
                    href="/buyer/wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Top Up
                  </a>
                )}
              </div>

              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  1. Choose Delivery Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = deliveryOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? "text-emerald-600" : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {opt.fee === 0
                              ? "FREE"
                              : `GH₵ ${opt.fee.toFixed(2)}`}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {opt.time}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-900">
                  2. Delivery & Contact Details
                </label>

                {deliveryOption !== "farm_pickup" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 14 Asafo Street, Kumasi / House Number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Phone Number (for Courier / OTP verification)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +233 24 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  3. Order Summary ({cart.length} item
                  {cart.length !== 1 ? "s" : ""})
                </h4>
                <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.listing.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-gray-800">
                          {item.qty}x
                        </span>
                        <span className="text-gray-700 truncate">
                          {item.listing.title}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900 flex-shrink-0">
                        GH₵ {(item.listing.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-3 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedDelivery.label}</span>
                    <span className="font-medium">
                      {deliveryFee === 0
                        ? "FREE"
                        : `GH₵ ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      Platform fee
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                        5%
                      </span>
                    </span>
                    <span className="font-medium text-red-600">
                      GH₵ {platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
                    <span>Total (from wallet)</span>
                    <span className="text-emerald-700">
                      GH₵ {grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-600 pt-0.5">
                    <span>Farmer earns (after fees)</span>
                    <span className="font-bold">GH₵ {farmerEarns.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {error.includes("wallet") && (
                      <a
                        href="/buyer/wallet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold text-red-700 mt-1 inline-block"
                      >
                        → Top up your wallet
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={executeCheckout}
                  disabled={loading || walletLoading || !hasEnoughBalance}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-extrabold rounded-2xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl active:scale-[0.99] flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Locking Funds in Escrow...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      Pay GH₵ {grandTotal.toFixed(2)} from Wallet
                    </>
                  )}
                </button>

                {!walletLoading && !hasEnoughBalance && (
                  <a
                    href="/buyer/wallet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-white border-2 border-emerald-600 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Load Wallet to Pay (need GH₵{" "}
                    {(grandTotal - (walletBalance ?? 0)).toFixed(2)} more)
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
