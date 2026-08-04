// app/admin/transactions/page.tsx
// Super admin only — gated in middleware

import { createClient } from "@/lib/supabase/server";
import {
  CreditCard,
  Lock,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Wallet,
  Banknote,
  ArrowUpRight,
  Building2,
} from "lucide-react";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id, amount, service_name, escrow_held, status,
      paystack_reference, release_date, created_at,
      transaction_type, delivery_fee, platform_fee, sales_amount,
      platform_fee_collected, farmer_balance_credited,
      profiles ( firstname, lastname, email )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  // ── KPI Calculations ────────────────────────────────────────────────────────
  const allTx = transactions || [];

  // Total wallet top-ups (money in from Paystack)
  const totalTopups = allTx
    .filter((t) => t.transaction_type === "wallet_topup")
    .reduce((s, t) => s + Number(t.amount ?? 0), 0);

  // Platform fees collected from completed orders
  const platformFeesCollected = allTx
    .filter(
      (t) =>
        t.transaction_type === "escrow_release" && t.status === "completed"
    )
    .reduce((s, t) => s + Number(t.platform_fee ?? 0) + Number(t.delivery_fee ?? 0), 0);

  // Farmer payouts released (sales_amount credited to farmers)
  const farmerPayoutsReleased = allTx
    .filter(
      (t) =>
        t.transaction_type === "escrow_release" && t.status === "completed"
    )
    .reduce((s, t) => s + Number(t.sales_amount ?? 0), 0);

  // Farmer withdrawals processed
  const farmerWithdrawals = allTx
    .filter((t) => t.transaction_type === "farmer_withdrawal")
    .reduce((s, t) => s + Number(t.amount ?? 0), 0);

  // Funds still in escrow
  const escrowHeld = allTx
    .filter((t) => t.escrow_held && t.status !== "completed")
    .reduce((s, t) => s + Number(t.amount ?? 0), 0);

  const pendingCount = allTx.filter((t) => t.status === "pending").length;

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  const statusConfig: Record<
    string,
    { icon: React.ElementType; cls: string; label: string }
  > = {
    completed: {
      icon: CheckCircle,
      cls: "bg-green-100 text-green-700 border-green-200",
      label: "Completed",
    },
    pending: {
      icon: Clock,
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Pending",
    },
    failed: {
      icon: XCircle,
      cls: "bg-red-100 text-red-700 border-red-200",
      label: "Failed",
    },
  };

  const typeConfig: Record<
    string,
    { label: string; cls: string }
  > = {
    wallet_topup: {
      label: "💳 Wallet Top-up",
      cls: "bg-blue-50 text-blue-700 border-blue-200",
    },
    escrow_hold: {
      label: "🔒 Escrow Held",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    escrow_release: {
      label: "✅ Escrow Released",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    farmer_withdrawal: {
      label: "↑ Withdrawal",
      cls: "bg-gray-100 text-gray-600 border-gray-200",
    },
    purchase: {
      label: "Purchase",
      cls: "bg-purple-50 text-purple-700 border-purple-200",
    },
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700">
          Super Admin Access — Finance Module
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          All platform payment activity — wallet top-ups, escrow, farmer
          payouts, and withdrawals.
        </p>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Platform Revenue */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-emerald-800">
              Platform Revenue
            </p>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {fmt(platformFeesCollected)}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Fees + delivery collected
          </p>
        </div>

        {/* Wallet Top-ups */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Wallet Top-ups</p>
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalTopups)}</p>
          <p className="text-xs text-gray-400 mt-1">Total loaded via Paystack</p>
        </div>

        {/* Farmer Payouts Released */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Farmer Payouts</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {fmt(farmerPayoutsReleased)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Escrow released to farmers</p>
        </div>

        {/* Escrow Held */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">In Escrow</p>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{fmt(escrowHeld)}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting delivery confirmation</p>
        </div>

        {/* Farmer Withdrawals */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Farmer Withdrawals</p>
            <Banknote className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {fmt(farmerWithdrawals)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Paid out to farmers</p>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Pending Transactions</p>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* ── Transaction Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            All Transactions (last 100)
          </h2>
          <span className="text-xs text-gray-400">
            {allTx.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  User
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Service / Description
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Platform Fee
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Delivery Fee
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Farmer Earns
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allTx.map((tx) => {
                const ui =
                  statusConfig[tx.status] ?? statusConfig["pending"];
                const Icon = ui.icon;
                const profile = tx.profiles as any;
                const userName = profile
                  ? [profile.firstname, profile.lastname]
                      .filter(Boolean)
                      .join(" ")
                  : "Unknown";
                const txType =
                  typeConfig[tx.transaction_type] ||
                  typeConfig["purchase"];

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString("en-GH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {profile?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-xs">
                      <span className="truncate block">
                        {tx.service_name ?? "—"}
                      </span>
                      {tx.paystack_reference && (
                        <span className="font-mono text-[10px] text-gray-400">
                          {tx.paystack_reference.slice(0, 24)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {txType && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${txType.cls}`}
                        >
                          {txType.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-900 whitespace-nowrap">
                      {fmt(Number(tx.amount ?? 0))}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.platform_fee ?? 0) > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {fmt(Number(tx.platform_fee))}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.delivery_fee ?? 0) > 0 ? (
                        <span className="text-blue-700 font-bold">
                          {fmt(Number(tx.delivery_fee))}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.sales_amount ?? 0) > 0 ? (
                        <span className="text-amber-700 font-bold">
                          {fmt(Number(tx.sales_amount))}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}
                      >
                        <Icon className="w-3 h-3" />
                        {ui.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allTx.length === 0 && (
          <div className="text-center py-16">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">
              No transactions yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
