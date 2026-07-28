// app/admin/farmers/page.tsx

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, CheckCircle, Clock, AlertCircle, UserPlus } from 'lucide-react';

const getStatusUI = (status: string) => {
  switch (status) {
    case 'verified':
      return { icon: CheckCircle, className: 'bg-green-100 text-green-700 border-green-200', label: 'Verified' };
    case 'pending':
      return { icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Pending' };
    default:
      return { icon: AlertCircle, className: 'bg-red-100 text-red-700 border-red-200', label: 'Not Verified' };
  }
};

export default async function FarmerManagementPage() {
  const supabase = await createClient();

  const { data: farmers, error } = await supabase
    .from('profiles')
    .select('id, firstname, lastname, phone, email, verification_status, subscription_tier, created_at')
    .eq('role', 'farmer')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching farmers:', error);
  }

  const total = farmers?.length ?? 0;
  const pendingCount = farmers?.filter((f) => f.verification_status === 'pending').length ?? 0;
  const verifiedCount = farmers?.filter((f) => f.verification_status === 'verified').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review, verify, and manage all registered farmers.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Farmers', value: total, color: 'text-gray-900' },
          { label: 'Pending Review', value: pendingCount, color: 'text-amber-600' },
          { label: 'Verified', value: verifiedCount, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-700">All Farmers</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {farmers && farmers.map((farmer) => {
                const statusUI = getStatusUI(farmer.verification_status ?? 'pending');
                const StatusIcon = statusUI.icon;
                const fullName = [farmer.firstname, farmer.lastname].filter(Boolean).join(' ') || 'Unnamed Farmer';
                return (
                  <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-700">
                            {(farmer.firstname?.[0] ?? '?').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">{fullName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{farmer.email ?? '—'}</p>
                      <p className="text-xs text-gray-400">{farmer.phone ?? 'No phone'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                        ${farmer.subscription_tier === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {farmer.subscription_tier ?? 'free'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusUI.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusUI.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {new Date(farmer.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/farmers/${farmer.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {farmers && farmers.length === 0 && (
          <div className="text-center py-16 px-4">
            <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No Farmers Yet</h3>
            <p className="text-sm text-gray-400 mt-1">Farmers will appear here as they sign up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
