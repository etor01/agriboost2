"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordSuccessfulTransaction } from "./actions";
import { toast } from "@/components/ui/Toast";
import WalletTopUpModal from "@/components/wallet/WalletTopUpModal";
import {
  Lock,
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  Minus,
  X,
  Banknote,
  Smartphone,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
  CreditCard,
} from "lucide-react";
import RevenueChart from "./RevenueChart";

// ── Constants ─────────────────────────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.05;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FinanceSummary {
  walletBalance: number;
  availableBalance: number;
  role: string;
  totalEscrow: number;
  totalEarned: number;
  totalTopups: number;
  totalWithdrawn: number;
  transactions: any[];
}

interface FinancesClientPageProps {
  userEmail: string;
  initialWalletBalance: number;
  initialAvailableBalance: number;
  initialRole: string;
  initialTransactions: any[];
}

// ── Helper to calculate summary metrics from transactions ─────────────────────
function computeSummary(
  walletBalance: number,
  availableBalance: number,
  role: string,
  txList: any[]
): FinanceSummary {
  let totalEscrow = 0, totalEarned = 0, totalTopups = 0, totalWithdrawn = 0;
  for (const tx of txList) {
    const salesAmt = Number(tx.sales_amount ?? 0);
    const amt = Number(tx.amount ?? 0);
    if (tx.transaction_type === "wallet_topup") totalTopups += amt;
    else if (tx.transaction_type === "farmer_withdrawal") totalWithdrawn += amt;
    else if (tx.escrow_held && tx.status !== "completed") totalEscrow += salesAmt > 0 ? salesAmt : amt;
    else if (tx.transaction_type === "escrow_release" && tx.status === "completed") totalEarned += salesAmt > 0 ? salesAmt : amt;
  }

  return {
    walletBalance,
    availableBalance,
    role,
    totalEscrow: Number(totalEscrow.toFixed(2)),
    totalEarned: Number(totalEarned.toFixed(2)),
    totalTopups: Number(totalTopups.toFixed(2)),
    totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
    transactions: txList,
  };
}

