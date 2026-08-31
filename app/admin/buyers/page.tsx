// app/admin/buyers/page.tsx
import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, MapPin, Star } from 'lucide-react';
import { AdminPageHeader, AdminBadge, AdminEmptyState } from '@/components/admin/ui';

export default async function BuyerManagementPage() {
  const supabase = await createClient();

  const { data: buyers } = await supabase
    .from('profiles')
    .select('id, firstname, lastname, email, phone, location, region, subscription_tier, created_at')
    .eq('role', 'buyer')
    .order('created_at', { ascending: false });

  const total = buyers?.length ?? 0;
  const premiumCount = buyers?.filter((b) => b.subscription_tier === 'premium').length ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Buyer Management" description="All registered marketplace buyers on AgriBoost." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Buyers', value: total,               color: 'text-zinc-900' },
          { label: 'Free Tier',    value: total - premiumCount, color: 'text-blue-600' },
          { label: 'Premium Tier', value: premiumCount,          color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <h2 className="text-sm font-medium text-zinc-900">All Buyers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {['Buyer', 'Contact', 'Location', 'Plan', 'Joined'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {buyers && buyers.map((buyer) => {
                const fullName = [buyer.firstname, buyer.lastname].filter(Boolean).join(' ') || 'Unnamed Buyer';
                const initials = `${buyer.firstname?.[0] ?? ''}${buyer.lastname?.[0] ?? ''}`.toUpperCase() || '?';
                return (
                  <tr key={buyer.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-zinc-600">{initials}</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-800">{fullName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-zinc-600">{buyer.email ?? '—'}</p>
                      <p className="text-xs text-zinc-400">{buyer.phone ?? 'No phone'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {[buyer.location, buyer.region].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <AdminBadge variant={buyer.subscription_tier === 'premium' ? 'warn' : 'muted'}
                        icon={buyer.subscription_tier === 'premium' ? Star : undefined}>
                        {buyer.subscription_tier ?? 'free'}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      {new Date(buyer.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {buyers && buyers.length === 0 && (
          <AdminEmptyState icon={ShoppingBag} title="No Buyers Yet" description="Buyers will appear here as they register." />
        )}
      </div>
    </div>
  );
}
