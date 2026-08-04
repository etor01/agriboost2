// app/(dashboard)/farm/new/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addFarm(farmData: {
  name: string;
  location: string;
  region: string;
  size_in_acres: number;
  primary_crop: string;
  soil_type: string;
  irrigation_type: string;
  established_date: string;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  // Insert farm
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .insert({
      profile_id: user.id,
      name: farmData.name,
      location: farmData.location,
      region: farmData.region,
      size_in_acres: farmData.size_in_acres,
      primary_crop: farmData.primary_crop,
      soil_type: farmData.soil_type,
      irrigation_type: farmData.irrigation_type,
      established_date: farmData.established_date,
      notes: farmData.notes
    })
    .select()
    .single();

  if (farmError || !farm) {
    console.error('Error creating farm:', farmError);
    return { success: false, message: farmError?.message || 'Error inserting farm.' };
  }

  // Log activity
  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'farm_created',
    title: 'Registered Farm',
    description: `Registered new farm: ${farmData.name} in ${farmData.location}`
  });

  // If a primary crop was specified, let's also automatically create a crop record!
  if (farmData.primary_crop) {
    const { data: crop, error: cropError } = await supabase
      .from('crops')
      .insert({
        farm_id: farm.id,
        crop_type: farmData.primary_crop,
        planting_date: new Date().toISOString().split('T')[0],
        current_growth_stage: 'Seedling',
        maturity_percentage: 0,
        status: 'active'
      })
      .select()
      .single();

    if (!cropError && crop) {
      // Auto-generate some crop tasks as well
      const initialTasks = [
        {
          crop_id: crop.id,
          description: `Initial setup for ${farmData.primary_crop} field`,
          due_date: new Date().toISOString().split('T')[0],
          task_type: 'Other',
          priority: 'medium',
          completed: false
        },
        {
          crop_id: crop.id,
          description: 'Watering & weeding check',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          task_type: 'Irrigation',
          priority: 'medium',
          completed: false
        }
      ];

      await supabase.from('tasks').insert(initialTasks);

      // Log activity for crop creation
      await supabase.from('activities').insert({
        profile_id: user.id,
        activity_type: 'crop_created',
        title: 'Planted New Crop',
        description: `Added ${farmData.primary_crop} automatically with new farm registration`
      });
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  revalidatePath('/farms');
  return { success: true, farmId: farm.id };
}