// ── Withdrawal Modal ──────────────────────────────────────────────────────────
function WithdrawModal({
  availableBalance,
  onClose,
  onSuccess,
}: {
  availableBalance: number;
  onClose: () => void;
  onSuccess: (amount: number, newBalance: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"momo" | "bank">("momo");
  const [accountDetails, setAccountDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    amount: number;
    reference: string;
  } | null>(null);

  const hasBalance = availableBalance > 0;

  const handleWithdraw = async () => {
    const withdrawAmt = Number(amount);
    if (!withdrawAmt || withdrawAmt < 1) {
      setError("Enter a valid amount of at least GH₵ 1.");
      return;
    }
    if (withdrawAmt > availableBalance) {
      setError(
        `Insufficient balance. Max: GH₵ ${availableBalance.toFixed(2)}`
      );
      return;
    }
    if (!accountDetails.trim()) {
      setError("Please enter your account/MoMo number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: withdrawAmt,
          method: method === "momo" ? "Mobile Money" : "Bank Transfer",
          accountDetails,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess({
          amount: withdrawAmt,
          reference: data.reference || `WD-${Date.now()}`,
        });
        onSuccess(withdrawAmt, data.newAvailableBalance ?? availableBalance - withdrawAmt);
      } else {
        setError(data.message || "Withdrawal failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <RefreshCw className="h-8 w-8 animate-spin-once" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Withdrawal Requested!
            </h3>
            <p className="text-sm text-gray-600">
              GH₵ {success.amount.toFixed(2)} is being processed via {method === "momo" ? "Mobile Money" : "Bank Transfer"}.
            </p>
            <div className="bg-gray-50 rounded-2xl p-3 text-xs text-gray-500 font-mono">
              Ref: {success.reference}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-md text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <Wallet className="h-3.5 w-3.5" /> Payout Request
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">
                Withdraw Earnings
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Available to withdraw:{" "}
                <span className="font-bold text-emerald-700">
                  GH₵ {availableBalance.toFixed(2)}
                </span>
              </p>
            </div>

            {!hasBalance && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  You currently have no available balance to withdraw. Escrow funds will become available once buyers confirm delivery.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Payout method selection */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Payout Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod("momo")}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 text-xs font-bold transition-all ${
                    method === "momo"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 text-xs font-bold transition-all ${
                    method === "bank"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Banknote className="h-4 w-4" /> Bank Transfer
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Amount (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                  GH₵
                </span>
                <input
                  type="number"
                  min="1"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={!hasBalance}
                  className="w-full pl-14 pr-16 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 placeholder:text-gray-300 text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                {hasBalance && (
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>

            {/* Account details input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                {method === "momo" ? "MoMo Number & Network" : "Bank Name & Account Number"}
              </label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder={
                  method === "momo"
                    ? "e.g. 0241234567 (MTN)"
                    : "e.g. GCB Bank - 1234567890"
                }
                disabled={!hasBalance}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 placeholder:text-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading || !hasBalance}
              className="w-full py-3.5 bg-emerald-600 text-white font-extrabold text-sm rounded-2xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ── Tx type badge config ──────────────────────────────────────────────────────
function getTxBadge(type: string | null, status: string) {
  if (type === "wallet_topup")
    return { label: "Wallet Top-up", cls: "bg-blue-50 text-blue-700 border-blue-200" };
  if (type === "escrow_hold")
    return { label: "🔒 Escrow Held", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  if (type === "escrow_release")
    return { label: "✅ Escrow Released", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (type === "farmer_withdrawal")
    return { label: "↑ Withdrawal", cls: "bg-gray-100 text-gray-700 border-gray-200" };
  if (type === "purchase")
    return { label: "Purchase", cls: "bg-purple-50 text-purple-700 border-purple-200" };
  if (status === "completed")
    return { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-200" };
}

// ── Main Client Page Component ────────────────────────────────────────────────
export default function FinancesClientPage({
  userEmail,
  initialWalletBalance,
  initialAvailableBalance,
  initialRole,
  initialTransactions,
}: FinancesClientPageProps) {
  const router = useRouter();

  const [summary, setSummary] = useState<FinanceSummary>(() =>
    computeSummary(
      initialWalletBalance,
      initialAvailableBalance,
      initialRole,
      initialTransactions
    )
  );

  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "topup" | "escrow" | "withdrawal">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paystack subscription (5-Star Farmer)
  const [paystackReady, setPaystackReady] = useState(false);
  const initializePaymentRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, txRes] = await Promise.all([
      supabase.from("profiles").select("wallet_balance, available_balance, role").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
    ]);

    const profile = profileRes.data;
    const txList = txRes.data || [];

    setSummary(
      computeSummary(
        Number(profile?.wallet_balance ?? 0),
        Number(profile?.available_balance ?? 0),
        profile?.role || "buyer",
        txList
      )
    );
  }, []);

  useEffect(() => {
    async function loadPaystack() {
      try {
        const { usePaystackPayment } = await import("react-paystack");
        const config = {
          reference: new Date().getTime().toString(),
          email: userEmail || "farmer@agriboost.com",
          amount: 12000,
          currency: "GHS",
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key",
        };
        const initPayment = usePaystackPayment(config);
        initializePaymentRef.current = initPayment;
        setPaystackReady(true);
      } catch { /* noop */ }
    }
    loadPaystack();
  }, [userEmail]);

  const onSubscriptionSuccess = async (reference: any) => {
    const ref = reference?.reference || `PAY-${Date.now()}`;
    try {
      const result = await recordSuccessfulTransaction({
        service_name: "5-Star Farmer Annual Subscription",
        amount: 120.0,
        payment_gateway_ref: ref,
      });

      if (result.success) {
        toast.success("🌟 5-Star Farmer plan activated! Welcome to premium.");
        router.refresh();
      } else {
        toast.error(
          `Payment received but activation failed: ${
            (result as any).error ?? "Unknown error"
          }. Contact support with ref: ${ref}`
        );
      }
    } catch {
      toast.error(
        `An unexpected error occurred. Contact support with ref: ${ref}`
      );
    } finally {
      fetchData();
    }
  };

  const filteredTx = summary.transactions.filter((tx) => {
    let matchTab = true;
    if (filterTab === "topup") matchTab = tx.transaction_type === "wallet_topup";
    else if (filterTab === "escrow") matchTab = tx.transaction_type === "escrow_hold" || tx.transaction_type === "escrow_release";
    else if (filterTab === "withdrawal") matchTab = tx.transaction_type === "farmer_withdrawal";

    let matchDate = true;
    const txDate = new Date(tx.created_at).getTime();
    if (startDate) {
      matchDate = matchDate && txDate >= new Date(startDate).getTime();
    }
    if (endDate) {
      matchDate = matchDate && txDate <= new Date(endDate).getTime() + 86400000;
    }

    return matchTab && matchDate;
  });

  const isFarmer = summary.role === "farmer";

  return (
    <div className="space-y-8">
      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {showTopUp && (
        <WalletTopUpModal
          userEmail={userEmail}
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            setShowTopUp(false);
            fetchData();
          }}
        />
      )}
      {showWithdraw && summary && (
        <WithdrawModal
          availableBalance={summary.availableBalance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => {
            setShowWithdraw(false);
            fetchData();
          }}
        />
      )}

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Finances & Wallet
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isFarmer
              ? "Track your escrow earnings, manage payouts, and load your wallet."
              : "Load your AgriBoost wallet and track your order payments."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isFarmer && (
            <a
              href="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-sm"
            >
              Farmer Orders →
            </a>
          )}
          <button
            onClick={() => setShowTopUp(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Load Wallet
          </button>
        </div>
      </div>

      {/* ── Wallet Balance Hero ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-emerald-200" />
            <span className="text-emerald-100 text-sm font-bold uppercase tracking-wider">
              AgriBoost Wallet
            </span>
          </div>

          <p className="text-5xl font-black tracking-tight mt-1">
            GH₵{" "}
            {(summary.walletBalance ?? 0).toLocaleString("en-GH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-emerald-200 text-sm mt-2">
            Available wallet balance — use at checkout
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setShowTopUp(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-extrabold text-sm hover:bg-emerald-50 transition-all shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add Money
            </button>
            {isFarmer && (
              <button
                onClick={() => setShowWithdraw(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-bold text-sm transition-all"
              >
                <Minus className="h-4 w-4" /> Withdraw Earnings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Loaded */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              Total Loaded
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            GH₵ {(summary.totalTopups ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Via Paystack top-ups</p>
        </div>

        {/* Locked in Escrow (farmer only) or Order Spend (buyer) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              {isFarmer ? "In Escrow" : "Pending Orders"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            GH₵ {(summary.totalEscrow ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isFarmer
              ? "Released when buyers confirm delivery"
              : "Locked until delivery confirmed"}
          </p>
        </div>

        {/* Available Payout (farmer) / Spent (buyer) */}
        {isFarmer ? (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-300/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                Available Payout
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              GH₵ {(summary.availableBalance ?? 0).toFixed(2)}
            </p>
            <button
              onClick={() => setShowWithdraw(true)}
              className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
            >
              Withdraw to MoMo / Bank →
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
                Total Withdrawn
              </span>
              <div className="w-9 h-9 rounded-xl bg-gray-800 text-white flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">
              GH₵ {(summary.totalWithdrawn ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total order spend</p>
          </div>
        )}

        {/* Total Earned (farmer) / Total Earned (same for buyer) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
              {isFarmer ? "Total Earned" : "Completed Purchases"}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            GH₵ {(summary.totalEarned ?? 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {isFarmer ? "Lifetime sales (after fees)" : "Orders successfully delivered"}
          </p>
        </div>
      </div>

      {/* ── Revenue Chart (farmer only) ─────────────────────────────────────── */}
      {isFarmer && summary && (
        <RevenueChart transactions={summary.transactions} />
      )}

      {/* ── Fee Explainer (farmer only) ───────────────────────────────────────── */}
      {isFarmer && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> How Your Earnings Are Calculated
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              {
                label: "Order Total",
                desc: "Subtotal + Delivery Fee",
                color: "text-gray-700",
                icon: "🛒",
              },
              {
                label: "Platform Fee (5%)",
                desc: "Deducted from total",
                color: "text-red-600",
                icon: "→",
              },
              {
                label: "You Receive",
                desc: "Subtotal − 5% platform fee",
                color: "text-emerald-700",
                icon: "💰",
              },
            ].map((item) => (
              <div key={item.label} className="bg-white/70 rounded-xl p-3.5 border border-indigo-100">
                <p className="text-lg font-bold mb-1">{item.icon}</p>
                <p className={`font-extrabold ${item.color}`}>{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Farmer Services ───────────────────────────────────────────────────── */}
      {isFarmer && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Farmer Growth Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-emerald-500 flex flex-col">
              <div className="flex items-center text-emerald-600 mb-3">
                <StarIcon className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">5-Star Farmer</h2>
              </div>
              <p className="text-gray-600 flex-grow text-sm">
                Unlock premium tools, ad-free experience, and priority listing
                in the AgriBoost Marketplace.
              </p>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">
                  GH₵120{" "}
                  <span className="text-base font-medium text-gray-500">/ year</span>
                </p>
                <button
                  className="w-full mt-3 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  onClick={() => {
                    if (!paystackReady || !initializePaymentRef.current)
                      return alert("Payment system not ready yet.");
                    initializePaymentRef.current({
                      onSuccess: onSubscriptionSuccess,
                      onClose: () => { },
                    });
                  }}
                  disabled={!paystackReady}
                >
                  {paystackReady ? "Upgrade via Paystack" : "Loading..."}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-blue-600 mb-3">
                  <Zap className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">Marketplace Ads</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Boost your listings to reach 5x more buyers across Ghana.
                </p>
              </div>
              <button disabled className="w-full mt-4 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center text-orange-500 mb-3">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  <h2 className="text-xl font-bold">Equipment Funding</h2>
                </div>
                <p className="text-gray-600 text-sm">
                  Apply for low-interest micro-loans for irrigation and
                  machinery.
                </p>
              </div>
              <button disabled className="w-full mt-4 px-4 py-2.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction History ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Transaction History
            </h2>
            <p className="text-xs text-gray-500">
              All wallet top-ups, escrow activity, and withdrawals
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
            {(
              [
                { id: "all", label: `All (${summary.transactions.length})` },
                {
                  id: "topup",
                  label: `Top-ups (${summary.transactions.filter((t) => t.transaction_type === "wallet_topup").length})`,
                },
                {
                  id: "escrow",
                  label: `Escrow (${summary.transactions.filter((t) => t.transaction_type === "escrow_hold" || t.transaction_type === "escrow_release").length})`,
                },
                {
                  id: "withdrawal",
                  label: `Withdrawals (${summary.transactions.filter((t) => t.transaction_type === "farmer_withdrawal").length})`,
                },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterTab(id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterTab === id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* CSV Export & Date Filter */}
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-600 outline-none focus:border-emerald-500"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg text-gray-600 outline-none focus:border-emerald-500"
            />
            <button 
              onClick={() => {
                window.location.href = `/api/transactions/export?tab=${filterTab}${startDate ? `&start=${startDate}` : ""}${endDate ? `&end=${endDate}` : ""}`;
              }}
              className="ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                {isFarmer && <th className="p-4">Your Share</th>}
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFarmer ? 6 : 5}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    No transactions in this category yet.
                  </td>
                </tr>
              ) : (
                filteredTx.map((txn) => {
                  const badge = getTxBadge(txn.transaction_type, txn.status);
                  const salesAmt = Number(txn.sales_amount ?? 0);
                  const platFee = Number(txn.platform_fee ?? 0);
                  const delFee = Number(txn.delivery_fee ?? 0);

                  return (
                    <tr
                      key={txn.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 font-medium text-gray-900 max-w-xs">
                        <span className="truncate block">
                          {txn.service_name || "—"}
                        </span>
                        {(platFee > 0 || delFee > 0) && (
                          <span className="text-xs text-gray-400 mt-0.5 block">
                            Fee: GH₵ {platFee.toFixed(2)} · Delivery: GH₵{" "}
                            {delFee.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-gray-900 whitespace-nowrap">
                        GH₵ {Number(txn.amount).toFixed(2)}
                      </td>
                      {isFarmer && (
                        <td className="p-4 text-emerald-700 font-bold whitespace-nowrap">
                          {salesAmt > 0
                            ? `GH₵ ${salesAmt.toFixed(2)}`
                            : "—"}
                        </td>
                      )}
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                            txn.status === "completed" || txn.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {txn.status}
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
