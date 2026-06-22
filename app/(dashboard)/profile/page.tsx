// app/(dashboard)/profile/page.tsx
// NOTE: Original Supabase logic commented out — replaced with MVP demo (dummy data, no DB calls)

// --- ORIGINAL SERVER LOGIC (commented out for MVP demo) ---
// import { createClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// export default async function ProfilePage() {
//   const supabase = await createClient();
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session) redirect('/login');
//   const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
//   const { data: farms, error: farmsError } = await supabase.from('farms').select('*').eq('user_id', session.user.id);
//   if (profileError || farmsError) return <div>Error loading profile. Please try again later.</div>;
//   return <ProfileClientPage user={session.user} profile={profile} farms={farms || []} />;
// }

import ProfileClientPage from "./profile-client-page";

export default function ProfilePage() {
  return <ProfileClientPage />;
}
