// app/(dashboard)/farm/[id]/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import FarmClientPage from './farm-client-page';

type FarmIdPageProps = {
  params: {
    id: string;
  };
};
export default async function FarmPage({ params }: { params: FarmIdPageProps}) {
  
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
