"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upgradeToPremium() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const now = new Date();
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const endDate = oneYearFromNow.toISOString();

  // Ensure subscription record exists
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        profile_id: user.id,
        plan: "premium",
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: endDate,
      },
      { onConflict: "profile_id" }
    );

  if (subError) {
    return { success: false, error: "Failed to create subscription record." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "premium",
      subscription_end_date: endDate,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: "Failed to update profile." };
  }

  revalidatePath("/upgrade");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}

export async function cancelSubscription() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Set profile subscription_tier back to 'free' and clear subscription_end_date
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_end_date: null,
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: "Failed to cancel subscription." };
  }

  // Update subscription record status
  await supabase
    .from("subscriptions")
    .update({ status: "cancelled" })
    .eq("profile_id", user.id);

  // Log activity: "Subscription Cancelled"
  await supabase.from("activities").insert({
    profile_id: user.id,
    activity_type: "subscription_cancelled",
    title: "Subscription Cancelled",
    description: "Premium subscription cancelled.",
  });

  revalidatePath("/upgrade");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return { success: true };
}
