import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UpgradeClientPage from "./upgrade-client-page";

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  return <UpgradeClientPage initialTier={profile?.subscription_tier || "free"} />;
}
