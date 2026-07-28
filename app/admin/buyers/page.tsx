// app/admin/buyers/page.tsx

import { createClient } from '@/lib/supabase/server';
import { ShoppingBag, MapPin, ShoppingCart, Star } from 'lucide-react';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">All registered marketplace buyers on AgriBoost.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Buyers', value: total, color: 'text-gray-900' },
          { label: 'Free Tier', value: total - premiumCount, color: 'text-blue-600' },
          { label: 'Premium Tier', value: premiumCount, color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Buyers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {buyers && buyers.map((buyer) => {
                const fullName = [buyer.firstname, buyer.lastname].filter(Boolean).join(' ') || 'Unnamed Buyer';
                const initials = `${buyer.firstname?.[0] ?? ''}${buyer.lastname?.[0] ?? ''}`.toUpperCase() || '?';
                return (
                  <tr key={buyer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-700">{initials}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{fullName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{buyer.email ?? '—'}</p>
                      <p className="text-xs text-gray-400">{buyer.phone ?? 'No phone'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {[buyer.location, buyer.region].filter(Boolean).join(', ') || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                        ${buyer.subscription_tier === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {buyer.subscription_tier === 'premium' && <Star className="w-3 h-3" />}
                        {buyer.subscription_tier ?? 'free'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(buyer.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {buyers && buyers.length === 0 && (
          <div className="text-center py-16 px-4">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No Buyers Yet</h3>
            <p className="text-sm text-gray-400 mt-1">Buyers will appear here as they register.</p>
          </div>
        )}
      </div>
    </div>
  );
}
