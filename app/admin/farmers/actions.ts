'use server';

import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/admin';
import { createNotification } from '@/lib/actions/notifications';
import { revalidatePath } from 'next/cache';

/**
 * Approve a farmer's ID verification request.
 * Requires super_admin or moderator level.
 * Requires that farmer has uploaded a verification document.
 */
export async function approveFarmerVerification(farmerId: string) {
  const admin = await getAdminProfile();
  if (
    !admin ||
    (admin.admin_level !== 'super_admin' && admin.admin_level !== 'moderator')
  ) {
    return {
      success: false,
      error: 'Unauthorized: requires moderator or super_admin privileges.',
    };
  }

  const supabase = await createClient();

  // Fetch farmer profile to verify document presence & current status
  const { data: farmer, error: fetchErr } = await supabase
    .from('profiles')
    .select('verification_status, verification_doc_url, id_card_url')
    .eq('id', farmerId)
    .single();

  if (fetchErr || !farmer) {
    return { success: false, error: 'Farmer profile not found.' };
  }

  const docUrl = farmer.id_card_url || farmer.verification_doc_url;
  if (!docUrl) {
    return {
      success: false,
      error: "Cannot approve farmer who hasn't uploaded a verification document.",
    };
  }

  if (farmer.verification_status === 'verified') {
    return { success: false, error: 'Farmer is already verified.' };
  }

  // Update profile
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      verified_status: true,
      verification_status: 'verified',
      updated_at: new Date().toISOString(),
    })
    .eq('id', farmerId);

  if (updateErr) {
    console.error('Error approving farmer verification:', updateErr);
    return { success: false, error: updateErr.message };
  }

  // Create notification for farmer
  await createNotification(
    farmerId,
    'verification_approved',
    'Account Verified!',
    'Your farmer account verification document has been reviewed and approved.'
  );

  // Log admin activity
  await supabase.from('activities').insert({
    profile_id: farmerId,
    activity_type: 'payment_received', // standard type in schema or activity entry
    title: 'Farmer Account Verified ✅',
    description: `Verification approved by admin ${admin.firstname || admin.email || 'Moderator'}.`,
  });

  revalidatePath('/admin/farmers');
  revalidatePath(`/admin/farmers/${farmerId}`);

  return { success: true };
}

/**
 * Reject a farmer's ID verification request with a reason.
 * Requires super_admin or moderator level.
 */
export async function rejectFarmerVerification(farmerId: string, reason: string) {
  const admin = await getAdminProfile();
  if (
    !admin ||
    (admin.admin_level !== 'super_admin' && admin.admin_level !== 'moderator')
  ) {
    return {
      success: false,
      error: 'Unauthorized: requires moderator or super_admin privileges.',
    };
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    return { success: false, error: 'Rejection reason is required.' };
  }

  const supabase = await createClient();

  // Update profile
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      verified_status: false,
      verification_status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', farmerId);

  if (updateErr) {
    console.error('Error rejecting farmer verification:', updateErr);
    return { success: false, error: updateErr.message };
  }

  // Create notification for farmer with rejection reason
  await createNotification(
    farmerId,
    'verification_rejected',
    'Verification Rejected',
    `Your account verification request was rejected: ${trimmedReason}`
  );

  // Log admin activity
  await supabase.from('activities').insert({
    profile_id: farmerId,
    activity_type: 'payment_received',
    title: 'Farmer Verification Rejected ❌',
    description: `Verification rejected by admin: ${trimmedReason}`,
  });

  revalidatePath('/admin/farmers');
  revalidatePath(`/admin/farmers/${farmerId}`);

  return { success: true };
}
