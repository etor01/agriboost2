// // app/(dashboard)/farm/[id]/page.tsx

// import { createClient } from '@/lib/supabase/server';
// import { redirect, notFound } from 'next/navigation';
// import FarmClientPage from './farm-client-page';

// export default async function FarmPage({ params }: { params: Promise<{ id: string }> }) {
//   // ✅ Await params (Next.js 15+ change)
//   const { id } = await params;

//   const supabase = await createClient();

//   // ✅ Get the logged-in user
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect('/login');
//   }

//   // ✅ Fetch the farm for this user
//   const { data: farm, error: farmError } = await supabase
//     .from('farms')
//     .select('*')
//     .eq('id', id)
//     .eq('user_id', user.id)
//     .single();

//   if (farmError || !farm) {
//     notFound();
//   }

//   // ✅ Fetch crops with care tasks for this farm
//   const { data: crops, error: cropsError } = await supabase
//     .from('crops')
//     .select(`
//       *,
//       crop_care_tasks ( * )
//     `)
//     .eq('farm_id', id)
//     .order('planting_date', { ascending: false });

//   if (cropsError) {
//     console.error('Error fetching crops:', cropsError);
//   }

//   // ✅ Render farm client page
//   return <FarmClientPage farm={farm} initialCrops={crops || []} user={user} />;
// }
// app/(dashboard)/farm/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import FarmClientPage from './farm-client-page';

export default async function FarmPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (farmError || !farm) {
    notFound(); 
  }

  const { data: crops, error: cropsError } = await supabase
    .from('crops')
    .select(`
      *,
      crop_care_tasks ( * )
    `)
    .eq('farm_id', params.id)
    .order('planting_date', { ascending: false });
    
  if (cropsError) {
      console.error("Error fetching crops:", cropsError);
  }

  return <FarmClientPage farm={farm} initialCrops={crops || []} user={user} />;
}
