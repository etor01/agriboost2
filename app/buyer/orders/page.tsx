// app/(buyer)/orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  getBuyerOrdersWithEscrow,
  confirmDeliveryAndReleaseEscrow,
} from "@/app/marketplace/actions";

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
}

const MOCK_ORDERS: DisplayOrder[] = [
  {
    id: "ORD-001",
    product: "Fresh Tomatoes",
    farmer: "Kwame Asante Farms",
    qty: 10,
    unit: "kg",
    price: 5.5,
    total: 55,
    status: "delivered",
    date: "2026-07-22",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
    deliveryOtp: "4829",
    escrowHeld: false,
    isRealOrder: false,
  },
  {
    id: "ORD-002",
    product: "Organic Plantains",
    farmer: "Ama Serwaa Harvest Co.",
    qty: 5,
    unit: "bunch",
    price: 8.0,
    total: 40,
    status: "confirmed",
    date: "2026-07-27",
    image:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80&h=80&fit=crop",
    deliveryOtp: "7104",
    escrowHeld: true,
    isRealOrder: false,
  },
  {
    id: "ORD-003",
    product: "Garden Eggs",
    farmer: "Mensah Family Farm",
    qty: 3,
    unit: "kg",
    price: 4.0,
    total: 12,
    status: "processing",
    date: "2026-07-28",
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=80&h=80&fit=crop",
    deliveryOtp: "9312",
    escrowHeld: true,
    isRealOrder: false,
  },
  {
    id: "ORD-004",
    product: "Sweet Peppers",
    farmer: "Volta Valley Agro",
    qty: 2,
    unit: "kg",
    price: 6.5,
    total: 13,
    status: "cancelled",
    date: "2026-07-15",
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=80&h=80&fit=crop",
    deliveryOtp: "2198",
    escrowHeld: false,
    isRealOrder: false,
  },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  processing: {
    label: "Processing",
    color: "text-amber-600",
    bg: "bg-amber-50",
    Icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    Icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    Icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
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
  const [releasing, setReleasing] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const liveOrders = await getBuyerOrdersWithEscrow();
      if (liveOrders && liveOrders.length > 0) {
        const mapped: DisplayOrder[] = liveOrders.map((o: any) => {
          const listing = o.listings || {};
          const farmerProfile = listing.profiles || {};
          const farmerName =
            [farmerProfile.firstname, farmerProfile.lastname]
              .filter(Boolean)
              .join(" ") || "Verified Farmer";

          const tx = (o.transactions && o.transactions[0]) || {};
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
            deliveryOtp: o.delivery_otp || "4829",
            escrowHeld: isHeld,
            isRealOrder: true,
          };
        });
        setOrders(mapped);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
      setOrders(MOCK_ORDERS);
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
      if (confirmingOrder.isRealOrder) {
        const res = await confirmDeliveryAndReleaseEscrow(confirmingOrder.id);
        if (!res.success) {
          alert("Error releasing escrow: " + res.error);
          return;
        }
      } else {
        // Local state update for demo order
        setOrders((prev) =>
          prev.map((o) =>
            o.id === confirmingOrder.id
              ? { ...o, status: "delivered", escrowHeld: false }
              : o
          )
        );
      }
      setConfirmingOrder(null);
      fetchOrders();
    } catch (e: any) {
      alert("Failed to release escrow: " + e.message);
    } finally {
      setReleasing(false);
    }
  };

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  const totalEscrowHeld = orders
    .filter((o) => o.escrowHeld && o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Orders & Escrow
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track deliveries, view verification OTPs, and release escrow upon
            receipt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-400 font-medium">Escrow Locked</p>
            <p className="text-lg font-bold text-amber-600 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              GH₵ {totalEscrowHeld.toFixed(2)}
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-gray-400 font-medium">Total Spent</p>
            <p className="text-lg font-bold text-emerald-700">
              GH₵ {totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Escrow Information Banner */}
      <div className="mb-7 p-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 text-white rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              AgriBoost 100% Buyer Escrow Protection
            </h3>
            <p className="text-xs text-white/90 max-w-xl leading-relaxed mt-0.5">
              Farmers only receive payment after you receive your produce and click{" "}
              <strong>&ldquo;Confirm Delivery&rdquo;</strong> or give them your 4-digit
              Delivery OTP.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = orders.filter((o) => o.status === status).length;
          const Icon = cfg.Icon;
          return (
            <div
              key={status}
              className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}
              >
                <Icon className={`h-4 w-4 ${cfg.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-800">
              Escrow Order History
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Qty & Total
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Delivery OTP
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Escrow Status
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status & Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {orders.map((order) => {
                const { label, color, bg, Icon } = STATUS_CONFIG[order.status];
                const isHeld = order.escrowHeld && order.status !== "delivered";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.image}
                          alt={order.product}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {order.product}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.farmer}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">
                        GH₵ {order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.qty} {order.unit}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 bg-gray-100/80 border border-gray-200 rounded-lg px-2.5 py-1">
                        <span className="font-mono font-bold text-sm text-gray-800 tracking-wider">
                          {order.deliveryOtp}
                        </span>
                        <button
                          onClick={() => handleCopyOtp(order.deliveryOtp)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                          title="Copy Delivery OTP"
                        >
                          {copiedOtp === order.deliveryOtp ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isHeld ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Lock className="h-3 w-3" />
                          🔒 Held in Escrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          ✅ Released to Farmer
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {label}
                        </span>

                        {order.status !== "delivered" &&
                          order.status !== "cancelled" && (
                            <button
                              onClick={() => setConfirmingOrder(order)}
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1"
                            >
                              Confirm Delivery →
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
        <div className="md:hidden divide-y divide-gray-100/80">
          {orders.map((order) => {
            const { label, color, bg, Icon } = STATUS_CONFIG[order.status];
            const isHeld = order.escrowHeld && order.status !== "delivered";

            return (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.image}
                      alt={order.product}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.product}
                      </p>
                      <p className="text-xs text-gray-400">{order.farmer}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.qty} {order.unit} ·{" "}
                        <strong className="text-gray-900">
                          GH₵ {order.total.toFixed(2)}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200/70 text-xs">
                  <div>
                    <span className="text-gray-400 block">Delivery OTP</span>
                    <span className="font-mono font-bold text-sm text-gray-800">
                      {order.deliveryOtp}
                    </span>
                  </div>

                  <div>
                    {isHeld ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                        🔒 In Escrow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        ✅ Released
                      </span>
                    )}
                  </div>

                  {order.status !== "delivered" &&
                    order.status !== "cancelled" && (
                      <button
                        onClick={() => setConfirmingOrder(order)}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        Confirm Delivery
                      </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmingOrder(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-gray-900">
                Confirm Produce Delivery
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Did you receive your order of{" "}
                <strong>{confirmingOrder.product}</strong> in good condition?
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 leading-relaxed">
              💡 By confirming delivery, the escrow balance of{" "}
              <strong>GH₵ {confirmingOrder.total.toFixed(2)}</strong> will be
              instantly released to <strong>{confirmingOrder.farmer}</strong>.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReleaseEscrow}
                disabled={releasing}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all text-sm shadow-md"
              >
                {releasing
                  ? "Releasing Escrow..."
                  : "Yes, Confirm & Release GH₵ " +
                    confirmingOrder.total.toFixed(2)}
              </button>
              <button
                onClick={() => setConfirmingOrder(null)}
                className="px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
