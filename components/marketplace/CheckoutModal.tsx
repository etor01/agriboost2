/* eslint-disable @typescript-eslint/no-explicit-any */
// components/marketplace/CheckoutModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ArrowRight,
} from "lucide-react";
import { type Listing } from "@/lib/data/marketplaceData";
import { createOrderWithEscrow } from "@/app/marketplace/actions";
import { createClient } from "@/lib/supabase/client";
import { FarmerBadge } from "@/components/farmer/ui";

type CartItem = { listing: Listing; qty: number };

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}

type DeliveryOption = "farm_pickup" | "standard_delivery" | "express_delivery";

const PLATFORM_FEE_RATE = 0.05;

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
    desc: "Direct delivery to your address by verified courier.",
    icon: Truck,
  },
  {
    id: "express_delivery",
    label: "Express Priority",
    fee: 45.0,
    time: "Same Day",
    desc: "Fast-track dispatch for urgent produce deliveries.",
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

  // Success state
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

  const fetchUser = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
        `Insufficient wallet balance. Required: GH₵ ${grandTotal.toFixed(
          2
        )}, Available: GH₵ ${walletBalance.toFixed(2)}. Please top up your wallet first.`
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
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${
          createdOrders ? "max-w-3xl" : "max-w-xl"
        } max-h-[90vh] bg-white rounded-lg border border-zinc-200 shadow-xl overflow-hidden z-10 flex flex-col animate-in fade-in-50 zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Escrow Order Checkout
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">
                AgriBoost Buyer Escrow Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* SUCCESS STATE */}
          {createdOrders ? (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  Order Successfully Placed
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
                  <strong>GH₵ {(checkoutSummary?.grandTotal ?? grandTotal).toFixed(2)}</strong> has been deducted and held safely in escrow. Funds are released to farmers only after you confirm delivery.
                </p>
              </div>

              {/* Delivery OTP Security Card */}
              <div className="bg-zinc-900 text-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                      Delivery Release OTPs
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Hand to driver upon inspection
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {createdOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-zinc-800/80 border border-zinc-700/80 text-xs"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-zinc-100 truncate">
                          {order.title}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          Order #{order.orderId.slice(0, 8).toUpperCase()} · GH₵ {order.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-mono text-sm font-bold tracking-wider bg-zinc-950 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30">
                          {order.otp}
                        </span>
                        <button
                          onClick={() => handleCopyOtp(order.otp)}
                          className="p-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                          title="Copy OTP"
                        >
                          {copiedOtp === order.otp ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <a
                  href="/buyer/orders"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-center text-xs transition-colors shadow-2xs"
                >
                  View My Orders
                </a>
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="flex-1 py-2 border border-zinc-200 text-zinc-700 font-medium rounded-md hover:bg-zinc-50 transition-colors text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <>
              {/* Escrow Guarantee Banner */}
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex items-start gap-2.5 text-xs">
                <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold block text-emerald-900">
                    100% Escrow Guarantee
                  </strong>
                  Payment is locked securely and released to the farmer only when you provide your delivery verification OTP.
                </div>
              </div>

              {/* Wallet Balance Banner */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                  walletLoading
                    ? "border-zinc-200 bg-zinc-50"
                    : hasEnoughBalance
                    ? "border-zinc-200 bg-zinc-50"
                    : "border-red-200 bg-red-50/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center ${
                      walletLoading
                        ? "bg-zinc-200 text-zinc-600"
                        : hasEnoughBalance
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    <Wallet className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block">
                      Wallet Balance
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-zinc-900">
                      {walletLoading
                        ? "Loading…"
                        : `GH₵ ${(walletBalance ?? 0).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={fetchUser}
                    title="Refresh wallet balance"
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${walletLoading ? "animate-spin" : ""}`} />
                  </button>

                  {!walletLoading && !hasEnoughBalance && (
                    <a
                      href="/buyer/wallet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-medium transition-colors shadow-2xs"
                    >
                      <Plus className="h-3 w-3" /> Top Up
                    </a>
                  )}
                </div>
              </div>

              {/* Delivery Option Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-900 mb-2">
                  1. Delivery Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = deliveryOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`text-left p-2.5 rounded-lg border transition-colors flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white shadow-2xs"
                            : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon
                            className={`h-4 w-4 ${
                              isSelected ? "text-emerald-100" : "text-zinc-500"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-emerald-700/80 text-white"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {opt.fee === 0
                              ? "FREE"
                              : `GH₵ ${opt.fee.toFixed(2)}`}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p
                            className={`text-[10px] ${
                              isSelected ? "text-emerald-100" : "text-zinc-400"
                            }`}
                          >
                            {opt.time}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details Form */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-900">
                  2. Contact &amp; Delivery Destination
                </label>

                {deliveryOption !== "farm_pickup" && (
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. House No. 12, Asafo Road, Kumasi"
                        className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-2xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Phone Number (for Courier &amp; OTP verification)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 024 123 4567"
                      className="w-full pl-8 pr-3 py-1.5 rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-zinc-900 placeholder:text-zinc-400 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Order Cost Breakdown */}
              <div className="rounded-lg p-3.5 bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-zinc-500 font-medium">
                  <span>Produce Subtotal ({cart.length} items)</span>
                  <span className="font-semibold text-zinc-800">
                    GH₵ {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 font-medium">
                  <span>{selectedDelivery.label}</span>
                  <span className="font-semibold text-zinc-800">
                    {deliveryFee === 0
                      ? "FREE"
                      : `GH₵ ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    Escrow Platform Fee
                    <FarmerBadge variant="muted">5%</FarmerBadge>
                  </span>
                  <span className="font-semibold text-zinc-800">
                    GH₵ {platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
                  <span>Grand Total</span>
                  <span className="text-zinc-900">
                    GH₵ {grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {error.includes("wallet") && (
                      <a
                        href="/buyer/wallet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold text-red-800 mt-1 inline-block"
                      >
                        → Top up wallet here
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Action */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={executeCheckout}
                  disabled={loading || walletLoading || !hasEnoughBalance}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors shadow-2xs flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Locking Funds in Escrow…</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="h-3.5 w-3.5" />
                      <span>Pay GH₵ {grandTotal.toFixed(2)} with Wallet</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

