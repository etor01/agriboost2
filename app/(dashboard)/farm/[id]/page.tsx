// app/(dashboard)/farm/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import FarmDetailClient from './farm-client-page';

export default async function FarmPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch farm details
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('*')
    .eq('id', params.id)
    .single();

  if (farmError || !farm) {
    notFound();
  }

  // Fetch crops for this farm
  const { data: crops } = await supabase
    .from('crops')
    .select('*')
    .eq('farm_id', params.id);

  const initialCrops = crops ?? [];

  // Fetch tasks for these crops
  const cropIds = initialCrops.map(c => c.id);
  let initialTasks: any[] = [];
  if (cropIds.length > 0) {
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .in('crop_id', cropIds)
      .order('due_date', { ascending: true });
    initialTasks = tasksData ?? [];
  }

  // Fetch activities for the farmer
  const { data: activitiesData } = await supabase
    .from('activities')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);
  const initialActivities = activitiesData ?? [];

  return (
    <FarmDetailClient
      user={user}
      initialFarm={farm}
      initialCrops={initialCrops}
      initialTasks={initialTasks}
      initialActivities={initialActivities}
    />
  );
}
