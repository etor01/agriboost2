// app/buyer/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { OrderStepper } from "@/components/ui/OrderStepper";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Lock,
  Copy,
  Check,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Star,
  MessageSquare,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getBuyerOrdersWithEscrow,
  confirmDeliveryAndReleaseEscrow,
  submitReview,
} from "@/app/marketplace/actions";
import ChatDrawer from "@/components/messaging/ChatDrawer";
import { createClient } from "@/lib/supabase/client";
import { FarmerPageHeader, FarmerEmptyState } from "@/components/farmer/ui";

type OrderStatus = "processing" | "confirmed" | "delivered" | "cancelled";

interface DisplayOrder {
  id: string;
  product: string;
  farmer: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
  status: OrderStatus;
  date: string;
  image: string;
  deliveryOtp: string;
  escrowHeld: boolean;
  isRealOrder: boolean;
  farmerId: string;
  listingId: string;
  hasReviewed: boolean;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  processing: {
    label: "Processing",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    Icon: Clock,
  },
  confirmed: {
    label: "In Transit",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    Icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    Icon: XCircle,
  },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<DisplayOrder | null>(
    null
  );
  const [reviewingOrder, setReviewingOrder] = useState<DisplayOrder | null>(null);
  const [chattingOrder, setChattingOrder] = useState<DisplayOrder | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const [releasing, setReleasing] = useState(false);
  const supabase = createClient();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: unreadMsgs } = await supabase
          .from("messages")
          .select("order_id")
          .neq("sender_id", user.id)
          .eq("read", false);

        if (unreadMsgs) {
          const counts: Record<string, number> = {};
          unreadMsgs.forEach((m: any) => {
            counts[m.order_id] = (counts[m.order_id] || 0) + 1;
          });
          setUnreadCounts(counts);
        }
      }

      const liveOrders = await getBuyerOrdersWithEscrow();
      const mapped: DisplayOrder[] = (liveOrders || []).map((o: any) => {
        const listing = o.listings || {};
        const farmerProfile =
          listing.profiles || listing.farmers?.profiles || {};
        const farmerName =
          [farmerProfile.firstname, farmerProfile.lastname]
            .filter(Boolean)
            .join(" ") || "Verified Farmer";

        const tx =
          (Array.isArray(o.transactions)
            ? o.transactions[0]
            : o.transactions) || {};
        const isHeld =
          tx.escrow_held !== undefined ? tx.escrow_held : o.status !== "delivered";

        return {
          id: o.id,
          product: listing.name || "Farm Produce",
          farmer: farmerName,
          qty: o.quantity || 1,
          unit: listing.unit_type || "unit",
          price: Number(o.unit_price) || 0,
          total: Number(o.total_amount) || 0,
          status: (o.status as OrderStatus) || "processing",
          date: o.created_at || new Date().toISOString(),
          image:
            (listing.image_urls && listing.image_urls[0]) ||
            "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
          deliveryOtp: o.delivery_otp || "----",
          escrowHeld: isHeld,
          isRealOrder: true,
          farmerId: farmerProfile.id || listing.profile_id,
          listingId: listing.id || o.listing_id,
          hasReviewed: Array.isArray(o.reviews) && o.reviews.length > 0,
        };
      });
      setOrders(mapped);
    } catch (e) {
      console.error("Failed to load orders:", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const handleReleaseEscrow = async () => {
    if (!confirmingOrder) return;
    setReleasing(true);
    try {
      const res = await confirmDeliveryAndReleaseEscrow(confirmingOrder.id);
      if (!res.success) {
        alert("Error releasing escrow: " + res.error);
        return;
      }
      setConfirmingOrder(null);
      fetchOrders();
    } catch (e: any) {
      alert("Failed to release escrow: " + e.message);
    } finally {
      setReleasing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewingOrder) return;
    setSubmittingReview(true);
    try {
      const res = await submitReview({
        orderId: reviewingOrder.id,
        farmerId: reviewingOrder.farmerId,
        listingId: reviewingOrder.listingId,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (!res.success) {
        alert("Error submitting review: " + res.error);
        return;
      }

      setReviewingOrder(null);
      setReviewRating(5);
      setReviewComment("");
      fetchOrders();
    } catch (e: any) {
      alert("Failed to submit review: " + e.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const totalEscrowHeld = orders
    .filter((o) => o.escrowHeld && o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const pendingDeliveries = orders.filter(
    (o) => o.status === "processing" || o.status === "confirmed"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <FarmerPageHeader
        badge="Orders & Escrow"
        title="My Orders & Escrow Protection"
        description="Track active deliveries, retrieve your verification OTP, and safely release funds upon receipt."
        action={
          <div className="flex items-center gap-2">
            <div className="bg-white border border-zinc-200 rounded-lg px-3.5 py-1.5 shadow-2xs">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Escrow Locked
              </p>
              <p className="text-sm font-bold text-amber-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                GH₵ {totalEscrowHeld.toFixed(2)}
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg px-3.5 py-1.5 shadow-2xs">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Total Spent
              </p>
              <p className="text-sm font-bold text-emerald-700">
                GH₵ {totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        }
      />

      {/* Active Deliveries OTP Retrieval Banner */}
      {pendingDeliveries.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" /> Active Deliveries
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Provide OTP upon receiving produce
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingDeliveries.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-emerald-200/80 rounded-lg p-3.5 flex items-center justify-between shadow-2xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900 text-xs truncate max-w-[120px]">
                    {order.product}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 mb-0.5">
                    Delivery OTP
                  </span>
                  <div className="flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1 rounded border border-emerald-200">
                    <span className="font-mono font-bold text-sm tracking-widest text-emerald-900">
                      {order.deliveryOtp}
                    </span>
                    <button
                      onClick={() => handleCopyOtp(order.deliveryOtp)}
                      className="p-0.5 rounded hover:bg-emerald-100 text-zinc-500 hover:text-emerald-700 transition-colors"
                      title="Copy OTP"
                    >
                      {copiedOtp === order.deliveryOtp ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escrow Guarantee Banner */}
      <div className="p-3.5 sm:p-4 bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 rounded-xl shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-bold text-emerald-900">100% Escrow Protection:</strong> Funds remain securely locked in AgriBoost escrow until you receive your produce and click &ldquo;Confirm Delivery&rdquo; or provide your 4-digit Delivery OTP to the verified farmer.
        </div>
      </div>

      {/* Status Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = orders.filter((o) => o.status === status).length;
          const Icon = cfg.Icon;
          return (
            <div
              key={status}
              className="bg-white border border-zinc-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs"
            >
              <div
                className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-zinc-900">{count}</p>
                <p className="text-[11px] text-zinc-500 font-medium">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table or States */}
      {loading ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-pulse">
            <Package className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold text-zinc-600">
            Loading your escrow-protected orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <FarmerEmptyState
          icon={ShoppingBag}
          title="No Produce Orders Yet"
          description="When you order fresh produce from verified farmers on AgriBoost, your funds are safely locked in escrow until delivery is confirmed."
          action={{
            label: "Browse Marketplace",
            onClick: () => {
              window.location.href = "/buyer/shop";
            },
          }}
        />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-600" />
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Escrow Order History
              </h2>
            </div>
            <span className="text-xs text-zinc-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-500 font-semibold">
                  <th className="text-left px-4 py-3">Order ID</th>
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3">Qty &amp; Total</th>
                  <th className="text-left px-4 py-3">Delivery OTP</th>
                  <th className="text-left px-4 py-3">Escrow Status</th>
                  <th className="text-left px-4 py-3">Status &amp; Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => {
                  const { label, color, bg, border, Icon } = STATUS_CONFIG[order.status];
                  const isHeld = order.escrowHeld && order.status !== "delivered";
                  const unreadCount = unreadCounts[order.id] || 0;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-500 font-semibold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.image}
                            alt={order.product}
                            className="w-10 h-10 rounded-lg object-cover border border-zinc-100"
                          />
                          <div>
                            <p className="font-semibold text-zinc-900">
                              {order.product}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {order.farmer}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-zinc-900">
                          GH₵ {order.total.toFixed(2)}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {order.qty} {order.unit}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5">
                          <span className="font-mono font-bold text-xs text-zinc-800 tracking-wider">
                            {order.deliveryOtp}
                          </span>
                          <button
                            onClick={() => handleCopyOtp(order.deliveryOtp)}
                            className="p-0.5 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Copy Delivery OTP"
                          >
                            {copiedOtp === order.deliveryOtp ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {isHeld ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Lock className="h-3 w-3" />
                            In Escrow
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Released
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 w-60">
                        <div className="flex flex-col gap-2.5 items-start w-full">
                          <OrderStepper status={order.status} />

                          {order.status !== "delivered" &&
                            order.status !== "cancelled" && (
                              <div className="w-full flex gap-1.5">
                                <button
                                  onClick={() => setChattingOrder(order)}
                                  className="text-[11px] font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded transition-colors shadow-2xs flex items-center justify-center gap-1 flex-1 relative"
                                >
                                  <MessageSquare className="h-3 w-3" /> Message
                                  {unreadCount > 0 && (
                                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full ml-0.5">
                                      {unreadCount}
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmingOrder(order)}
                                  className="text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded transition-colors shadow-2xs flex items-center gap-1 flex-1 justify-center"
                                >
                                  Confirm →
                                </button>
                              </div>
                            )}

                          {order.status === "delivered" && !order.hasReviewed && (
                            <button
                              onClick={() => setReviewingOrder(order)}
                              className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors shadow-2xs flex items-center gap-1 w-full justify-center"
                            >
                              <Star className="h-3 w-3" /> Leave Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-zinc-100">
            {orders.map((order) => {
              const { label, color, bg, border, Icon } = STATUS_CONFIG[order.status];
              const isHeld = order.escrowHeld && order.status !== "delivered";
              const unreadCount = unreadCounts[order.id] || 0;

              return (
                <div key={order.id} className="p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.image}
                        alt={order.product}
                        className="w-11 h-11 rounded-lg object-cover border border-zinc-100"
                      />
                      <div>
                        <p className="font-bold text-zinc-900">
                          {order.product}
                        </p>
                        <p className="text-[11px] text-zinc-500">{order.farmer}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {order.qty} {order.unit} &bull;{" "}
                          <strong className="text-zinc-900 font-bold">
                            GH₵ {order.total.toFixed(2)}
                          </strong>
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${bg} ${border} ${color} border`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Delivery OTP</span>
                      <span className="font-mono font-bold text-xs text-zinc-800">
                        {order.deliveryOtp}
                      </span>
                    </div>

                    <div>
                      {isHeld ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          🔒 In Escrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          ✅ Released
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-2">
                    <OrderStepper status={order.status} />
                  </div>

                  <div className="flex flex-col gap-2">
                    {order.status !== "delivered" &&
                      order.status !== "cancelled" && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => setChattingOrder(order)}
                            className="flex-1 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 py-1.5 rounded-lg shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Message
                            {unreadCount > 0 && (
                              <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 rounded-full ml-0.5">
                                {unreadCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmingOrder(order)}
                            className="flex-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-1.5 rounded-lg shadow-2xs"
                          >
                            Confirm Delivery
                          </button>
                        </div>
                      )}

                    {order.status === "delivered" && !order.hasReviewed && (
                      <button
                        onClick={() => setReviewingOrder(order)}
                        className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-1.5 rounded-lg shadow-2xs w-full flex items-center justify-center gap-1"
                      >
                        <Star className="h-3.5 w-3.5" /> Leave a Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmingOrder(null)}
          />
          <div className="relative bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl z-10 space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-zinc-900">
                Confirm Produce Delivery
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Did you receive your order of{" "}
                <strong>{confirmingOrder.product}</strong> in good condition?
              </p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg p-3 text-xs text-emerald-900 leading-relaxed">
              💡 By confirming delivery, the locked escrow balance of{" "}
              <strong>GH₵ {confirmingOrder.total.toFixed(2)}</strong> will be
              instantly released to <strong>{confirmingOrder.farmer}</strong>.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleReleaseEscrow}
                disabled={releasing}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50"
              >
                {releasing
                  ? "Releasing Escrow..."
                  : "Yes, Confirm & Release"}
              </button>
              <button
                onClick={() => setConfirmingOrder(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setReviewingOrder(null)}
          />
          <div className="relative bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl z-10 space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700">
              <Star className="h-5 w-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-zinc-900">
                Rate Your Experience
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                How was the <strong>{reviewingOrder.product}</strong> from <strong>{reviewingOrder.farmer}</strong>?
              </p>
            </div>

            <div className="flex justify-center gap-1.5 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-6 w-6 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-300"}`}
                  />
                </button>
              ))}
            </div>

            <div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Optional: Tell us more about the produce freshness and delivery speed..."
                className="w-full text-xs p-3 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none min-h-[90px] resize-none shadow-2xs placeholder:text-zinc-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
              <button
                onClick={() => setReviewingOrder(null)}
                className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      {chattingOrder && (
        <ChatDrawer
          isOpen={true}
          onClose={() => {
            setChattingOrder(null);
            fetchOrders();
          }}
          orderId={chattingOrder.id}
          currentUserId={currentUserId}
          recipientName={chattingOrder.farmer}
        />
      )}
    </div>
  );
}


