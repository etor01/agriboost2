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

  const [{ data: farms, error }, { data: profile }] = await Promise.all([
    supabase
      .from("farms")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("firstname, lastname, phone, region, avatar_url, verification_status")
      .eq("id", user.id)
      .single(),
  ]);

  if (error) {
    console.error("Error loading farms:", error);
  }

  // Resolve name using same logic as profile-client-page.tsx
  const firstName = (profile as any)?.firstname ?? "";
  const lastName = (profile as any)?.lastname ?? "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    user.email ||
    "";

  return (
    <FarmsClientPage
      user={user}
      initialFarms={farms || []}
      profile={{
        full_name: fullName,
        email: user.email ?? "",
        phone: (profile as any)?.phone ?? "",
        region: (profile as any)?.region ?? "",
        avatar_url: (profile as any)?.avatar_url ?? null,
        member_since: user.created_at ?? null,
      }}
    />
  );
}
