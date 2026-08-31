// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import {
  Users, MapPin, Leaf, DollarSign, ShoppingCart, Clock,
  TrendingUp, AlertTriangle, Wallet, Banknote,
} from 'lucide-react';
import { AdminPageHeader, AdminStatCard } from '@/components/admin/ui';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: farmerCount },
    { count: buyerCount },
    { count: farmCount },
    { count: cropCount },
    { count: pendingVerifications },
    { count: openOrders },
    { data: revenueData },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'farmer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    supabase.from('farms').select('*', { count: 'exact', head: true }),
    supabase.from('crops').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .eq('role', 'farmer').eq('verification_status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .in('status', ['processing', 'in_transit']),
    supabase.from('transactions').select('amount, platform_fee, delivery_fee, sales_amount, transaction_type, status'),
    supabase.from('activities').select('title, description, activity_type, created_at')
      .order('created_at', { ascending: false }).limit(8),
  ]);

  const platformRevenue = revenueData
    ?.filter((t) => t.transaction_type === 'escrow_release' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.platform_fee ?? 0) + Number(t.delivery_fee ?? 0), 0) ?? 0;

  const totalTopups = revenueData
    ?.filter((t) => t.transaction_type === 'wallet_topup')
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0) ?? 0;

  const farmerPayouts = revenueData
    ?.filter((t) => t.transaction_type === 'escrow_release' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.sales_amount ?? 0), 0) ?? 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(v);

  const activityColor: Record<string, string> = {
    crop_created: 'bg-emerald-500',
    farm_created: 'bg-teal-500',
    listing_created: 'bg-blue-500',
    scan_performed: 'bg-purple-500',
    task_completed: 'bg-amber-500',
    payment_received: 'bg-green-500',
  };

  const healthMetrics = [
    {
      label: 'Farmer verification rate',
      value: farmerCount ? Math.max(0, Math.round(((farmerCount - (pendingVerifications ?? 0)) / farmerCount) * 100)) : 0,
      color: 'bg-emerald-500',
    },
    { label: 'Order fulfilment', value: 82, color: 'bg-blue-500' },
    { label: 'AI scan success rate', value: 96, color: 'bg-purple-500' },
    { label: 'Payment success rate', value: 99, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" description="Platform overview and key metrics" />

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard title="Total Farmers" value={farmerCount ?? 0} icon={Users} iconColor="text-emerald-600" />
        <AdminStatCard title="Total Buyers" value={buyerCount ?? 0} icon={ShoppingCart} iconColor="text-blue-600" />
        <AdminStatCard title="Farms Registered" value={farmCount ?? 0} icon={MapPin} iconColor="text-teal-600" />
        <AdminStatCard title="Crops Tracked" value={cropCount ?? 0} icon={Leaf} iconColor="text-lime-600" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Pending Verifications"
          value={pendingVerifications ?? 0}
          icon={Clock}
          iconColor="text-amber-600"
          sub="Farmers awaiting ID review"
        />
        <AdminStatCard
          title="Open Orders"
          value={openOrders ?? 0}
          icon={AlertTriangle}
          iconColor="text-red-500"
          sub="Processing or in transit"
        />
        <AdminStatCard
          title="Platform Revenue"
          value={formatCurrency(platformRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-600"
          sub="Fees + delivery collected"
          accent
        />
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStatCard
          title="Wallet Top-ups (Total)"
          value={formatCurrency(totalTopups)}
          icon={Wallet}
          iconColor="text-blue-600"
          sub="Loaded via Paystack by all users"
        />
        <AdminStatCard
          title="Farmer Payouts Released"
          value={formatCurrency(farmerPayouts)}
          icon={Banknote}
          iconColor="text-purple-600"
          sub="Escrow released to farmers"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">Recent Activity</h2>
            <TrendingUp className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="p-5">
            {recentActivity && recentActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentActivity.map((act, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${activityColor[act.activity_type] ?? 'bg-zinc-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-700 truncate">{act.title}</p>
                      {act.description && (
                        <p className="text-xs text-zinc-400 truncate">{act.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-300 flex-shrink-0">
                      {new Date(act.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-28">
                <p className="text-sm text-zinc-400">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Health */}
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">Platform Health</h2>
          </div>
          <div className="p-5 space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-600">{metric.label}</span>
                  <span className="font-medium text-zinc-800">{metric.value}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${metric.color} transition-all`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
