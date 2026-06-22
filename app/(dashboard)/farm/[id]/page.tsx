// app/(dashboard)/farm/[id]/page.tsx
// NOTE: Original Supabase logic commented out — MVP demo with dummy data

// --- ORIGINAL LOGIC (commented out) ---
// import { createClient } from '@/lib/supabase/server';
// import { redirect } from 'next/navigation';
// export default async function FarmPage({ params }) {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect('/login');
//   const { data: farm } = await supabase.from('farms').select('*').eq('id', params.id).single();
//   const { data: crops } = await supabase.from('crops').select('*').eq('farm_id', params.id);
//   return <FarmClientPage farm={farm} initialCrops={crops} user={user} />;
// }

import FarmDetailClient from "./farm-client-page";

export default function FarmPage({ params }: { params: { id: string } }) {
  return <FarmDetailClient farmId={params.id} />;
}
