// app/(dashboard)/farms/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FarmsClientPage from "./farms-client-page";

export const metadata = {
  title: "My Farms | AgriBoost",
  description: "Manage your registered agricultural farms, crops, and acreage.",
};

export default async function FarmsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: farms, error } = await supabase
    .from("farms")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading farms:", error);
  }

  return <FarmsClientPage user={user} initialFarms={farms || []} />;
}
