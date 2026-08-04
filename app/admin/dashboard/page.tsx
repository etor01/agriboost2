// app/admin/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { Users, MapPin, Leaf, DollarSign, ShoppingCart, Clock, TrendingUp, AlertTriangle, Wallet, Banknote } from 'lucide-react';

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Parallel data fetching for all stats
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
      .eq('role', 'farmer')
      .eq('verification_status', 'pending'),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .in('status', ['processing', 'in_transit']),
    supabase.from('transactions').select('amount, platform_fee, delivery_fee, sales_amount, transaction_type, status'),
    supabase.from('activities').select('title, description, activity_type, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  // Platform fee income = platform_fee + delivery_fee from released escrow
  const platformRevenue = revenueData
    ?.filter((t) => t.transaction_type === 'escrow_release' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.platform_fee ?? 0) + Number(t.delivery_fee ?? 0), 0) ?? 0;

  // Total loaded via Paystack
  const totalTopups = revenueData
    ?.filter((t) => t.transaction_type === 'wallet_topup')
    .reduce((sum, t) => sum + Number(t.amount ?? 0), 0) ?? 0;

  // Total farmer sales released
  const farmerPayouts = revenueData
    ?.filter((t) => t.transaction_type === 'escrow_release' && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.sales_amount ?? 0), 0) ?? 0;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(v);

  // Activity type → icon colour
  const activityColor: Record<string, string> = {
    crop_created: 'bg-green-500',
    farm_created: 'bg-teal-500',
    listing_created: 'bg-blue-500',
    scan_performed: 'bg-purple-500',
    task_completed: 'bg-yellow-500',
    payment_received: 'bg-emerald-500',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and key metrics</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Farmers"
          value={farmerCount ?? 0}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Buyers"
          value={buyerCount ?? 0}
          icon={ShoppingCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Farms Registered"
          value={farmCount ?? 0}
          icon={MapPin}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Crops Tracked"
          value={cropCount ?? 0}
          icon={Leaf}
          iconBg="bg-lime-50"
          iconColor="text-lime-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Verifications"
          value={pendingVerifications ?? 0}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          sub="Farmers awaiting ID review"
        />
        <StatCard
          title="Open Orders"
          value={openOrders ?? 0}
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          sub="Processing or in transit"
        />
        <StatCard
          title="Platform Revenue"
          value={formatCurrency(platformRevenue)}
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          sub="Fees + delivery collected"
        />
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Wallet Top-ups (Total)"
          value={formatCurrency(totalTopups)}
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub="Loaded via Paystack by all users"
        />
        <StatCard
          title="Farmer Payouts Released"
          value={formatCurrency(farmerPayouts)}
          icon={Banknote}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          sub="Escrow released to farmers (sales amount)"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800">Recent Activity</h2>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          {recentActivity && recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.map((act, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activityColor[act.activity_type] ?? 'bg-gray-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{act.title}</p>
                    {act.description && (
                      <p className="text-xs text-gray-400 truncate">{act.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-300 flex-shrink-0 ml-auto">
                    {new Date(act.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Platform Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Farmer verification rate', value: farmerCount ? Math.max(0, Math.round(((farmerCount - (pendingVerifications ?? 0)) / farmerCount) * 100)) : 0, color: 'bg-emerald-500' },
              { label: 'Order fulfilment', value: 82, color: 'bg-blue-500' },
              { label: 'AI scan success rate', value: 96, color: 'bg-purple-500' },
              { label: 'Payment success rate', value: 99, color: 'bg-green-500' },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{metric.label}</span>
                  <span className="font-semibold text-gray-800">{metric.value}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${metric.color} transition-all`}
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
