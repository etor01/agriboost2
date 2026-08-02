"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  Search,
  KeyRound,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  getFarmerOrdersWithEscrow,
  verifyDeliveryOtpAndReleaseEscrow,
} from "@/app/marketplace/actions";

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
  isRealOrder: boolean;
}

const MOCK_FARMER_ORDERS: FarmerOrderDisplay[] = [
  {
    id: "tx-mock-1",
    orderId: "ORD-001",
    product: "Fresh Tomatoes (Grade A)",
    buyerName: "Emmanuel Tornyi",
    buyerPhone: "+233 24 555 0192",
    deliveryAddress: "14 Asafo Street, Kumasi",
    qty: 10,
    unit: "kg",
    amount: 55.0,
    status: "processing",
    escrowHeld: true,
    date: "2026-08-02",
    image:
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
    isRealOrder: false,
  },
  {
    id: "tx-mock-2",
    orderId: "ORD-002",
    product: "Organic Plantains",
    buyerName: "Abena Serwaa",
    buyerPhone: "+233 20 889 1234",
    deliveryAddress: "East Legon, Accra",
    qty: 5,
    unit: "bunch",
    amount: 40.0,
    status: "delivered",
    escrowHeld: false,
    date: "2026-07-30",
    image:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=80&h=80&fit=crop",
    isRealOrder: false,
  },
  {
    id: "tx-mock-3",
    orderId: "ORD-003",
    product: "Garden Eggs (Fresh Harvest)",
    buyerName: "Kofi Mensah",
    buyerPhone: "+233 54 112 3344",
    deliveryAddress: "Adum Central Market, Kumasi",
    qty: 15,
    unit: "kg",
    amount: 60.0,
    status: "processing",
    escrowHeld: true,
    date: "2026-08-01",
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=80&h=80&fit=crop",
    isRealOrder: false,
  },
];

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<FarmerOrderDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "completed">(
    "all"
  );
  const [selectedOrder, setSelectedOrder] =
    useState<FarmerOrderDisplay | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const liveData = await getFarmerOrdersWithEscrow();
      if (liveData && liveData.length > 0) {
        const mapped: FarmerOrderDisplay[] = liveData.map((tx: any) => {
          const order = tx.orders || {};
          const listing = order.listings || {};
          const buyer = order.buyers || {};
          const buyerProfile = buyer.profiles || {};
          const buyerName =
            [buyerProfile.firstname, buyerProfile.lastname]
              .filter(Boolean)
              .join(" ") || "Verified Buyer";

          return {
            id: tx.id,
            orderId: order.id || "ORD-" + tx.id.slice(0, 4),
            product: listing.name || "Farm Produce",
            buyerName,
            buyerPhone: buyerProfile.phone || "+233 24 000 0000",
            deliveryAddress:
              buyer.delivery_address || "Standard Delivery Address",
            qty: order.quantity || 1,
            unit: listing.unit_type || "unit",
            amount: Number(tx.amount) || 0,
            status: order.status || "processing",
            escrowHeld: tx.escrow_held,
            date: tx.created_at || new Date().toISOString(),
            image:
              (listing.image_urls && listing.image_urls[0]) ||
              "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=80&h=80&fit=crop",
            isRealOrder: true,
          };
        });
        setOrders(mapped);
      } else {
        setOrders(MOCK_FARMER_ORDERS);
      }
    } catch (err) {
      console.error("Error loading farmer orders:", err);
      setOrders(MOCK_FARMER_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      if (selectedOrder.isRealOrder) {
        const res = await verifyDeliveryOtpAndReleaseEscrow(
          selectedOrder.orderId,
          otpInput
        );
        if (!res.success) {
          setMessage({
            type: "error",
            text: res.error || "Verification failed.",
          });
          setVerifying(false);
          return;
        }
      } else {
        // Demo mode fallback verification
        if (otpInput !== "4829" && otpInput !== "9312" && otpInput !== "1234") {
          setMessage({
            type: "error",
            text: "Invalid Demo OTP. For demo orders, try OTP '4829' or '1234'.",
          });
          setVerifying(false);
          return;
        }
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id
              ? { ...o, status: "delivered", escrowHeld: false }
              : o
          )
        );
      }

      setMessage({
        type: "success",
        text: `Delivery verified! GH₵ ${selectedOrder.amount.toFixed(2)} released to your available payout balance.`,
      });
      setTimeout(() => {
        setSelectedOrder(null);
        setOtpInput("");
        setMessage(null);
        fetchOrders();
      }, 2000);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to verify OTP." });
    } finally {
      setVerifying(false);
    }
  };

  const pendingOrders = orders.filter(
    (o) => o.escrowHeld && o.status !== "delivered"
  );
  const completedOrders = orders.filter(
    (o) => !o.escrowHeld || o.status === "delivered"
  );

  const totalEscrowLocked = pendingOrders.reduce((s, o) => s + o.amount, 0);
  const totalCompletedEarnings = completedOrders.reduce(
    (s, o) => s + o.amount,
    0
  );

  const filteredOrders = orders.filter((o) => {
    if (filterTab === "pending")
      return o.escrowHeld && o.status !== "delivered";
    if (filterTab === "completed")
      return !o.escrowHeld || o.status === "delivered";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Farmer Orders & Escrow Deliveries
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your produce sales, verify buyer Delivery OTPs, and release
            your escrow payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              In Escrow (Awaiting Delivery)
            </p>
            <p className="text-xl font-extrabold text-amber-900 mt-0.5 flex items-center gap-1">
              <Lock className="h-4 w-4" />
              GH₵ {totalEscrowLocked.toFixed(2)}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Paid Out / Completed
            </p>
            <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
              GH₵ {totalCompletedEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Escrow Guidance Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">
              How AgriBoost Escrow Verification Works
            </h3>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              1. Ship the produce to the buyer&apos;s delivery address. <br />
              2. When the buyer inspects and accepts the produce, ask for their{" "}
              <strong className="text-emerald-400">4-digit Delivery OTP</strong>.
              <br />
              3. Click <strong>&ldquo;Verify Delivery OTP&rdquo;</strong> below to unlock
              and release the funds to your account instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Incoming Orders ({orders.length})
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                filterTab === "pending"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Lock className="h-3 w-3" />
              In Escrow ({pendingOrders.length})
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                filterTab === "completed"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              Delivered ({completedOrders.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Produce</th>
                <th className="p-4">Buyer Details</th>
                <th className="p-4">Escrow Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const isHeld = order.escrowHeld && order.status !== "delivered";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-mono text-xs font-bold text-gray-800">
                        #{order.orderId.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.image}
                          alt={order.product}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-100"
                        />
                        <div>
                          <p className="font-bold text-gray-900">
                            {order.product}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {order.qty} {order.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">
                        {order.buyerName}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {order.buyerPhone}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                        <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        {order.deliveryAddress}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-base font-extrabold text-gray-900">
                        GH₵ {order.amount.toFixed(2)}
                      </p>
                      {isHeld ? (
                        <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Escrow Protected
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Released to Account
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          isHeld
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isHeld ? (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            In Escrow
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Delivered
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isHeld ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setOtpInput("");
                            setMessage(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Verify Delivery OTP
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No orders matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl z-10 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>

            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                Order #{selectedOrder.orderId.slice(0, 8).toUpperCase()}
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">
                Verify Buyer Delivery OTP
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Ask <strong>{selectedOrder.buyerName}</strong> for their 4-digit
                verification code to release GH₵{" "}
                {selectedOrder.amount.toFixed(2)} from escrow.
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider text-center">
                Enter 4-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="0 0 0 0"
                className="w-full text-center font-mono text-3xl font-extrabold tracking-[0.5em] py-3.5 rounded-2xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-gray-900"
              />
            </div>

            {/* Message alert */}
            {message && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleVerifyOtp}
                disabled={verifying || otpInput.length !== 4}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? "Verifying OTP..." : "Verify & Release Escrow"}
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 text-sm"
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
