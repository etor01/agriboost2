// app/(dashboard)/farm/[id]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CropGrowthPlan } from '@/lib/database.types';

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;
// Text/reasoning model from doc2.txt — no vision needed for plan generation
const TEXT_MODEL = 'deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai';

// ── System prompt ─────────────────────────────────────────────────────────────
const CROP_PLAN_SYSTEM_PROMPT = `You are an experienced agricultural extension officer in Ghana with 20 years of field experience. You have deep knowledge of West African farming conditions, Ghanaian crop varieties (Pioneer, SEEDCO, local varieties), seasonal rainfall patterns (major season: March–July, minor season: September–November), Harmattan dry-season risks, and locally available agro-inputs (fertilizers, pesticides, fungicides) sold in Ghanaian markets in Accra, Kumasi, Tamale, and Ho.

Generate a complete, week-by-week farming care plan for the crop specified.

CRITICAL INSTRUCTION: Return ONLY a raw JSON object. Do NOT include markdown, code fences (\`\`\`), or any text outside the JSON. Your response MUST begin with { and end with }.

Use this exact schema — every field is required:
{
  "crop_name": "string",
  "variety_suggestion": "string or null",
  "region": "string",
  "planting_date": "YYYY-MM-DD",
  "expected_harvest_date": "YYYY-MM-DD",
  "total_growing_days": number,
  "total_weeks": number,
  "growth_stages": [
    { "stage": "string", "start_week": number, "end_week": number }
  ],
  "weeks": [
    {
      "week_number": number,
      "week_start_date": "YYYY-MM-DD",
      "week_end_date": "YYYY-MM-DD",
      "growth_stage": "string",
      "stage_description": "string describing what the plant is doing biologically",
      "tasks": [
        {
          "task": "string — specific actionable task",
          "category": "watering | fertilizer | weeding | pest_control | disease_prevention | observation | harvest",
          "priority": "low | medium | high",
          "notes": "string with Ghana-specific context (e.g. product name, market source) or null"
        }
      ],
      "risks": ["string — specific risk to watch for this week"],
      "watering_frequency": "string e.g. Every 2 days or Rain-fed only",
      "expected_appearance": "string — what the crop should look like this week"
    }
  ],
  "harvest_indicators": ["string — visual/physical signs the crop is ready"],
  "post_harvest_tips": ["string — storage, processing, market timing advice for Ghana"],
  "estimated_yield_per_acre": "string e.g. 1.5–2 tonnes/acre",
  "risks_summary": ["string — season-level risks specific to Ghana"]
}`;

