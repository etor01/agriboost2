// app/buyer/wallet/page.tsx
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
import { FarmerPageHeader, FarmerEmptyState } from "@/components/farmer/ui";

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
    return { label: "Wallet Top-up", cls: "bg-blue-50 text-blue-800 border-blue-200" };
  if (type === "escrow_hold")
    return { label: "Escrow Held", cls: "bg-amber-50 text-amber-800 border-amber-200" };
  if (type === "escrow_release")
    return { label: "Escrow Released", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  if (escrow)
    return { label: "In Escrow", cls: "bg-amber-50 text-amber-800 border-amber-200" };
  return { label: "Purchase", cls: "bg-purple-50 text-purple-800 border-purple-200" };
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
    <div className="space-y-6">
      {showTopUp && (
        <WalletTopUpModal
          userEmail={email}
          onClose={() => setShowTopUp(false)}
          onSuccess={() => { fetchData(); setShowTopUp(false); }}
        />
      )}

      {/* Header */}
      <FarmerPageHeader
        badge="Digital Payments"
        title="My Wallet & Transactions"
        description="Load your AgriBoost balance, view escrow holds, and inspect verified transaction logs."
        action={
          <button
            onClick={() => setShowTopUp(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-2xs text-xs"
          >
            <Plus className="h-4 w-4" /> Add Money
          </button>
        }
      />

      {/* Balance Hero Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-800/80 rounded-2xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Secured</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {loading ? (
                <span className="text-zinc-400 text-xl font-normal">Loading...</span>
              ) : (
                `GH₵ ${balance.toLocaleString("en-GH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              )}
            </p>
            <p className="text-emerald-200/80 text-xs max-w-md">
              Funds are instantly spendable during checkout and 100% protected until order delivery.
            </p>
          </div>

          <button
            onClick={() => setShowTopUp(true)}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-xs transition-colors active:scale-98"
          >
            <Plus className="h-4 w-4" /> Top-up Wallet
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Spent</span>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">
              GH₵ {totalSpent.toFixed(2)}
            </p>
            <p className="text-[11px] text-zinc-500">Lifetime purchases</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <CreditCard className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">In Escrow</span>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">
              GH₵ {inEscrow.toFixed(2)}
            </p>
            <p className="text-[11px] text-amber-700 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Released upon confirmation
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Lock className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Escrow Protection</span>
            <p className="text-sm font-bold text-zinc-900 mt-0.5">100% Protected</p>
            <p className="text-[11px] text-zinc-500">Locked until OTP handoff</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Test Sandbox Info Card */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-700 space-y-2 shadow-2xs">
        <p className="font-bold flex items-center gap-2 text-zinc-900 text-xs">
          <CreditCard className="h-4 w-4 text-emerald-600" /> Paystack Sandbox Testing Card Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
            <p className="font-semibold text-zinc-400">Card Number</p>
            <p className="font-mono font-bold text-zinc-900">4084 0840 8408 4081</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
            <p className="font-semibold text-zinc-400">Expiry Date</p>
            <p className="font-mono font-bold text-zinc-900">Any future date</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
            <p className="font-semibold text-zinc-400">CVV</p>
            <p className="font-mono font-bold text-zinc-900">Any 3 digits (e.g. 123)</p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Transaction History
            </h2>
            <p className="text-[11px] text-zinc-500">Wallet credits and escrow order payments</p>
          </div>
          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-500 font-semibold">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3.5 bg-zinc-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-400">
                    <Wallet className="h-6 w-6 mx-auto mb-1.5 text-zinc-300" />
                    No transactions recorded yet. Load your wallet to get started!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const badge = getTxBadge(tx.transaction_type, tx.escrow_held);
                  const platFee = Number(tx.platform_fee ?? 0);
                  const delFee = Number(tx.delivery_fee ?? 0);
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3.5 text-zinc-500 text-[11px] whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleDateString("en-GH", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-zinc-900 max-w-xs">
                        <span className="truncate block">{tx.service_name || "—"}</span>
                        {(platFee > 0 || delFee > 0) && (
                          <span className="text-[10px] text-zinc-400 mt-0.5 block">
                            Fee: GH₵ {platFee.toFixed(2)} &bull; Delivery: GH₵ {delFee.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-zinc-900 whitespace-nowrap">
                        GH₵ {Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${tx.status === "completed"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                          {tx.status === "completed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Done
                            </>
                          ) : (
                            tx.status
                          )}
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

