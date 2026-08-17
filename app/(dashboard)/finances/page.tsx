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
  CheckCircle2,
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
        setSuccess({ amount: data.amount, reference: data.reference });
        onSuccess(data.amount, data.newBalance);
      } else {
        setError(data.error || "Withdrawal failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10">
        {success ? (
          // ── Success State ───────────────────────────────────────────────────
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">
                Withdrawal Submitted!
              </h3>
              <p className="text-gray-600 text-sm mt-2">
                <span className="font-bold text-emerald-700">
                  GH₵ {success.amount.toFixed(2)}
                </span>{" "}
                withdrawal to your{" "}
                {method === "momo" ? "Mobile Money" : "Bank"} account has been logged.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-left">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Demo Mode</p>
              <p className="text-xs text-amber-600">This is a simulated payout for demonstration purposes. No real funds were transferred.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-1.5">
              <p className="text-gray-500">
                Reference:{" "}
                <span className="font-mono font-bold text-gray-700">
                  {success.reference}
                </span>
              </p>
              <p className="text-gray-500">
                New available balance:{" "}
                <span className="font-bold text-gray-700">
                  GH₵ {availableBalance.toFixed(2)}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : !hasBalance ? (
          // ── No Balance State ────────────────────────────────────────────────
          <>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">Withdraw Funds</h2>
                    <p className="text-gray-400 text-xs">Available Payout Balance</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Wallet className="h-7 w-7 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-800">No Payout Balance Yet</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Your available payout balance is <span className="font-bold text-gray-700">GH₵ 0.00</span>.
                  Funds appear here once a buyer confirms delivery and escrow is released.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left text-sm text-emerald-800">
                <p className="font-bold mb-1">How to earn payouts:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-emerald-700">
                  <li>List your produce in the Marketplace</li>
                  <li>A buyer places an order &amp; pays into escrow</li>
                  <li>Deliver the goods and share the 4-digit OTP</li>
                  <li>Buyer enters OTP → escrow releases to your balance</li>
                </ol>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          // ── Form State ──────────────────────────────────────────────────────
          <>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">Withdraw Funds</h2>
                    <p className="text-gray-400 text-xs">
                      Available: GH₵ {availableBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Demo Mode Banner */}
            <div className="mx-6 mt-5 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700">Demo Mode — Simulated Payout</p>
                <p className="text-xs text-amber-600 mt-0.5">No real funds are transferred. This simulates the withdrawal flow for demonstration.</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                    GH₵
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={availableBalance}
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder={`Max GH₵ ${availableBalance.toFixed(2)}`}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100].map((pct) => {
                    const v = (availableBalance * pct) / 100;
                    return (
                      <button
                        key={pct}
                        onClick={() => setAmount(v.toFixed(2))}
                        className="flex-1 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {pct}%
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setAmount(availableBalance.toFixed(2))}
                    className="flex-1 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "momo" as const, label: "Mobile Money", icon: Smartphone },
                    { id: "bank" as const, label: "Bank Transfer", icon: Banknote },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMethod(id)}
                      className={`flex items-center gap-2 p-3.5 rounded-xl border-2 transition-all ${method === id
                          ? "border-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${method === id ? "text-gray-900" : "text-gray-400"
                          }`}
                      />
                      <span
                        className={`text-sm font-bold ${method === id ? "text-gray-900" : "text-gray-500"
                          }`}
                      >
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account details */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {method === "momo"
                    ? "MoMo Number (e.g. 0244 123456)"
                    : "Bank Account Number"}
                </label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => {
                    setAccountDetails(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    method === "momo"
                      ? "e.g. 0244 123456"
                      : "e.g. 1234567890"
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={loading || !amount || Number(amount) < 1}
                className="w-full py-4 bg-gray-900 text-white font-extrabold rounded-2xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw{amount ? ` GH₵ ${Number(amount).toFixed(2)}` : ""}
                  </>
                )}
              </button>
            </div>
          </>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FinancesPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "topup" | "escrow" | "withdrawal">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paystack subscription (5-Star Farmer)
  const [paystackReady, setPaystackReady] = useState(false);
  const initializePaymentRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    setUserEmail(user.email || "");

    const [profileRes, txRes] = await Promise.all([
      supabase.from("profiles").select("wallet_balance, available_balance, role").eq("id", user.id).single(),
      supabase.from("transactions").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
    ]);

    const profile = profileRes.data;
    const txList = txRes.data || [];

    let totalEscrow = 0, totalEarned = 0, totalTopups = 0, totalWithdrawn = 0;
    for (const tx of txList) {
      const salesAmt = Number(tx.sales_amount ?? 0);
      const amt = Number(tx.amount ?? 0);
      if (tx.transaction_type === "wallet_topup") totalTopups += amt;
      else if (tx.transaction_type === "farmer_withdrawal") totalWithdrawn += amt;
      else if (tx.escrow_held && tx.status !== "completed") totalEscrow += salesAmt > 0 ? salesAmt : amt;
      else if (tx.transaction_type === "escrow_release" && tx.status === "completed") totalEarned += salesAmt > 0 ? salesAmt : amt;
    }

    setSummary({
      walletBalance: Number(profile?.wallet_balance ?? 0),
      availableBalance: Number(profile?.available_balance ?? 0),
      role: profile?.role || "buyer",
      totalEscrow: Number(totalEscrow.toFixed(2)),
      totalEarned: Number(totalEarned.toFixed(2)),
      totalTopups: Number(totalTopups.toFixed(2)),
      totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
      transactions: txList,
    });

    // Load Paystack for subscription
    try {
      const { usePaystackPayment } = await import("react-paystack");
      const config = {
        reference: new Date().getTime().toString(),
        email: user.email || "farmer@agriboost.com",
        amount: 12000,
        currency: "GHS",
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key",
      };
      const initPayment = usePaystackPayment(config);
      initializePaymentRef.current = initPayment;
      setPaystackReady(true);
    } catch { /* noop */ }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        // Refresh the Next.js router so the sidebar's client-side profile
        // state re-fetches and displays the Premium Member badge immediately.
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
      // Always refresh the finances data so any partial updates are reflected.
      fetchData();
    }
  };

  const filteredTx = (summary?.transactions || []).filter((tx) => {
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
      // Add a day to include the entire end date
      matchDate = matchDate && txDate <= new Date(endDate).getTime() + 86400000;
    }

    return matchTab && matchDate;
  });

  const isFarmer = summary?.role === "farmer";

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

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
            {(summary?.walletBalance ?? 0).toLocaleString("en-GH", {
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
            GH₵ {(summary?.totalTopups ?? 0).toFixed(2)}
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
            GH₵ {(summary?.totalEscrow ?? 0).toFixed(2)}
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
              GH₵ {(summary?.availableBalance ?? 0).toFixed(2)}
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
              GH₵ {(summary?.totalWithdrawn ?? 0).toFixed(2)}
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
            GH₵ {(summary?.totalEarned ?? 0).toFixed(2)}
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
                { id: "all", label: `All (${summary?.transactions?.length ?? 0})` },
                {
                  id: "topup",
                  label: `Top-ups (${(summary?.transactions ?? []).filter((t) => t.transaction_type === "wallet_topup").length})`,
                },
                {
                  id: "escrow",
                  label: `Escrow (${(summary?.transactions ?? []).filter((t) => t.transaction_type === "escrow_hold" || t.transaction_type === "escrow_release").length})`,
                },
                {
                  id: "withdrawal",
                  label: `Withdrawals (${(summary?.transactions ?? []).filter((t) => t.transaction_type === "farmer_withdrawal").length})`,
                },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilterTab(id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${filterTab === id
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
                          className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full capitalize ${txn.status === "completed" || txn.status === "Completed"
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
