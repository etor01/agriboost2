// app/(dashboard)/profile/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClientPage from './profile-client-page'; // We will create this component next

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;

  // Fetch the user's profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch the user's farms data
  const { data: farms, error: farmsError } = await supabase
    .from('farms')
    .select('*')
    .eq('user_id', user.id);

  if (profileError || farmsError) {
    console.error("Error fetching profile data:", profileError || farmsError);
    return <div>Error loading profile. Please try again later.</div>;
  }

  return <ProfileClientPage user={user} profile={profile} farms={farms || []} />;
}
