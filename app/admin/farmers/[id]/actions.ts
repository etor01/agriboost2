// app/admin/farmers/[id]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateVerificationStatus(
  userId: string,
  newStatus: 'verified' | 'pending' | 'rejected',
) {
  const supabase = await createClient();

  // ── Admin guard ────────────────────────────────────────────────────────────
  // Middleware protects the route, but server actions are directly callable via
  // POST, so we perform an explicit server-side admin check here as a second
  // layer of defence.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Unauthorized: you must be signed in.' };
  }

  const { data: adminRow } = await supabase
    .from('admins')
    .select('admin_level')
    .eq('profile_id', user.id)
    .single();

  if (!adminRow) {
    return { success: false, message: 'Forbidden: admin access required.' };
  }
  // ── End admin guard ────────────────────────────────────────────────────────

  const { error } = await supabase
    .from('profiles')
    .update({
      verification_status: newStatus,
      verified_status: newStatus === 'verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating verification status:', error);
    return { success: false, message: error.message };
  }

  // Revalidate paths to ensure the UI updates with the new status across the app
  revalidatePath(`/admin/farmers`);
  revalidatePath(`/admin/farmers/${userId}`);

  return { success: true, message: `Farmer status updated to ${newStatus}.` };
}
