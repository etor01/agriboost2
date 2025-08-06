// app/admin/farmers/[id]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateVerificationStatus(userId: string, newStatus: 'verified' | 'not_verified') {
  const supabase = createClient();

  // A real app should check if the current user is an admin before proceeding.
  // Our middleware handles route access, but actions should also be secure.

  const { data, error } = await supabase
    .from('profiles')
    .update({ verification_status: newStatus })
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
