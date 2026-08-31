// app/admin/transactions/page.tsx
// Super admin only — gated in middleware

import { createClient } from "@/lib/supabase/server";
import {
  CreditCard, Lock, TrendingUp, CheckCircle, Clock, XCircle,
  Wallet, Banknote, Building2,
} from "lucide-react";
import { AdminPageHeader, AdminBadge, AdminEmptyState } from "@/components/admin/ui";
import type { LucideIcon } from "lucide-react";

type StatusVariant = 'success' | 'warn' | 'danger';
type TypeVariant = 'blue' | 'warn' | 'success' | 'muted' | 'purple';

const statusConfig: Record<string, { icon: LucideIcon; variant: StatusVariant; label: string }> = {
  completed: { icon: CheckCircle, variant: "success", label: "Completed" },
  pending:   { icon: Clock,       variant: "warn",    label: "Pending" },
  failed:    { icon: XCircle,     variant: "danger",  label: "Failed" },
};

const typeConfig: Record<string, { label: string; variant: TypeVariant }> = {
  wallet_topup:       { label: "Wallet Top-up",    variant: "blue" },
  escrow_hold:        { label: "Escrow Held",       variant: "warn" },
  escrow_release:     { label: "Escrow Released",   variant: "success" },
  farmer_withdrawal:  { label: "Withdrawal",        variant: "muted" },
  purchase:           { label: "Purchase",          variant: "purple" },
};

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`id, amount, service_name, escrow_held, status, paystack_reference, release_date, created_at,
      transaction_type, delivery_fee, platform_fee, sales_amount,
      platform_fee_collected, farmer_balance_credited,
      profiles ( firstname, lastname, email )`)
    .order("created_at", { ascending: false })
    .limit(100);

  const allTx = transactions || [];

  const totalTopups         = allTx.filter((t) => t.transaction_type === "wallet_topup").reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const platformFeesCollected = allTx.filter((t) => t.transaction_type === "escrow_release" && t.status === "completed").reduce((s, t) => s + Number(t.platform_fee ?? 0) + Number(t.delivery_fee ?? 0), 0);
  const farmerPayoutsReleased = allTx.filter((t) => t.transaction_type === "escrow_release" && t.status === "completed").reduce((s, t) => s + Number(t.sales_amount ?? 0), 0);
  const farmerWithdrawals   = allTx.filter((t) => t.transaction_type === "farmer_withdrawal").reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const escrowHeld          = allTx.filter((t) => t.escrow_held && t.status !== "completed").reduce((s, t) => s + Number(t.amount ?? 0), 0);
  const pendingCount        = allTx.filter((t) => t.status === "pending").length;

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  return (
    <div className="space-y-6">
      {/* Super Admin badge */}
      <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700">Super Admin Access — Finance Module</span>
      </div>

      <AdminPageHeader title="Transactions" description="All platform payment activity — wallet top-ups, escrow, farmer payouts, and withdrawals." />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Platform Revenue — accented */}
        <div className="rounded-lg border border-zinc-200 border-l-4 border-l-emerald-500 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-zinc-500">Platform Revenue</p>
            <div className="rounded-md bg-zinc-100 p-1.5"><Building2 className="h-4 w-4 text-emerald-600" /></div>
          </div>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">{fmt(platformFeesCollected)}</p>
          <p className="mt-1 text-xs text-zinc-400">Fees + delivery collected</p>
        </div>

        {[
          { title: "Wallet Top-ups",       value: fmt(totalTopups),           icon: Wallet,    sub: "Total loaded via Paystack",         color: "text-blue-600" },
          { title: "Farmer Payouts",        value: fmt(farmerPayoutsReleased), icon: TrendingUp, sub: "Escrow released to farmers",        color: "text-emerald-600" },
          { title: "In Escrow",             value: fmt(escrowHeld),            icon: Lock,      sub: "Awaiting delivery confirmation",    color: "text-amber-600" },
          { title: "Farmer Withdrawals",    value: fmt(farmerWithdrawals),     icon: Banknote,  sub: "Paid out to farmers",              color: "text-purple-600" },
          { title: "Pending Transactions",  value: pendingCount,               icon: Clock,     sub: "Awaiting confirmation",            color: "text-blue-600" },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-zinc-500">{kpi.title}</p>
              <div className="rounded-md bg-zinc-100 p-1.5"><kpi.icon className={`h-4 w-4 ${kpi.color}`} /></div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-900">All Transactions <span className="text-zinc-400 font-normal">(last 100)</span></h2>
          <span className="text-xs text-zinc-400">{allTx.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Date", "User", "Service / Ref", "Type", "Total", "Platform Fee", "Delivery Fee", "Farmer Earns", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {allTx.map((tx) => {
                const ui = statusConfig[tx.status] ?? statusConfig["pending"];
                const Icon = ui.icon;
                const profile = tx.profiles as any;
                const userName = profile ? [profile.firstname, profile.lastname].filter(Boolean).join(" ") : "Unknown";
                const txType = typeConfig[tx.transaction_type] || typeConfig["purchase"];
                return (
                  <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-zinc-700 whitespace-nowrap">{userName}</p>
                      <p className="text-xs text-zinc-400">{profile?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-zinc-600 max-w-xs">
                      <span className="truncate block">{tx.service_name ?? "—"}</span>
                      {tx.paystack_reference && (
                        <span className="font-mono text-[10px] text-zinc-400">{tx.paystack_reference.slice(0, 24)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {txType && <AdminBadge variant={txType.variant}>{txType.label}</AdminBadge>}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-zinc-900 whitespace-nowrap">{fmt(Number(tx.amount ?? 0))}</td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.platform_fee ?? 0) > 0
                        ? <span className="font-medium text-emerald-700">{fmt(Number(tx.platform_fee))}</span>
                        : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.delivery_fee ?? 0) > 0
                        ? <span className="font-medium text-blue-700">{fmt(Number(tx.delivery_fee))}</span>
                        : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                      {Number(tx.sales_amount ?? 0) > 0
                        ? <span className="font-medium text-amber-700">{fmt(Number(tx.sales_amount))}</span>
                        : <span className="text-zinc-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <AdminBadge variant={ui.variant} icon={Icon}>{ui.label}</AdminBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allTx.length === 0 && (
          <AdminEmptyState icon={CreditCard} title="No transactions yet" />
        )}
      </div>
    </div>
  );
}
