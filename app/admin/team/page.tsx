// app/admin/team/page.tsx
// Super admin only — gated in middleware

import { createClient } from '@/lib/supabase/server';
import { Shield, Lock, Crown, User, Users } from 'lucide-react';

const levelConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  super_admin: { label: 'Super Admin', cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Crown },
  moderator:   { label: 'Moderator',   cls: 'bg-blue-100 text-blue-700 border-blue-200',    icon: Shield },
  support:     { label: 'Support',     cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: User },
};

export default async function AdminTeamPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from('admins')
    .select(`
      profile_id, admin_level, created_at,
      profiles ( firstname, lastname, email, avatar_url, phone )
    `)
    .order('created_at', { ascending: false });

  const superCount = admins?.filter((a) => a.admin_level === 'super_admin').length ?? 0;
  const modCount = admins?.filter((a) => a.admin_level === 'moderator').length ?? 0;
  const supportCount = admins?.filter((a) => a.admin_level === 'support').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 w-fit">
        <Lock className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-amber-700">Super Admin Access — Team Management</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Team</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage administrators, their roles, and access levels.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 text-center">
          <Crown className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-600">{superCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Super Admins</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 text-center">
          <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-600">{modCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Moderators</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 text-center">
          <User className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-purple-600">{supportCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Support Staff</p>
        </div>
      </div>

      {/* Role Permissions Reference */}
      <div className="bg-gray-900 rounded-2xl p-5 text-white">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Role Permissions Matrix
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1.5 text-gray-400 font-medium pr-6">Permission</th>
                <th className="text-center py-1.5 text-amber-400 font-semibold px-4">Super Admin</th>
                <th className="text-center py-1.5 text-blue-400 font-semibold px-4">Moderator</th>
                <th className="text-center py-1.5 text-purple-400 font-semibold px-4">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ['View all users & farmers', '✓', '✓', '✓'],
                ['Verify farmer documents', '✓', '✓', '✗'],
                ['Manage marketplace orders', '✓', '✓', '✗'],
                ['View transactions & escrow', '✓', '✗', '✗'],
                ['Manage subscriptions', '✓', '✗', '✗'],
                ['Support chat (all tickets)', '✓', '✓', '✓'],
                ['Manage admin team', '✓', '✗', '✗'],
                ['Platform settings', '✓', '✗', '✗'],
              ].map(([perm, sa, mod, sup]) => (
                <tr key={perm}>
                  <td className="py-2 text-gray-300 pr-6">{perm}</td>
                  <td className={`py-2 text-center font-bold ${sa === '✓' ? 'text-green-400' : 'text-gray-600'}`}>{sa}</td>
                  <td className={`py-2 text-center font-bold ${mod === '✓' ? 'text-green-400' : 'text-gray-600'}`}>{mod}</td>
                  <td className={`py-2 text-center font-bold ${sup === '✓' ? 'text-green-400' : 'text-gray-600'}`}>{sup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Active Administrators ({admins?.length ?? 0})</h2>
          <button className="text-xs font-semibold text-white bg-gray-900 hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            + Invite Admin
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {admins && admins.map((admin) => {
            const ui = levelConfig[admin.admin_level] ?? levelConfig['support'];
            const Icon = ui.icon;
            const profile = admin.profiles as any;
            const fullName = profile ? [profile.firstname, profile.lastname].filter(Boolean).join(' ') : 'Unknown';
            const initials = `${profile?.firstname?.[0] ?? ''}${profile?.lastname?.[0] ?? ''}`.toUpperCase() || '?';
            return (
              <div key={admin.profile_id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{fullName}</p>
                  <p className="text-xs text-gray-400">{profile?.email ?? '—'}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${ui.cls}`}>
                  <Icon className="w-3 h-3" />
                  {ui.label}
                </span>
                <p className="text-xs text-gray-400 hidden sm:block whitespace-nowrap">
                  Since {new Date(admin.created_at).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' })}
                </p>
                {/* Placeholder actions — wire to server actions later */}
                <button className="text-xs text-gray-400 hover:text-gray-700 transition-colors hidden sm:block">
                  Edit
                </button>
              </div>
            );
          })}
        </div>
        {(!admins || admins.length === 0) && (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">No admins found</p>
          </div>
        )}
      </div>
    </div>
  );
}
