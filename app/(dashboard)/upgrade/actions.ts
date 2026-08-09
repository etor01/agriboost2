"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function upgradeToPremium() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Ensure subscription record exists
  const { error: subError } = await supabase
    .from("subscriptions")
    .upsert({
      profile_id: user.id,
      plan: "premium",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    }, { onConflict: "profile_id" });

  if (subError) {
    return { success: false, error: "Failed to create subscription record." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ subscription_tier: "premium" })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: "Failed to update profile." };
  }

  revalidatePath("/upgrade");
  revalidatePath("/dashboard");
  revalidatePath("/layout");

  return { success: true };
}
