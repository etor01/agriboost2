// app/(dashboard)/orders/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  MessageSquare,
  X,
  Store,
  Truck,
  BoxIcon,
  XCircle,
  ChevronDown,
} from "lucide-react";
import {
  getFarmerOrdersWithEscrow,
  verifyDeliveryOtpAndReleaseEscrow,
  confirmFarmerOrder,
  updateOrderStatus,
  cancelFarmerOrder,
} from "@/app/marketplace/actions";
import { createClient } from "@/lib/supabase/client";
import ChatDrawer from "@/components/messaging/ChatDrawer";
import {
  FarmerPageHeader,
  FarmerStatCard,
  FarmerBadge,
  FarmerCard,
  FarmerEmptyState,
} from "@/components/farmer/ui";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FarmerOrderDisplay {
  id: string;          // transactions.id
  orderId: string;     // orders.id (the real UUID — used for actions + chat)
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

type FilterTab = "all" | "new" | "active" | "completed";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  processing: {
    label: "New Order",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  packed: {
    label: "Packed",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  shipped: {
    label: "Shipped",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrderDisplay | null>(null);
  const [chattingOrder, setChattingOrder] = useState<FarmerOrderDisplay | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<FarmerOrderDisplay | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // orderId being acted on
  const [cancelNote, setCancelNote] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  // ── Data fetch ────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
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
            [buyerProf.firstname, buyerProf.lastname]
              .filter(Boolean)
              .join(" ") || "Verified Buyer";

          return {
            id: tx.id,
            // Always use the real orders.id UUID for actions and chat
            orderId: order.id || tx.order_id || "",
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
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Realtime subscription on orders table ─────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("farmer_orders_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase, fetchOrders]);

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleConfirm = async (order: FarmerOrderDisplay) => {
    setActionLoading(order.orderId);
    const res = await confirmFarmerOrder(order.orderId);
    setActionLoading(null);
    if (!res.success) {
      alert("Error: " + res.error);
    } else {
      fetchOrders();
    }
  };

  const handleUpdateStatus = async (
    order: FarmerOrderDisplay,
    status: "packed" | "shipped"
  ) => {
    setActionLoading(order.orderId + status);
    const res = await updateOrderStatus(order.orderId, status);
    setActionLoading(null);
    if (!res.success) {
      alert("Error: " + res.error);
    } else {
      fetchOrders();
    }
  };

  const handleCancel = async () => {
    if (!cancellingOrder) return;
    setActionLoading(cancellingOrder.orderId + "cancel");
    const res = await cancelFarmerOrder(cancellingOrder.orderId, cancelNote || undefined);
    setActionLoading(null);
    if (!res.success) {
      alert("Error: " + res.error);
    } else {
      setCancellingOrder(null);
      setCancelNote("");
      fetchOrders();
    }
  };

  const handleVerifyOtp = async () => {
    if (!selectedOrder) return;
    if (!otpInput || otpInput.trim().length !== 4) {
      setMessage({
        type: "error",
        text: "Please enter the 4-digit OTP provided by the buyer.",
      });
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const res = await verifyDeliveryOtpAndReleaseEscrow(
        selectedOrder.orderId,
        otpInput
      );
      if (!res.success) {
        setMessage({ type: "error", text: res.error || "Verification failed." });
        setVerifying(false);
        return;
      }

      setMessage({
        type: "success",
        text: `Delivery verified! GH₵ ${selectedOrder.amount.toFixed(
          2
        )} released to your available balance.`,
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
  const newOrders = orders.filter((o) => o.status === "processing");
  const activeOrders = orders.filter((o) =>
    ["confirmed", "packed", "shipped"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  const pendingOrders = orders.filter(
    (o) => o.escrowHeld && o.status !== "delivered"
  );
  const totalEscrowLocked = pendingOrders.reduce((s, o) => s + o.amount, 0);
  const totalCompletedEarnings = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.amount, 0);

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "new") return o.status === "processing";
    if (filterTab === "active")
      return ["confirmed", "packed", "shipped"].includes(o.status);
    if (filterTab === "completed")
      return ["delivered", "cancelled"].includes(o.status);
    return true;
  });

  // ── Render action button(s) per status ────────────────────────────────────
  const renderFarmerActions = (order: FarmerOrderDisplay) => {
    const isLoading = (key: string) => actionLoading === key;

    return (
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        {/* Chat button — always visible except cancelled/delivered */}
        {order.status !== "cancelled" && (
          <button
            onClick={() => setChattingOrder(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors relative"
          >
            <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
            Chat
            {(unreadCounts[order.orderId] || 0) > 0 && (
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full">
                {unreadCounts[order.orderId]}
              </span>
            )}
          </button>
        )}

        {/* Status-specific action */}
        {order.status === "processing" && (
          <>
            <button
              onClick={() => handleConfirm(order)}
              disabled={isLoading(order.orderId)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md text-xs transition-colors shadow-xs disabled:opacity-50"
            >
              {isLoading(order.orderId) ? (
                <span className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Accept Order
            </button>
            <button
              onClick={() => { setCancellingOrder(order); setCancelNote(""); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium rounded-md text-xs transition-colors"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </button>
          </>
        )}

        {order.status === "confirmed" && (
          <button
            onClick={() => handleUpdateStatus(order, "packed")}
            disabled={isLoading(order.orderId + "packed")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            {isLoading(order.orderId + "packed") ? (
              <span className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BoxIcon className="h-3.5 w-3.5" />
            )}
            Mark Packed
          </button>
        )}

        {order.status === "packed" && (
          <button
            onClick={() => handleUpdateStatus(order, "shipped")}
            disabled={isLoading(order.orderId + "shipped")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-md text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            {isLoading(order.orderId + "shipped") ? (
              <span className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Truck className="h-3.5 w-3.5" />
            )}
            Mark Shipped
          </button>
        )}

        {order.status === "shipped" && order.escrowHeld && (
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
        )}

        {order.status === "delivered" && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <FarmerPageHeader
        badge="Fulfillment & Escrow"
        badgeIcon={Package}
        title="Orders & Sales"
        description="Accept incoming orders, update fulfillment status, verify buyer OTPs, and release escrow funds."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FarmerStatCard
          title="New Orders"
          value={newOrders.length}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          sub="Awaiting your confirmation"
        />
        <FarmerStatCard
          title="Active Orders"
          value={activeOrders.length}
          icon={Truck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          sub="In progress"
        />
        <FarmerStatCard
          title="In Escrow"
          value={`GH₵ ${totalEscrowLocked.toFixed(2)}`}
          icon={Lock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          sub="Locked until OTP verification"
        />
        <FarmerStatCard
          title="Paid Out"
          value={`GH₵ ${totalCompletedEarnings.toFixed(2)}`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          sub="Successfully completed"
          accent
        />
      </div>



      {/* New Order Alert Banner */}
      {newOrders.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {newOrders.length} new order{newOrders.length !== 1 ? "s" : ""}{" "}
                awaiting your acceptance
              </p>
              <p className="text-xs text-amber-700">
                Accept or reject each order to notify buyers and update
                inventory.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterTab("new")}
            className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
          >
            View New
          </button>
        </div>
      )}

      {/* Orders Table Container */}
      <FarmerCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2.5 text-zinc-400">
            <div className="h-5 w-5 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
            <span className="text-xs font-medium">Loading orders…</span>
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
                  Orders ({orders.length})
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md">
                {(
                  [
                    ["all", "All", orders.length],
                    ["new", "New", newOrders.length],
                    ["active", "Active", activeOrders.length],
                    ["completed", "Done", completedOrders.length],
                  ] as const
                ).map(([tab, label, count]) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab as FilterTab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize relative ${filterTab === tab
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                      : "text-zinc-500 hover:text-zinc-900"
                      }`}
                  >
                    {label}
                    {tab === "new" && count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {count}
                      </span>
                    )}
                    {tab !== "new" && ` (${count})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="p-3.5">Order & Date</th>
                    <th className="p-3.5">Produce</th>
                    <th className="p-3.5">Buyer</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {filteredOrders.map((order) => {
                    const meta =
                      STATUS_META[order.status] || STATUS_META.processing;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-zinc-50/60 transition-colors"
                      >
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
                          <p className="font-medium text-zinc-900">
                            {order.buyerName}
                          </p>
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
                            {order.escrowHeld && order.status !== "delivered"
                              ? "In Escrow"
                              : order.status === "cancelled"
                                ? "Refunded"
                                : "Released"}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}
                          >
                            {meta.label}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          {renderFarmerActions(order)}
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
              <p className="text-xs font-mono font-semibold text-zinc-500">
                Order #{selectedOrder.orderId.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                Enter the 4-digit code from{" "}
                <strong>{selectedOrder.buyerName}</strong> to release{" "}
                <strong className="text-zinc-900">
                  GH₵ {selectedOrder.amount.toFixed(2)}
                </strong>{" "}
                from escrow.
              </p>
            </div>

            <div className="space-y-1.5 py-1">
              <label className="block text-[11px] font-semibold text-zinc-600 uppercase tracking-wider text-center">
                4-Digit Delivery Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) =>
                  setOtpInput(e.target.value.replace(/\D/g, ""))
                }
                placeholder="• • • •"
                className="w-full text-center font-mono text-2xl font-bold tracking-[0.4em] py-2.5 rounded-md border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 transition-colors"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 ${message.type === "success"
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

      {/* Cancel / Reject Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-zinc-200 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <XCircle className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Reject / Cancel Order
                </h3>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-800 leading-relaxed">
              ⚠️ Cancelling order{" "}
              <strong>#{cancellingOrder.orderId.slice(0, 8).toUpperCase()}</strong>{" "}
              will automatically refund{" "}
              <strong>GH₵ {cancellingOrder.amount.toFixed(2)}</strong> to the
              buyer&apos;s wallet.
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">
                Reason for cancellation{" "}
                <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="e.g. Out of stock, unable to fulfil at this time..."
                rows={3}
                className="w-full text-xs p-3 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading === cancellingOrder.orderId + "cancel"}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                {actionLoading === cancellingOrder.orderId + "cancel" ? (
                  <>
                    <span className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling…
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" />
                    Confirm Cancellation
                  </>
                )}
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
