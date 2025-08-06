// app/(dashboard)/farm/[id]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This is a simulated AI function to generate a care plan.
const generateSimulatedCarePlan = (cropType: string, plantingDate: string) => {
    const tasks = [];
    
    // Helper to create dates relative to the planting date
    const getFutureDate = (daysToAdd: number) => {
        const date = new Date(plantingDate);
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    };

    if (cropType.toLowerCase().includes('maize')) {
        tasks.push({ 
            task_name: 'Initial Watering',
            due_date: getFutureDate(1),
            description: 'Ensure the soil is thoroughly moist after planting.'
        });
        tasks.push({ 
            task_name: 'Apply Starter Fertilizer (NPK 15-15-15)',
            due_date: getFutureDate(14),
            description: 'Apply a balanced NPK fertilizer to encourage early growth.'
        });
        tasks.push({ 
            task_name: 'First Weeding',
            due_date: getFutureDate(28),
            description: 'Remove weeds to reduce competition for nutrients.'
        });
        tasks.push({ 
            task_name: 'Top Dress with Urea',
            due_date: getFutureDate(42),
            description: 'Apply Urea to boost vegetative growth.'
        });
    } else {
        tasks.push({
            task_name: 'General Check-up',
            due_date: getFutureDate(7),
            description: 'Perform a general check on the new crop for any issues.'
        });
    }

    return tasks;
};

export async function generateCropCarePlan(crop: { id: number, user_id: string, crop_type: string, planting_date: string }) {
    const supabase = createClient();
    
    const tasksToInsert = generateSimulatedCarePlan(crop.crop_type, crop.planting_date)
        .map(task => ({
            ...task,
            crop_id: crop.id,
            user_id: crop.user_id,
        }));

    if (tasksToInsert.length === 0) return { success: true };

    const { error } = await supabase
        .from('crop_care_tasks')
        .insert(tasksToInsert);

    if (error) {
        console.error('Error generating care plan:', error);
        return { success: false, message: error.message };
    }

    revalidatePath(`/farm/${crop.id}`);
    return { success: true, message: 'Care plan generated successfully.' };
}
