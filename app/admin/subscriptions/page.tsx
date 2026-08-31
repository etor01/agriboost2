// app/admin/subscriptions/page.tsx
// Super admin only — gated in middleware

import { createClient } from '@/lib/supabase/server';
import { Star, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { AdminPageHeader, AdminBadge, AdminEmptyState } from '@/components/admin/ui';
import type { LucideIcon } from 'lucide-react';

type StatusVariant = 'success' | 'warn' | 'danger';

const statusConfig: Record<string, { icon: LucideIcon; variant: StatusVariant; label: string }> = {
  active:    { icon: CheckCircle,   variant: 'success', label: 'Active' },
  expired:   { icon: AlertTriangle, variant: 'warn',    label: 'Expired' },
  cancelled: { icon: XCircle,       variant: 'danger',  label: 'Cancelled' },
};

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select(`id, status, start_date, end_date, paystack_subscription_id, created_at,
      farmers ( profile_id, profiles ( firstname, lastname, email ) )`)
    .order('created_at', { ascending: false });

  const activeCount    = subs?.filter((s) => s.status === 'active').length ?? 0;
  const expiredCount   = subs?.filter((s) => s.status === 'expired').length ?? 0;
  const cancelledCount = subs?.filter((s) => s.status === 'cancelled').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700">Super Admin Access — Subscription Module</span>
      </div>

      <AdminPageHeader title="Subscriptions" description="Manage farmer premium subscriptions and billing cycles." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Subscriptions', value: activeCount,    color: 'text-emerald-600' },
          { label: 'Expired',              value: expiredCount,   color: 'text-amber-600' },
          { label: 'Cancelled',            value: cancelledCount, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plan info card */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="rounded-md bg-amber-50 p-1.5">
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-sm font-medium text-zinc-900">5-Star Farmer Premium Plan</h2>
        </div>
        <p className="text-2xl font-semibold text-zinc-900">GH₵ 120 <span className="text-sm font-normal text-zinc-400">/ year</span></p>
        <p className="text-sm text-zinc-500 mt-1">Unlimited AI scans · Priority listing · Verified badge · Market insights</p>
        <p className="text-xs text-zinc-400 mt-2">Update pricing or trial durations via Platform Settings.</p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h2 className="text-sm font-medium text-zinc-900">All Subscription Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {['Farmer', 'Paystack ID', 'Start Date', 'End Date', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {subs && subs.map((sub) => {
                const ui = statusConfig[sub.status] ?? statusConfig['expired'];
                const Icon = ui.icon;
                const farmer = (sub.farmers as any)?.profiles;
                const farmerName = farmer ? [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') : 'Unknown';
                return (
                  <tr key={sub.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-zinc-800">{farmerName}</p>
                      <p className="text-xs text-zinc-400">{farmer?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-500">{sub.paystack_subscription_id ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">
                      {new Date(sub.start_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <AdminBadge variant={ui.variant} icon={Icon}>{ui.label}</AdminBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!subs || subs.length === 0) && (
          <AdminEmptyState icon={Star} title="No subscriptions yet" description="Subscriptions are created after Paystack payment confirmation." />
        )}
      </div>
    </div>
  );
}
