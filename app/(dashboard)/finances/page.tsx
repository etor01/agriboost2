"use client";

import React, { useState, useEffect, useRef } from "react";
import { recordSuccessfulTransaction } from "./actions";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  Wallet,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
} from "lucide-react";

// --- ICONS ---
const StarIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);
const ZapIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
const ToolIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);

const dummyTransactions = [
  {
    id: "TXN-ESC-9012",
    service_name: "Escrow: Fresh Tomatoes (10 kg) - Order #ORD-001",
    amount: "55.00",
    status: "pending",
    escrow_held: true,
    created_at: "2026-08-02",
  },
  {
    id: "TXN-ESC-9011",
    service_name: "Escrow: Organic Plantains (5 bunch) - Order #ORD-002",
    amount: "40.00",
    status: "completed",
    escrow_held: false,
    created_at: "2026-07-30",
  },
  {
    id: "TXN7241",
    service_name: "Marketplace Ad Boost",
    amount: "50.00",
    status: "completed",
    escrow_held: false,
    created_at: "2026-07-28",
  },
  {
    id: "TXN7239",
    service_name: "5-Star Farmer Annual Subscription",
    amount: "120.00",
    status: "completed",
    escrow_held: false,
    created_at: "2026-07-15",
  },
];

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [paystackReady, setPaystackReady] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "escrow" | "completed">(
    "all"
  );
  const initializePaymentRef = useRef<any>(null);

  useEffect(() => {
    const fetchUserAndPaystack = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");

        // Fetch transactions from database
        const { data: txList } = await supabase
          .from("transactions")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (txList && txList.length > 0) {
          setTransactions(txList);
        } else {
          setTransactions(dummyTransactions);
        }

        try {
          const { usePaystackPayment } = await import("react-paystack");

          const config = {
            reference: new Date().getTime().toString(),
            email: user.email || "farmer@agriboost.com",
            amount: 12000, // 120 GHS in pesewas
            currency: "GHS",
            publicKey:
              process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
              "pk_test_placeholder_key",
          };

          const initPayment = usePaystackPayment(config);
          initializePaymentRef.current = initPayment;
          setPaystackReady(true);
        } catch (err) {
          console.warn("Paystack import note:", err);
        }
      } else {
        setTransactions(dummyTransactions);
      }
      setLoadingUser(false);
    };

    fetchUserAndPaystack();
  }, []);

  const onPaymentSuccess = async (reference: any) => {
    alert("Payment complete! Reference: " + reference.reference);
    await recordSuccessfulTransaction({
      service_name: "5-Star Farmer Annual Subscription",
      amount: 120.0,
      payment_gateway_ref: reference.reference || `PAY-${Date.now()}`,
    });
    window.location.reload();
  };

  const onPaymentClose = () => {
    console.log("Payment dialog closed.");
  };

  const displayTransactions =
    transactions.length > 0 ? transactions : dummyTransactions;

  const totalEscrow = displayTransactions
    .filter(
      (t) => t.escrow_held && (t.status === "pending" || t.status === "Held")
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const availablePayout = displayTransactions
    .filter(
      (t) =>
        !t.escrow_held &&
        (t.status === "completed" || t.status === "Completed")
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalLifetimeEarned = displayTransactions.reduce(
    (s, t) => s + Number(t.amount || 0),
    0
  );

  const filteredTransactions = displayTransactions.filter((txn) => {
    if (filterTab === "escrow") {
      return (
        txn.escrow_held &&
        (txn.status === "pending" || txn.status === "Held")
      );
    }
    if (filterTab === "completed") {
      return txn.status === "completed" || txn.status === "Completed";
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Finances & Escrow Payouts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your agricultural revenue, track escrow-held payments, and
            access premium services.
          </p>
        </div>

        <a
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
        >
          View Farmer Orders & OTPs →
        </a>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Escrow Held */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              Locked in Escrow
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Lock className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-3xl font-black text-gray-900">
              GH₵ {totalEscrow.toFixed(2)}
            </p>
            <p className="text-xs text-amber-700 mt-1 font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Released when buyers confirm delivery
            </p>
          </div>
        </div>

        {/* Card 2: Available Payout */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              Available Payout Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Wallet className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-3xl font-black text-gray-900">
              GH₵ {availablePayout.toFixed(2)}
            </p>
            <button
              onClick={() =>
                alert(
                  "Withdrawal request submitted! Funds will arrive in your Mobile Money wallet within 2 hours."
                )
              }
              className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
            >
              Withdraw to Mobile Money / Bank →
            </button>
          </div>
        </div>

        {/* Card 3: Total Lifetime */}
        <div className="bg-white border-2 border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              Total Platform Volume
            </span>
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-md">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-3xl font-black text-gray-900">
              GH₵ {totalLifetimeEarned.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All marketplace & subscription activity
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Farmer Growth Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subscription Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-500 flex flex-col">
            <div className="flex items-center text-emerald-600 mb-3">
              <StarIcon className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-bold">5-Star Farmer</h2>
            </div>
            <p className="text-gray-600 flex-grow text-sm">
              Unlock premium tools, an ad-free experience, and priority listing
              placement in the AgriBoost Marketplace.
            </p>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">
                GH₵120{" "}
                <span className="text-base font-medium text-gray-500">
                  / year
                </span>
              </p>
              <button
                className="w-full mt-3 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                onClick={() => {
                  if (loadingUser) return alert("Still loading user...");
                  if (!paystackReady || !initializePaymentRef.current)
                    return alert("Payment system not ready yet.");
                  initializePaymentRef.current(onPaymentSuccess, onPaymentClose);
                }}
                disabled={!paystackReady}
              >
                {paystackReady ? "Upgrade Now via Paystack" : "Loading..."}
              </button>
            </div>
          </div>

          {/* Other Services */}
          <ServiceCard
            title="Marketplace Ads"
            description="Boost your listings to reach 5x more buyers across Ghana."
            icon={<ZapIcon className="h-6 w-6 mr-2 text-blue-500" />}
          />
          <ServiceCard
            title="Equipment Funding"
            description="Apply for low-interest micro-loans for irrigation and machinery."
            icon={<ToolIcon className="h-6 w-6 mr-2 text-orange-500" />}
          />
        </div>
      </div>

      {/* Transactions Table with Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Transaction & Escrow History
            </h2>
            <p className="text-xs text-gray-500">
              Track real-time escrow deposits and payouts
            </p>
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
              All Transactions ({displayTransactions.length})
            </button>
            <button
              onClick={() => setFilterTab("escrow")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                filterTab === "escrow"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Lock className="h-3 w-3" />
              In Escrow (
              {
                displayTransactions.filter(
                  (t) =>
                    t.escrow_held &&
                    (t.status === "pending" || t.status === "Held")
                ).length
              }
              )
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
              Released / Completed (
              {
                displayTransactions.filter(
                  (t) =>
                    !t.escrow_held ||
                    t.status === "completed" ||
                    t.status === "Completed"
                ).length
              }
              )
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Service / Order</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Escrow Protection</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((txn) => {
                const isEscrowLocked =
                  txn.escrow_held &&
                  (txn.status === "pending" || txn.status === "Held");

                return (
                  <tr
                    key={txn.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-gray-500 font-semibold">
                      {txn.id.slice(0, 12)}
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {txn.service_name}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      GH₵{Number(txn.amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      {isEscrowLocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Lock className="h-3 w-3" />
                          🔒 Held in Escrow
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          ✅ Released to Account
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 text-xs">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                          txn.status === "completed" ||
                          txn.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No transactions found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reusable Card for upcoming services
const ServiceCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-200/80 flex flex-col justify-between">
    <div>
      <div className="flex items-center text-gray-800 mb-3">
        {icon}
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
    <div className="mt-4">
      <button
        disabled
        className="w-full mt-3 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl cursor-not-allowed"
      >
        Coming Soon
      </button>
    </div>
  </div>
);
