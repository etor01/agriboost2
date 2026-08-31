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
  Download,
  Star,
} from "lucide-react";
import RevenueChart from "./RevenueChart";
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
  let totalEscrow = 0,
    totalEarned = 0,
    totalTopups = 0,
    totalWithdrawn = 0;
  for (const tx of txList) {
    const salesAmt = Number(tx.sales_amount ?? 0);
    const amt = Number(tx.amount ?? 0);
    if (tx.transaction_type === "wallet_topup") totalTopups += amt;
    else if (tx.transaction_type === "farmer_withdrawal") totalWithdrawn += amt;
    else if (tx.escrow_held && tx.status !== "completed")
      totalEscrow += salesAmt > 0 ? salesAmt : amt;
    else if (tx.transaction_type === "escrow_release" && tx.status === "completed")
      totalEarned += salesAmt > 0 ? salesAmt : amt;
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
      setError(`Insufficient balance. Max: GH₵ ${availableBalance.toFixed(2)}`);
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
        onSuccess(
          withdrawAmt,
          data.newAvailableBalance ?? availableBalance - withdrawAmt
        );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-zinc-200 relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Withdraw Earnings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">
              Withdrawal Requested
            </h3>
            <p className="text-xs text-zinc-500">
              GH₵ {success.amount.toFixed(2)} is being processed via{" "}
              {method === "momo" ? "Mobile Money" : "Bank Transfer"}.
            </p>
            <div className="bg-zinc-50 rounded-md p-2.5 text-xs text-zinc-500 font-mono">
              Ref: {success.reference}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-zinc-900 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors text-xs shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">
                Available to withdraw
              </span>
              <span className="text-sm font-bold text-zinc-900">
                GH₵ {availableBalance.toFixed(2)}
              </span>
            </div>

            {!hasBalance && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  You currently have no available balance. Escrow funds unlock
                  when buyers confirm delivery OTP.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2.5 text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Payout method selection */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Payout Channel
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMethod("momo")}
                  className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    method === "momo"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank")}
                  className={`p-2.5 rounded-md border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                    method === "bank"
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" /> Bank Account
                </button>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                Withdraw Amount (GH₵)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-zinc-400 text-xs">
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
                  className="w-full pl-11 pr-14 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm font-semibold text-zinc-900 placeholder:text-zinc-300 disabled:bg-zinc-50 disabled:cursor-not-allowed"
                />
                {hasBalance && (
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance.toString())}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>

            {/* Account details input */}
            <div>
              <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block mb-1.5">
                {method === "momo"
                  ? "MoMo Phone Number & Network"
                  : "Bank Name & Account Number"}
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
                className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 text-xs text-zinc-900 placeholder:text-zinc-300 disabled:bg-zinc-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-md border border-zinc-200 text-zinc-700 font-medium text-xs hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading || !hasBalance}
                className="px-4 py-2 bg-zinc-900 text-white font-medium text-xs rounded-md hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />{" "}
                    Processing…
                  </>
                ) : (
                  "Confirm Payout"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tx type badge config ──────────────────────────────────────────────────────
function getTxBadge(type: string | null, status: string) {
  if (type === "wallet_topup")
    return { label: "Wallet Top-up", variant: "info" as const };
  if (type === "escrow_hold")
    return { label: "Escrow Held", variant: "warn" as const };
  if (type === "escrow_release")
    return { label: "Escrow Released", variant: "success" as const };
  if (type === "farmer_withdrawal")
    return { label: "Withdrawal", variant: "muted" as const };
  if (type === "purchase")
    return { label: "Purchase", variant: "neutral" as const };
  if (status === "completed")
    return { label: "Completed", variant: "success" as const };
  return { label: "Pending", variant: "warn" as const };
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
  const [filterTab, setFilterTab] = useState<
    "all" | "topup" | "escrow" | "withdrawal"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [paystackReady, setPaystackReady] = useState(false);
  const initializePaymentRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, txRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("wallet_balance, available_balance, role")
        .eq("id", user.id)
        .single(),
      supabase
        .from("transactions")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false }),
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
          publicKey:
            process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
            "pk_test_placeholder_key",
        };
        const initPayment = usePaystackPayment(config);
        initializePaymentRef.current = initPayment;
        setPaystackReady(true);
      } catch {
        /* noop */
      }
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
        toast.success("5-Star Farmer plan activated! Welcome to premium.");
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
    else if (filterTab === "escrow")
      matchTab =
        tx.transaction_type === "escrow_hold" ||
        tx.transaction_type === "escrow_release";
    else if (filterTab === "withdrawal")
      matchTab = tx.transaction_type === "farmer_withdrawal";

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
    <div className="space-y-6">
      {/* Modals */}
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

      {/* Page Header */}
      <FarmerPageHeader
        badge="Financial Operations"
        badgeIcon={Wallet}
        title="Finances &amp; Wallet"
        description={
          isFarmer
            ? "Track your escrow sales earnings, manage MoMo/bank payouts, and monitor transaction activity."
            : "Manage your AgriBoost wallet balance and track produce purchase transactions."
        }
        action={
          <div className="flex items-center gap-2">
            {isFarmer && (
              <button
                onClick={() => setShowWithdraw(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-200 bg-white text-zinc-800 font-medium text-xs sm:text-sm hover:bg-zinc-50 transition-colors shadow-xs"
              >
                <Minus className="h-3.5 w-3.5" /> Withdraw
              </button>
            )}
            <button
              onClick={() => setShowTopUp(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-md text-xs sm:text-sm transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Load Wallet
            </button>
          </div>
        }
      />

      {/* Wallet Balance Hero */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-900 text-white p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                AgriBoost Digital Wallet
              </span>
              <FarmerBadge variant="success">Active</FarmerBadge>
            </div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              GH₵{" "}
              {(summary.walletBalance ?? 0).toLocaleString("en-GH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-zinc-400">
              Primary digital wallet balance for marketplace purchases and farm services
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowTopUp(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium text-xs transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Top Up Balance
            </button>
            {isFarmer && (
              <button
                onClick={() => setShowWithdraw(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-md font-medium text-xs transition-colors"
              >
                <Minus className="h-3.5 w-3.5" /> Payout Request
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FarmerStatCard
          title="Total Top-ups"
          value={`GH₵ ${(summary.totalTopups ?? 0).toFixed(2)}`}
          icon={CreditCard}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          sub="Paystack deposits"
        />

        <FarmerStatCard
          title={isFarmer ? "Locked in Escrow" : "Pending Orders"}
          value={`GH₵ ${(summary.totalEscrow ?? 0).toFixed(2)}`}
          icon={Lock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          sub={
            isFarmer
              ? "Releases on buyer OTP confirmation"
              : "Held in escrow protection"
          }
        />

        {isFarmer ? (
          <FarmerStatCard
            title="Available Payout"
            value={`GH₵ ${(summary.availableBalance ?? 0).toFixed(2)}`}
            icon={Wallet}
            iconColor="text-emerald-600"
            sub="Ready for MoMo / Bank transfer"
            accent
          />
        ) : (
          <FarmerStatCard
            title="Total Withdrawn"
            value={`GH₵ ${(summary.totalWithdrawn ?? 0).toFixed(2)}`}
            icon={ArrowUpRight}
            iconColor="text-zinc-600"
            sub="Order expenditures"
          />
        )}

        <FarmerStatCard
          title={isFarmer ? "Total Earned" : "Completed Purchases"}
          value={`GH₵ ${(summary.totalEarned ?? 0).toFixed(2)}`}
          icon={TrendingUp}
          iconColor="text-lime-600"
          iconBg="bg-lime-50 border-lime-100"
          sub={isFarmer ? "Lifetime net produce sales" : "Delivered orders"}
        />
      </div>

      {/* Revenue Chart (farmer only) */}
      {isFarmer && summary && (
        <RevenueChart transactions={summary.transactions} />
      )}

      {/* Fee Explainer (farmer only) */}
      {isFarmer && (
        <FarmerCard className="p-4 bg-zinc-50/60">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              How Earnings &amp; Escrow Fees Work
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white rounded-md p-3 border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Step 1 · Order Total
              </span>
              <p className="font-semibold text-zinc-900 mt-1">Produce Subtotal</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Buyer deposits funds into protected escrow.
              </p>
            </div>
            <div className="bg-white rounded-md p-3 border border-zinc-200">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Step 2 · Platform Fee
              </span>
              <p className="font-semibold text-zinc-900 mt-1">5% Processing Fee</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Covers payment gateway, dispute handling, and SMS alerts.
              </p>
            </div>
            <div className="bg-white rounded-md p-3 border border-zinc-200">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Step 3 · Your Payout
              </span>
              <p className="font-semibold text-emerald-700 mt-1">Subtotal − 5% Fee</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Released instantly to your available balance upon OTP verification.
              </p>
            </div>
          </div>
        </FarmerCard>
      )}

      {/* Transaction History Table */}
      <FarmerCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50/50">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Transaction History
            </h2>
            <p className="text-[11px] text-zinc-500">
              Wallet top-ups, escrow releases, and withdrawal activity
            </p>
          </div>

          {/* Filter tabs & date filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md text-xs">
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
                    label: `Payouts (${summary.transactions.filter((t) => t.transaction_type === "farmer_withdrawal").length})`,
                  },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilterTab(id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterTab === id
                      ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/80"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs px-2 py-1 rounded-md border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <span className="text-zinc-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs px-2 py-1 rounded-md border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <button
                onClick={() => {
                  window.location.href = `/api/transactions/export?tab=${filterTab}${
                    startDate ? `&start=${startDate}` : ""
                  }${endDate ? `&end=${endDate}` : ""}`;
                }}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md transition-colors shadow-xs inline-flex items-center gap-1"
                title="Export CSV"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/75 border-b border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Amount</th>
                {isFarmer && <th className="p-3.5">Your Share</th>}
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredTx.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFarmer ? 6 : 5}
                    className="text-center py-10 text-zinc-400 text-xs"
                  >
                    No transactions found matching this filter.
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
                      className="hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-3.5 font-medium text-zinc-900 max-w-xs">
                        <span className="truncate block">
                          {txn.service_name || "—"}
                        </span>
                        {(platFee > 0 || delFee > 0) && (
                          <span className="text-[11px] text-zinc-400 mt-0.5 block">
                            Fee: GH₵ {platFee.toFixed(2)} · Delivery: GH₵{" "}
                            {delFee.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <FarmerBadge variant={badge.variant}>
                          {badge.label}
                        </FarmerBadge>
                      </td>
                      <td className="p-3.5 font-semibold text-zinc-900 whitespace-nowrap">
                        GH₵ {Number(txn.amount).toFixed(2)}
                      </td>
                      {isFarmer && (
                        <td className="p-3.5 text-emerald-700 font-semibold whitespace-nowrap">
                          {salesAmt > 0 ? `GH₵ ${salesAmt.toFixed(2)}` : "—"}
                        </td>
                      )}
                      <td className="p-3.5">
                        <FarmerBadge
                          variant={
                            txn.status === "completed" ||
                            txn.status === "Completed"
                              ? "success"
                              : "warn"
                          }
                        >
                          {txn.status}
                        </FarmerBadge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </FarmerCard>
    </div>
  );
}

