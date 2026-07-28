// lib/admin.ts
// Server-side utility for fetching the current admin's profile + level.
// Always call this from Server Components or Server Actions only.

import { createClient } from '@/lib/supabase/server';

export type AdminLevel = 'super_admin' | 'moderator' | 'support';

export interface AdminProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  avatar_url: string | null;
  admin_level: AdminLevel;
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, firstname, lastname, email, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: adminRow } = await supabase
    .from('admins')
    .select('admin_level')
    .eq('profile_id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    avatar_url: profile.avatar_url,
    admin_level: (adminRow?.admin_level as AdminLevel) ?? 'moderator',
  };
}

/** Returns the display label and colour class for an admin level. */
export function getAdminLevelMeta(level: AdminLevel): { label: string; colorClass: string; bgClass: string } {
  switch (level) {
    case 'super_admin':
      return { label: 'Super Admin', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10 border-amber-500/30' };
    case 'moderator':
      return { label: 'Moderator', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10 border-blue-500/30' };
    case 'support':
      return { label: 'Support', colorClass: 'text-purple-400', bgClass: 'bg-purple-500/10 border-purple-500/30' };
    default:
      return { label: 'Admin', colorClass: 'text-gray-400', bgClass: 'bg-gray-500/10 border-gray-500/30' };
  }
}
