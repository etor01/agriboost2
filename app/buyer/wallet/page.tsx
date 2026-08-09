"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import WalletTopUpModal from "@/components/wallet/WalletTopUpModal";
import {
  Wallet,
  Plus,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  Lock,
  RefreshCw,
} from "lucide-react";

interface Tx {
  id: string;
  amount: number;
  service_name: string | null;
  transaction_type: string | null;
  status: string;
  escrow_held: boolean;
  delivery_fee: number;
  platform_fee: number;
  sales_amount: number;
  created_at: string;
}

function getTxBadge(type: string | null, escrow: boolean) {
  if (type === "wallet_topup")
    return { label: "💳 Wallet Top-up", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (type === "escrow_hold")
    return { label: "🔒 Escrow Held", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (type === "escrow_release")
    return { label: "✅ Escrow Released", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (escrow)
    return { label: "🔒 In Escrow", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Purchase", cls: "bg-purple-50 text-purple-700 border-purple-200" };
}

export default function BuyerWalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [inEscrow, setInEscrow] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setEmail(user.email || "");

    const [profileRes, txRes] = await Promise.all([
      supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
      supabase
        .from("transactions")
        .select("id, amount, service_name, transaction_type, status, escrow_held, delivery_fee, platform_fee, sales_amount, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setBalance(Number(profileRes.data?.wallet_balance ?? 0));

    const txList = txRes.data || [];
    setTransactions(txList as Tx[]);

    // Compute stats
    let spent = 0;
    let escrow = 0;
    for (const t of txList) {
      if (t.transaction_type !== "wallet_topup" && t.transaction_type !== "farmer_withdrawal") {
        spent += Number(t.amount ?? 0);
      }
      if (t.escrow_held && t.status !== "completed") {
        escrow += Number(t.amount ?? 0);
      }
    }
    setTotalSpent(spent);
    setInEscrow(escrow);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-7">
      {showTopUp && (
        <WalletTopUpModal
          userEmail={email}
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { fetchData(); setShowTopUp(false); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Wallet
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Load your AgriBoost wallet and track your purchase activity.
          </p>
        </div>
        <button
          onClick={() => setShowTopUp(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md text-sm"
        >
          <Plus className="h-4 w-4" /> Add Money
        </button>
      </div>

      {/* Balance Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-green-700 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
            <span className="text-emerald-100 text-sm font-bold uppercase tracking-wider">
              AgriBoost Buyer Wallet
            </span>
          </div>
          <p className="text-5xl font-black tracking-tight mt-1">
            {loading ? (
              <span className="text-emerald-300 text-2xl">Loading…</span>
            ) : (
              `GH₵ ${balance.toLocaleString("en-GH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            )}
          </p>
          <p className="text-emerald-200 text-sm mt-1">
            Available to spend at checkout — 100% escrow-protected
          </p>
          <button
            onClick={() => setShowTopUp(true)}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-extrabold text-sm hover:bg-emerald-50 transition-all shadow-lg"
          >
            <Plus className="h-4 w-4" /> Add Money
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            GH₵ {totalSpent.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Lifetime purchases</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">In Escrow</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            GH₵ {inEscrow.toFixed(2)}
          </p>
          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Released when delivery confirmed
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Escrow Protected</span>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-blue-900">100% Guarantee</p>
          <p className="text-xs text-blue-600 mt-1">
            Funds held until you confirm delivery with your OTP
          </p>
        </div>
      </div>

      {/* Test Card Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700 space-y-2">
        <p className="font-extrabold flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Paystack Test Card Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/80 rounded-xl p-3">
            <p className="font-bold mb-0.5">Card Number</p>
            <p className="font-mono font-bold text-blue-900">4084 0840 8408 4081</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3">
            <p className="font-bold mb-0.5">Expiry Date</p>
            <p className="font-mono font-bold text-blue-900">Any future date</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3">
            <p className="font-bold mb-0.5">CVV</p>
            <p className="font-mono font-bold text-blue-900">Any 3 digits</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
            <p className="text-xs text-gray-500">Your wallet top-ups and order payments</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No transactions yet. Load your wallet to get started!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const badge = getTxBadge(tx.transaction_type, tx.escrow_held);
                  const platFee = Number(tx.platform_fee ?? 0);
                  const delFee = Number(tx.delivery_fee ?? 0);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString("en-GH", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-medium text-gray-900 max-w-xs">
                        <span className="truncate block">{tx.service_name || "—"}</span>
                        {(platFee > 0 || delFee > 0) && (
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            Fee: GH₵ {platFee.toFixed(2)} · Delivery: GH₵ {delFee.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                        GH₵ {Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                          tx.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {tx.status === "completed" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                          ) : tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
