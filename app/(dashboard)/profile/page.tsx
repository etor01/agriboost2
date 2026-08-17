// app/(dashboard)/profile/page.tsx
import type { Metadata } from "next";
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClientPage from "./profile-client-page";
import { getFarmerAverageRating } from '@/app/marketplace/actions';

export const metadata: Metadata = {
  title: "My Profile | AgriBoost",
  description: "View and manage your AgriBoost farmer profile, farms, listings, and ratings.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch farms
  const { data: farms, error: farmsError } = await supabase
    .from('farms')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (profileError) {
    console.error("Error loading profile:", profileError);
  }
  if (farmsError) {
    console.error("Error loading farms:", farmsError);
  }
  if (listingsError) {
    console.error("Error loading listings:", listingsError);
  }

  // Fetch reviews
  const ratingData = await getFarmerAverageRating(user.id);

  return (
    <ProfileClientPage
      user={user}
      profile={profile}
      initialFarms={farms || []}
      initialListings={listings || []}
      ratingData={ratingData}
    />
  );
}