// ── AI Plan Generator ─────────────────────────────────────────────────────────
async function generateAICropPlan(
  cropType: string,
  plantingDate: string,
  region: string
): Promise<CropGrowthPlan | null> {
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: 'system', content: CROP_PLAN_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Crop: ${cropType}\nPlanting Date: ${plantingDate}\nRegion: ${region}, Ghana\n\nGenerate the complete week-by-week care plan JSON for this crop now.`,
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      console.error('[generateAICropPlan] HF API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? '';

    if (!rawContent) return null;

    // Primary JSON parse
    try {
      return JSON.parse(rawContent.trim()) as CropGrowthPlan;
    } catch {
      // Fallback: extract the first {...} block in case of surrounding text
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as CropGrowthPlan;
      console.error('[generateAICropPlan] Could not extract JSON from response');
      return null;
    }
  } catch (err) {
    console.error('[generateAICropPlan] Unexpected error:', err);
    return null;
  }
}

// ── Lightweight simulated tasks (fallback for the tickable tasks table) ───────
const generateFallbackTasks = (cropType: string, plantingDate: string) => {
  const offset = (days: number) => {
    const d = new Date(plantingDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const lower = cropType.toLowerCase();
  if (lower.includes('maize')) {
    return [
      { description: 'Initial watering — ensure soil moisture for germination', due_date: offset(1), task_type: 'Irrigation', priority: 'high' },
      { description: 'Apply starter fertilizer (NPK 15-15-15) to boost root growth', due_date: offset(14), task_type: 'Fertilizer', priority: 'medium' },
      { description: 'First weeding — clear around maize shoots', due_date: offset(28), task_type: 'Weeding', priority: 'high' },
      { description: 'Top-dress with Urea for vegetative boost', due_date: offset(42), task_type: 'Fertilizer', priority: 'medium' },
    ];
  }
  if (lower.includes('tomato')) {
    return [
      { description: 'Transplanting check & light watering', due_date: offset(1), task_type: 'Irrigation', priority: 'high' },
      { description: 'Apply NPK fertilizer & support staking', due_date: offset(10), task_type: 'Fertilizer', priority: 'high' },
      { description: 'Prune suckers and weed control', due_date: offset(21), task_type: 'Weeding', priority: 'medium' },
      { description: 'Fungicide spray to prevent early blight', due_date: offset(30), task_type: 'Pest Control', priority: 'high' },
    ];
  }
  if (lower.includes('cassava')) {
    return [
      { description: 'Sprouting check and gap filling', due_date: offset(7), task_type: 'Other', priority: 'low' },
      { description: 'First weeding — keep ridges clean', due_date: offset(30), task_type: 'Weeding', priority: 'medium' },
      { description: 'Check for mosaic virus symptoms', due_date: offset(60), task_type: 'Pest Control', priority: 'medium' },
    ];
  }
  return [
    { description: `General crop check-up for ${cropType}`, due_date: offset(7), task_type: 'Other', priority: 'medium' },
    { description: 'Watering & weed inspection', due_date: offset(14), task_type: 'Irrigation', priority: 'medium' },
  ];
};

// ── 1. addCrop — insert crop + generate AI plan + fallback tasks ──────────────
export async function addCrop(
  farmId: string,
  cropData: {
    crop_type: string;
    planting_date: string;
    estimated_harvest_date: string | null;
    area: number;
    current_growth_stage: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  // Verify farm belongs to farmer + fetch region for AI prompt
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('name, profile_id, region, location')
    .eq('id', farmId)
    .single();

  if (farmError || !farm || farm.profile_id !== user.id) {
    return { success: false, message: 'Invalid farm or permission denied.' };
  }

  // Insert the crop record first
  const { data: crop, error: cropError } = await supabase
    .from('crops')
    .insert({
      farm_id: farmId,
      crop_type: cropData.crop_type,
      planting_date: cropData.planting_date,
      estimated_harvest_date: cropData.estimated_harvest_date,
      area: cropData.area,
      current_growth_stage: cropData.current_growth_stage,
      maturity_percentage: 0,
      status: 'active',
    })
    .select()
    .single();

  if (cropError || !crop) {
    console.error('Error inserting crop:', cropError);
    return { success: false, message: cropError?.message ?? 'Error inserting crop.' };
  }

  // Generate AI plan (runs in parallel-ish — crop is already saved)
  const region = farm.region ?? farm.location ?? 'Ghana';
  const plan = await generateAICropPlan(cropData.crop_type, cropData.planting_date, region);

  if (plan) {
    // Update crop with plan + AI-computed harvest date
    await supabase
      .from('crops')
      .update({
        ai_growth_data: plan,
        estimated_harvest_date: plan.expected_harvest_date ?? cropData.estimated_harvest_date,
      })
      .eq('id', crop.id);
  }

  // Insert fallback tickable tasks (always, regardless of plan outcome)
  const careTasks = generateFallbackTasks(cropData.crop_type, cropData.planting_date).map(t => ({
    crop_id: crop.id,
    description: t.description,
    due_date: t.due_date,
    task_type: t.task_type,
    priority: t.priority,
    completed: false,
  }));
  await supabase.from('tasks').insert(careTasks);

  // Activity log
  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'crop_created',
    title: 'Planted New Crop',
    description: `Added ${cropData.crop_type} (${cropData.area} acres) to ${farm.name}${plan ? ' — AI care plan generated ✓' : ' — AI plan pending'}`,
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true, crop, planGenerated: !!plan };
}

// ── 2. regenerateCropPlan — retry AI plan for a crop that failed/lacks one ───
export async function regenerateCropPlan(cropId: string, farmId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated.' };

  // Fetch crop
  const { data: crop } = await supabase
    .from('crops')
    .select('crop_type, planting_date, farm_id')
    .eq('id', cropId)
    .single();

  if (!crop) return { success: false, message: 'Crop not found.' };

  // Fetch farm for region
  const { data: farm } = await supabase
    .from('farms')
    .select('region, location, profile_id')
    .eq('id', farmId)
    .single();

  if (!farm || farm.profile_id !== user.id) {
    return { success: false, message: 'Farm not found or permission denied.' };
  }

  const region = farm.region ?? farm.location ?? 'Ghana';
  const plan = await generateAICropPlan(crop.crop_type, crop.planting_date ?? new Date().toISOString().split('T')[0], region);

  if (!plan) {
    return { success: false, message: 'AI plan generation failed. Please check your connection and try again.' };
  }

  const { error } = await supabase
    .from('crops')
    .update({
      ai_growth_data: plan,
      estimated_harvest_date: plan.expected_harvest_date,
    })
    .eq('id', cropId);

  if (error) return { success: false, message: error.message };

  revalidatePath(`/farm/${farmId}`);
  return { success: true };
}

// ── 3. toggleTask ─────────────────────────────────────────────────────────────
export async function toggleTask(
  farmId: string,
  taskId: string,
  completed: boolean,
  taskDescription: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase.from('tasks').update({ completed }).eq('id', taskId);
  if (error) {
    console.error('Error updating task:', error);
    return { success: false, message: error.message };
  }

  if (completed) {
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'task_completed',
      title: 'Task Completed',
      description: `Completed: ${taskDescription}`,
    });
  }

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ── 4. deleteCrop ─────────────────────────────────────────────────────────────
export async function deleteCrop(farmId: string, cropId: string, cropType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase.from('crops').delete().eq('id', cropId);
  if (error) {
    console.error('Error deleting crop:', error);
    return { success: false, message: error.message };
  }

  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'crop_deleted',
    title: 'Crop Removed',
    description: `Removed ${cropType} from farm`,
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ── 5. AI Task Completions ───────────────────────────────────────────────────
export async function getTaskCompletions(cropId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('crop_task_completions')
    .select('*')
    .eq('crop_id', cropId);
  return data || [];
}

export async function toggleAiTask(
  farmId: string,
  cropId: string,
  weekNumber: number,
  taskIndex: number,
  taskKey: string,
  completed: boolean,
  taskDescription: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase
    .from('crop_task_completions')
    .upsert(
      {
        crop_id: cropId,
        week_number: weekNumber,
        task_index: taskIndex,
        task_key: taskKey,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: completed ? user.id : null,
      },
      { onConflict: 'crop_id, week_number, task_index' }
    );

  if (error) {
    console.error('Error toggling AI task:', error);
    return { success: false, message: error.message };
  }

  if (completed) {
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'task_completed',
      title: 'AI Task Completed',
      description: `Completed: ${taskDescription}`,
    });
  }

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  return { success: true };
}

// ── 6. updateFarm ────────────────────────────────────────────────────────────
export async function updateFarm(
  farmId: string,
  updates: {
    name?: string;
    location?: string;
    size_in_acres?: number;
    primary_crop?: string;
    soil_type?: string;
    irrigation_type?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', farmId)
    .eq('profile_id', user.id);

  if (error) {
    console.error('Error updating farm:', error);
    return { success: false, message: error.message };
  }

  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'farm_updated',
    title: 'Farm Updated',
    description: `Updated details for farm: ${updates.name || 'farm'}`,
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/farms');
  revalidatePath('/dashboard');
  return { success: true };
}

// ── 7. updateCrop ────────────────────────────────────────────────────────────
export async function updateCrop(
  farmId: string,
  cropId: string,
  updates: {
    crop_type?: string;
    planting_date?: string;
    estimated_harvest_date?: string | null;
    area?: number;
    current_growth_stage?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase
    .from('crops')
    .update(updates)
    .eq('id', cropId);

  if (error) {
    console.error('Error updating crop:', error);
    return { success: false, message: error.message };
  }

  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'crop_updated',
    title: 'Crop Updated',
    description: `Updated crop details for ${updates.crop_type || 'crop'}`,
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

// ── 8. markCropHarvested ─────────────────────────────────────────────────────
export async function markCropHarvested(farmId: string, cropId: string, cropType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'User not authenticated.' };

  const { error } = await supabase
    .from('crops')
    .update({
      current_growth_stage: 'Harvested',
    })
    .eq('id', cropId);

  if (error) {
    console.error('Error marking crop harvested:', error);
    return { success: false, message: error.message };
  }

  await supabase.from('activities').insert({
    profile_id: user.id,
    activity_type: 'harvest_completed',
    title: 'Crop Harvested 🌾',
    description: `Successfully harvested ${cropType}. Consider listing it on the marketplace!`,
  });

  revalidatePath(`/farm/${farmId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

