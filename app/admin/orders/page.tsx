// app/admin/orders/page.tsx
import { createClient } from '@/lib/supabase/server';
import { AlertTriangle } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui';
import OrdersTableClient from './OrdersTableClient';

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`id, quantity, unit_price, total_amount, status, created_at,
      listings ( name ),
      buyers ( profile_id, profiles ( firstname, lastname ) )`)
    .order('created_at', { ascending: false })
    .limit(500); // fetch plenty — client handles 50/page pagination

  const all = orders ?? [];

  const counts = {
    total:     all.length,
    open:      all.filter((o) => ['processing', 'in_transit'].includes(o.status)).length,
    delivered: all.filter((o) => o.status === 'delivered').length,
    cancelled: all.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders & Disputes"
        description="Monitor marketplace orders and handle dispute escalations."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: counts.total,     color: 'text-zinc-900' },
          { label: 'Open',         value: counts.open,      color: 'text-amber-600' },
          { label: 'Delivered',    value: counts.delivered, color: 'text-emerald-600' },
          { label: 'Cancelled',    value: counts.cancelled, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Dispute Banner */}
      {counts.cancelled > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {counts.cancelled} cancelled order{counts.cancelled !== 1 ? 's' : ''} may require dispute resolution. Use the filter below to review them.
          </p>
        </div>
      )}

      {/* Client component: filter tabs + paginated table */}
      <OrdersTableClient orders={all as any} />
    </div>
  );
}
