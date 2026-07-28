// app/admin/orders/page.tsx

import { createClient } from '@/lib/supabase/server';
import { ShoppingCart, AlertTriangle, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  processing:  { label: 'Processing',  icon: Clock,          cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  paid:        { label: 'Paid',        icon: CheckCircle,    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_transit:  { label: 'In Transit',  icon: Truck,          cls: 'bg-purple-100 text-purple-700 border-purple-200' },
  delivered:   { label: 'Delivered',   icon: CheckCircle,    cls: 'bg-green-100 text-green-700 border-green-200' },
  cancelled:   { label: 'Cancelled',   icon: XCircle,        cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, quantity, unit_price, total_amount, status, created_at,
      listings ( name ),
      buyers ( profile_id, profiles ( firstname, lastname ) )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const counts = {
    total: orders?.length ?? 0,
    open: orders?.filter((o) => ['processing', 'in_transit'].includes(o.status)).length ?? 0,
    delivered: orders?.filter((o) => o.status === 'delivered').length ?? 0,
    disputes: orders?.filter((o) => o.status === 'cancelled').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders & Disputes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor marketplace orders and handle dispute escalations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: counts.total, color: 'text-gray-900' },
          { label: 'Open', value: counts.open, color: 'text-amber-600' },
          { label: 'Delivered', value: counts.delivered, color: 'text-green-600' },
          { label: 'Cancelled', value: counts.disputes, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Dispute Banner (if any) */}
      {counts.disputes > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-700">
            {counts.disputes} cancelled order{counts.disputes !== 1 ? 's' : ''} may require dispute resolution. Review below.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Orders (last 50)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Listing</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders && orders.map((order) => {
                const ui = statusConfig[order.status] ?? statusConfig['processing'];
                const Icon = ui.icon;
                const buyer = (order.buyers as any)?.profiles;
                const buyerName = buyer ? [buyer.firstname, buyer.lastname].filter(Boolean).join(' ') : 'Unknown';
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 font-medium">
                      {(order.listings as any)?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{buyerName}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                      GH₵ {(order.total_amount ?? 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {ui.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {(!orders || orders.length === 0) && (
          <div className="text-center py-16">
            <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here when buyers make purchases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
