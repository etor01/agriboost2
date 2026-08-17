// app/(dashboard)/finances/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FinancesClientPage from "./FinancesClientPage";

export const metadata = {
  title: "Finances & Wallet | AgriBoost",
  description: "Track your escrow earnings, load your wallet, and manage payouts.",
};

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, txRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("wallet_balance, available_balance, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("transactions")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const txList = txRes.data || [];

  return (
    <FinancesClientPage
      userEmail={user.email || ""}
      initialWalletBalance={Number(profile?.wallet_balance ?? 0)}
      initialAvailableBalance={Number(profile?.available_balance ?? 0)}
      initialRole={profile?.role || "buyer"}
      initialTransactions={txList}
    />
  );
}
