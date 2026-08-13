// app/admin/farmers/page.tsx
import { createClient } from "@/lib/supabase/server";
import FarmersTableClient, { FarmerProfile } from "./FarmersTableClient";

export default async function FarmerManagementPage() {
  const supabase = await createClient();

  const { data: farmers, error } = await supabase
    .from("profiles")
    .select(
      "id, firstname, lastname, phone, email, verification_status, verified_status, verification_doc_url, id_card_url, avatar_url, subscription_tier, created_at"
    )
    .eq("role", "farmer")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching farmers:", error);
  }

  return <FarmersTableClient initialFarmers={(farmers as FarmerProfile[]) ?? []} />;
}
