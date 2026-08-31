// app/admin/team/page.tsx
// Super admin only — gated in middleware

import { createClient } from '@/lib/supabase/server';
import { Shield, Lock, Crown, User, Users } from 'lucide-react';
import { AdminPageHeader, AdminBadge, AdminEmptyState } from '@/components/admin/ui';
import type { LucideIcon } from 'lucide-react';

type LevelVariant = 'warn' | 'blue' | 'purple';

const levelConfig: Record<string, { label: string; variant: LevelVariant; icon: LucideIcon }> = {
  super_admin: { label: 'Super Admin', variant: 'warn',   icon: Crown },
  moderator:   { label: 'Moderator',   variant: 'blue',   icon: Shield },
  support:     { label: 'Support',     variant: 'purple', icon: User },
};

export default async function AdminTeamPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from('admins')
    .select(`profile_id, admin_level, created_at, profiles ( firstname, lastname, email, avatar_url, phone )`)
    .order('created_at', { ascending: false });

  const superCount   = admins?.filter((a) => a.admin_level === 'super_admin').length ?? 0;
  const modCount     = admins?.filter((a) => a.admin_level === 'moderator').length ?? 0;
  const supportCount = admins?.filter((a) => a.admin_level === 'support').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5">
        <Lock className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700">Super Admin Access — Team Management</span>
      </div>

      <AdminPageHeader title="Admin Team" description="Manage administrators, their roles, and access levels." />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Super Admins',   value: superCount,   icon: Crown,   color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Moderators',     value: modCount,     icon: Shield,  color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Support Staff',  value: supportCount, icon: User,    color: 'text-purple-600',  bg: 'bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm text-center">
              <div className={`w-8 h-8 rounded-md ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Team Table */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-900">Active Administrators ({admins?.length ?? 0})</h2>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
            + Add an Admin
          </button>
        </div>
        <div className="divide-y divide-zinc-100">
          {admins && admins.map((admin) => {
            const ui = levelConfig[admin.admin_level] ?? levelConfig['support'];
            const Icon = ui.icon;
            const profile = admin.profiles as any;
            const fullName = profile ? [profile.firstname, profile.lastname].filter(Boolean).join(' ') : 'Unknown';
            const initials = `${profile?.firstname?.[0] ?? ''}${profile?.lastname?.[0] ?? ''}`.toUpperCase() || '?';
            return (
              <div key={admin.profile_id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/60 transition-colors">
                <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{fullName}</p>
                  <p className="text-xs text-zinc-400">{profile?.email ?? '—'}</p>
                </div>
                <AdminBadge variant={ui.variant} icon={Icon}>{ui.label}</AdminBadge>
                <p className="text-xs text-zinc-400 hidden sm:block whitespace-nowrap">
                  Since {new Date(admin.created_at).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' })}
                </p>
                <button className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors hidden sm:block">
                  Edit
                </button>
              </div>
            );
          })}
        </div>
        {(!admins || admins.length === 0) && (
          <AdminEmptyState icon={Users} title="No admins found" />
        )}
      </div>
    </div>
  );
}
