// app/admin/subscriptions/page.tsx
// Super admin only — gated in middleware

import { createClient } from '@/lib/supabase/server';
import { Star, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const statusConfig: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
  active:    { icon: CheckCircle,  cls: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
  expired:   { icon: AlertTriangle,cls: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Expired' },
  cancelled: { icon: XCircle,      cls: 'bg-red-100 text-red-700 border-red-200',        label: 'Cancelled' },
};

export default async function SubscriptionsPage() {
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from('subscriptions')
    .select(`
      id, status, start_date, end_date, paystack_subscription_id, created_at,
      farmers ( profile_id, profiles ( firstname, lastname, email ) )
    `)
    .order('created_at', { ascending: false });

  const activeCount = subs?.filter((s) => s.status === 'active').length ?? 0;
  const expiredCount = subs?.filter((s) => s.status === 'expired').length ?? 0;
  const cancelledCount = subs?.filter((s) => s.status === 'cancelled').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700">Super Admin Access — Subscription Module</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage farmer premium subscriptions and billing cycles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Subscriptions</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-amber-600">{expiredCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Expired</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Cancelled</p>
        </div>
      </div>

      {/* Pricing Info Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-5 h-5 text-yellow-300" />
          <h2 className="text-base font-bold">5-Star Farmer Premium Plan</h2>
        </div>
        <p className="text-2xl font-bold">GH₵ 120 <span className="text-sm font-normal opacity-80">/ year</span></p>
        <p className="text-sm opacity-80 mt-1">Unlimited AI scans · Priority listing · Verified badge · Market insights</p>
        <p className="text-xs opacity-60 mt-3">Contact your super admin to update pricing or trial durations via Platform Settings.</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Subscription Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paystack ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subs && subs.map((sub) => {
                const ui = statusConfig[sub.status] ?? statusConfig['expired'];
                const Icon = ui.icon;
                const farmer = (sub.farmers as any)?.profiles;
                const farmerName = farmer ? [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') : 'Unknown';
                return (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-800">{farmerName}</p>
                      <p className="text-xs text-gray-400">{farmer?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {sub.paystack_subscription_id ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {new Date(sub.start_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {sub.end_date
                        ? new Date(sub.end_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}>
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
        {(!subs || subs.length === 0) && (
          <div className="text-center py-16">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No subscriptions yet</p>
            <p className="text-sm text-gray-400 mt-1">Subscriptions are created after Paystack payment confirmation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
