// app/(dashboard)/ai-center/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- Simulated AI Analysis Function ---
const runSimulatedAIAnalysis = (imageUrl: string) => {
  // Simulate different outcomes based on the image URL for variety
  if (imageUrl.includes('healthy')) {
    return {
      is_healthy: true,
      disease_name: 'Healthy',
      confidence_score: 0.98,
      recommendations:
        'The crop appears healthy. Continue with your regular care schedule. Ensure proper watering and monitor for any changes.',
    };
  } else {
    return {
      is_healthy: false,
      disease_name: 'Maize Common Rust',
      confidence_score: 0.92,
      recommendations:
        'Maize Common Rust is a fungal disease. \n1. Apply a recommended fungicide. \n2. Remove and destroy infected plant debris after harvest. \n3. Consider planting rust-resistant hybrids in the future.',
    };
  }
};

export async function analyzeCropImage(imageUrl: string, cropId: number | null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  // Decrement the scan count using an RPC call for atomicity
  const { error: rpcError } = await supabase.rpc('decrement_scans', { user_id: user.id });
  if (rpcError) {
    return { success: false, message: 'Could not update scan count.' };
  }

  // Run the AI simulation
  const analysisResult = runSimulatedAIAnalysis(imageUrl);

  // Save the analysis to the database
  const { data, error } = await supabase
    .from('disease_analyses')
    .insert({
      user_id: user.id,
      crop_id: cropId, // This can be null if not associated with a specific crop
      image_url: imageUrl,
      ...analysisResult,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    return { success: false, message: error.message };
  }

  // Optionally revalidate a path if needed (kept from A)
  // revalidatePath('/app/(dashboard)/ai-center');

  return { success: true, analysis: data };
}
