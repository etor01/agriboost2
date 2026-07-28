// app/admin/transactions/page.tsx
// Super admin only — gated in middleware

import { createClient } from '@/lib/supabase/server';
import { CreditCard, Lock, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id, amount, service_name, escrow_held, status,
      paystack_reference, release_date, created_at,
      profiles ( firstname, lastname, email )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const totalRevenue = transactions?.filter((t) => t.status === 'completed').reduce((s, t) => s + t.amount, 0) ?? 0;
  const escrowHeld = transactions?.filter((t) => t.escrow_held && t.status !== 'completed').reduce((s, t) => s + t.amount, 0) ?? 0;
  const pendingCount = transactions?.filter((t) => t.status === 'pending').length ?? 0;

  const statusConfig: Record<string, { icon: React.ElementType; cls: string; label: string }> = {
    completed: { icon: CheckCircle, cls: 'bg-green-100 text-green-700 border-green-200', label: 'Completed' },
    pending:   { icon: Clock,       cls: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Pending' },
    failed:    { icon: XCircle,     cls: 'bg-red-100 text-red-700 border-red-200',         label: 'Failed' },
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Badge */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700">Super Admin Access — Finance Module</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">All platform payment activity, escrow releases, and Paystack references.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">GH₵ {totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">Completed transactions</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Escrow Held</p>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">GH₵ {escrowHeld.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting release</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Pending Payouts</p>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Transactions (last 50)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Escrow</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions && transactions.map((tx) => {
                const ui = statusConfig[tx.status] ?? statusConfig['pending'];
                const Icon = ui.icon;
                const profile = tx.profiles as any;
                const userName = profile ? [profile.firstname, profile.lastname].filter(Boolean).join(' ') : 'Unknown';
                return (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {tx.paystack_reference ?? `#${tx.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-700">{userName}</p>
                      <p className="text-xs text-gray-400">{profile?.email ?? ''}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{tx.service_name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">GH₵ {tx.amount.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      {tx.escrow_held ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Held</span>
                      ) : (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Released</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}>
                        <Icon className="w-3 h-3" />
                        {ui.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-16">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
