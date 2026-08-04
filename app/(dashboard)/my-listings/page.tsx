// app/(dashboard)/my-listings/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MyListingsClientPage from "./my-listings-client-page";

export const metadata = {
  title: "My Listings | AgriBoost",
  description: "Manage your produce advertisements, update stock and prices, or remove listings.",
};

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading listings:", error);
  }

  return <MyListingsClientPage user={user} initialListings={listings || []} />;
}
