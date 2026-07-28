// app/(dashboard)/farm/[id]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to generate a care plan template based on crop type
const generateSimulatedCarePlan = (cropType: string, plantingDate: string) => {
  const tasks = [];
  
  const getFutureDate = (daysToAdd: number) => {
    const date = new Date(plantingDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  const lowerType = cropType.toLowerCase();
  if (lowerType.includes('maize')) {
    tasks.push({ 
      description: 'Initial Watering – Ensure soil is moist for germination',
      due_date: getFutureDate(1),
      task_type: 'Irrigation',
      priority: 'high'
    });
    tasks.push({ 
      description: 'Apply Starter Fertilizer (NPK 15-15-15) to boost root growth',
      due_date: getFutureDate(14),
      task_type: 'Fertilizer',
      priority: 'medium'
    });
    tasks.push({ 
      description: 'First Weeding – Clean around maize shoots',
      due_date: getFutureDate(28),
      task_type: 'Weeding',
      priority: 'high'
    });
    tasks.push({ 
      description: 'Top Dress with Urea for vegetative boost',
      due_date: getFutureDate(42),
      task_type: 'Fertilizer',
      priority: 'medium'
    });
  } else if (lowerType.includes('tomato')) {
    tasks.push({ 
      description: 'Transplanting check & light watering',
      due_date: getFutureDate(1),
      task_type: 'Irrigation',
      priority: 'high'
    });
    tasks.push({ 
      description: 'Apply NPK Fertilizer & support staking',
      due_date: getFutureDate(10),
      task_type: 'Fertilizer',
      priority: 'high'
    });
    tasks.push({ 
      description: 'Pruning suckers and weed control',
      due_date: getFutureDate(21),
      task_type: 'Weeding',
      priority: 'medium'
    });
    tasks.push({ 
      description: 'Fungicide spraying to prevent early blight',
      due_date: getFutureDate(30),
      task_type: 'Pest Control',
      priority: 'high'
    });
  } else if (lowerType.includes('cassava')) {
    tasks.push({ 
      description: 'Sprouting check and gap filling',
      due_date: getFutureDate(7),
      task_type: 'Other',
      priority: 'low'
    });
    tasks.push({ 
      description: 'First weeding – keep ridges clean',
      due_date: getFutureDate(30),
      task_type: 'Weeding',
      priority: 'medium'
    });
    tasks.push({ 
      description: 'Check for mosaic virus symptoms',
      due_date: getFutureDate(60),
      task_type: 'Pest Control',
      priority: 'medium'
    });
  } else {
    tasks.push({
      description: `Perform general crop check-up for ${cropType}`,
      due_date: getFutureDate(7),
      task_type: 'Other',
      priority: 'medium'
    });
    tasks.push({
      description: `Watering & weed inspection`,
      due_date: getFutureDate(14),
      task_type: 'Irrigation',
      priority: 'medium'
    });
  }

  return tasks;
};

// 1. Action to add a new crop and auto-generate its care tasks
export async function addCrop(farmId: string, cropData: {
  crop_type: string;
  planting_date: string;
  estimated_harvest_date: string | null;
  area: number;
  current_growth_stage: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  // Verify farm belongs to farmer
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('name, profile_id')
    .eq('id', farmId)
    .single();

  if (farmError || !farm || farm.profile_id !== user.id) {
    return { success: false, message: 'Invalid farm or permission denied.' };
  }

  // Insert the crop
  const { data: crop, error: cropError } = await supabase
    .from('crops')
    .insert({
      farm_id: farmId,
      crop_type: cropData.crop_type,
      planting_date: cropData.planting_date,
      estimated_harvest_date: cropData.estimated_harvest_date,
      current_growth_stage: cropData.current_growth_stage,
      maturity_percentage: 0,
      status: 'active'
    })
    .select()
    .single();

  if (cropError || !crop) {
    console.error('Error inserting crop:', cropError);
    return { success: false, message: cropError?.message || 'Error inserting crop.' };
  }

  // Generate and insert care tasks
  const careTasks = generateSimulatedCarePlan(cropData.crop_type, cropData.planting_date).map(task => ({
    crop_id: crop.id,
    description: task.description,
    due_date: task.due_date,
    task_type: task.task_type,
    priority: task.priority,
    completed: false
  }));

  const { error: tasksError } = await supabase
    .from('tasks')
    .insert(careTasks);

  if (tasksError) {
    console.error('Error inserting tasks:', tasksError);
  }

  // Log activity
  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'crop_created',
    title: 'Planted New Crop',
    description: `Added ${cropData.crop_type} (${cropData.area} acres) to ${farm.name}`
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true, crop };
}

// 2. Action to toggle task completion status
export async function toggleTask(farmId: string, taskId: string, completed: boolean, taskDescription: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', error);
    return { success: false, message: error.message };
  }

  // Log activity
  if (completed) {
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'task_completed',
      title: 'Task Completed',
      description: `Completed task: ${taskDescription}`
    });
  }

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// 3. Action to delete a crop
export async function deleteCrop(farmId: string, cropId: string, cropType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  const { error } = await supabase
    .from('crops')
    .delete()
    .eq('id', cropId);

  if (error) {
    console.error('Error deleting crop:', error);
    return { success: false, message: error.message };
  }

  // Log activity
  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'crop_deleted',
    title: 'Crop Removed',
    description: `Removed crop ${cropType} from farm`
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}
