// app/(dashboard)/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  KeyRound,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  X,
  Store,
} from "lucide-react";
import {
  getFarmerOrdersWithEscrow,
  verifyDeliveryOtpAndReleaseEscrow,
} from "@/app/marketplace/actions";
import { createClient } from "@/lib/supabase/client";
import ChatDrawer from "@/components/messaging/ChatDrawer";
import {
  FarmerPageHeader,
  FarmerStatCard,
  FarmerBadge,
  FarmerCard,
  FarmerCardHeader,
  FarmerCardContent,
  FarmerEmptyState,
} from "@/components/farmer/ui";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FarmerOrderDisplay {
  id: string;
  orderId: string;
  product: string;
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  qty: number;
  unit: string;
  amount: number;
  status: string;
  escrowHeld: boolean;
  date: string;
  image: string;
}

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "completed">("all");
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrderDisplay | null>(null);
  const [chattingOrder, setChattingOrder] = useState<FarmerOrderDisplay | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

      const liveData = await getFarmerOrdersWithEscrow();
      if (liveData && liveData.length > 0) {
        const mapped: FarmerOrderDisplay[] = liveData.map((tx: any) => {
          const order = tx.orders || {};
          const listing = order.listings || {};
          const buyer = order.buyers || {};
          const buyerProf = buyer.profiles || {};
          const buyerName =
            [buyerProf.firstname, buyerProf.lastname].filter(Boolean).join(" ") ||
            "Verified Buyer";

          return {
            id: tx.id,
            orderId: order.id || "ORD-" + tx.id.slice(0, 4),
            product: listing.name || "Farm Produce",
            buyerName,
            buyerPhone: buyerProf.phone || "+233 24 000 0000",
            deliveryAddress: buyer.delivery_address || "Standard Delivery",
            qty: order.quantity || 1,
            unit: listing.unit_type || "unit",
            amount: Number(tx.amount) || 0,
            status: order.status || "processing",
            escrowHeld: tx.escrow_held,
            date: tx.created_at || new Date().toISOString(),
            image:
              (listing.image_urls && listing.image_urls[0]) ||
              "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
          };
        });
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error loading farmer orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── OTP handler ───────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!selectedOrder) return;
    if (!otpInput || otpInput.trim().length !== 4) {
      setMessage({ type: "error", text: "Please enter the 4-digit OTP provided by the buyer." });
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const res = await verifyDeliveryOtpAndReleaseEscrow(selectedOrder.orderId, otpInput);
      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Verification failed." });
        setVerifying(false);
        return;
      }

      setMessage({
        type: "success",
        text: `Delivery verified! GH₵ ${selectedOrder.amount.toFixed(2)} released to your available balance.`,
      });
      setTimeout(() => {
        setSelectedOrder(null);
        setOtpInput("");
        setMessage(null);
        fetchOrders();
      }, 1500);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to verify OTP." });
    } finally {
      setVerifying(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const pendingOrders = orders.filter((o) => o.escrowHeld && o.status !== "delivered");
  const completedOrders = orders.filter((o) => !o.escrowHeld || o.status === "delivered");
  const totalEscrowLocked = pendingOrders.reduce((s, o) => s + o.amount, 0);
  const totalCompletedEarnings = completedOrders.reduce((s, o) => s + o.amount, 0);

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "pending") return o.escrowHeld && o.status !== "delivered";
    if (filterTab === "completed") return !o.escrowHeld || o.status === "delivered";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Fulfillment & Escrow"
        badgeIcon={Package}
        title="Orders &amp; Sales"
        description="Track incoming produce orders, verify buyer Delivery OTP codes, and release escrow funds directly to your wallet."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FarmerStatCard
          title="In Escrow Protection"
          value={`GH₵ ${totalEscrowLocked.toFixed(2)}`}
          icon={Lock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          sub="Locked until buyer OTP verification"
        />
        <FarmerStatCard
          title="Paid Out Earnings"
          value={`GH₵ ${totalCompletedEarnings.toFixed(2)}`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          sub="Successfully completed deliveries"
          accent
        />
        <FarmerStatCard
          title="Incoming Orders"
          value={orders.length}
          icon={Package}
          iconColor="text-teal-600"
          iconBg="bg-teal-50 border-teal-100"
          sub="Total sales records"
        />
      </div>

      {/* Escrow Guidance Banner */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-900 text-white p-5 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              AgriBoost Escrow Verification Flow
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
              1. Ship produce to the buyer&apos;s delivery address. 2. When the buyer inspects and accepts their delivery, request their <strong className="text-emerald-400">4-digit Delivery OTP</strong>. 3. Click <strong>&ldquo;Verify OTP&rdquo;</strong> to immediately release funds to your wallet.
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <FarmerCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2.5 text-zinc-400">
            <div className="h-5 w-5 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
            <span className="text-xs font-medium">Loading sales orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <FarmerEmptyState
              icon={Package}
              title="No orders yet"
              description="Incoming sales orders will appear here once buyers purchase your produce on the marketplace."
              action={
                <Link
                  href="/my-listings"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <Store className="h-4 w-4" /> Manage Listings
                </Link>
              }
            />
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-semibold text-zinc-900">
                  Incoming Orders ({orders.length})
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md">
                {(["all", "pending", "completed"] as const).map((tab) => {
                  const count =
                    tab === "all"
                      ? orders.length
                      : tab === "pending"
                      ? pendingOrders.length
                      : completedOrders.length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                        filterTab === tab
                          ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      {tab === "all" ? "All" : tab === "pending" ? "In Escrow" : "Delivered"} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="p-3.5">Order ID &amp; Date</th>
                    <th className="p-3.5">Produce</th>
                    <th className="p-3.5">Buyer</th>
                    <th className="p-3.5">Escrow Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredOrders.map((order) => {
                    const isHeld = order.escrowHeld && order.status !== "delivered";
                    const unreadCount = unreadCounts[order.orderId] || 0;

                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="p-3.5">
                          <p className="font-mono text-xs font-semibold text-zinc-900">
                            #{order.orderId.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {new Date(order.date).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.image}
                              alt={order.product}
                              className="w-9 h-9 rounded-md object-cover border border-zinc-100 flex-shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-zinc-900 truncate max-w-[140px]">
                                {order.product}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {order.qty} {order.unit}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <p className="font-medium text-zinc-900">{order.buyerName}</p>
                          <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-zinc-400" />
                            {order.buyerPhone}
                          </p>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 max-w-[160px] truncate">
                            <MapPin className="h-3 w-3 text-zinc-400 flex-shrink-0" />
                            {order.deliveryAddress}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <p className="text-xs font-bold text-zinc-900">
                            GH₵ {order.amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {isHeld ? "Escrow Protected" : "Released"}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <FarmerBadge variant={isHeld ? "warn" : "success"}>
                            {isHeld ? "In Escrow" : "Delivered"}
                          </FarmerBadge>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setChattingOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
                              Chat
                              {unreadCount > 0 && (
                                <span className="bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full">
                                  {unreadCount}
                                </span>
                              )}
                            </button>

                            {isHeld ? (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOtpInput("");
                                  setMessage(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs transition-colors shadow-xs"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                                Verify OTP
                              </button>
                            ) : (
                              <span className="text-xs text-zinc-400 font-medium px-2">
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </FarmerCard>

      {/* OTP Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-zinc-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Verify Buyer Delivery OTP
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <FarmerBadge variant="muted">
                Order #{selectedOrder.orderId.slice(0, 8).toUpperCase()}
              </FarmerBadge>
              <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                Enter the 4-digit verification code from <strong>{selectedOrder.buyerName}</strong> to release <strong className="text-zinc-900">GH₵ {selectedOrder.amount.toFixed(2)}</strong> from escrow.
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5 py-1">
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider text-center">
                4-Digit Delivery Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • •"
                className="w-full text-center font-mono text-2xl font-bold tracking-[0.4em] py-2.5 rounded-md border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 transition-colors"
              />
            </div>

            {/* Status message */}
            {message && (
              <div
                className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otpInput.length !== 4}
                className="px-4 py-2 bg-zinc-900 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {verifying ? "Verifying…" : "Verify & Release Escrow"}
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
          orderId={chattingOrder.orderId}
          currentUserId={currentUserId}
          recipientName={chattingOrder.buyerName}
        />
      )}
    </div>
  );
}


