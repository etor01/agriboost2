// app/(dashboard)/ai-center/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
// const HF_API_URL = 'https://router.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
const HF_API_URL = 'https://router.huggingface.co/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!; // Make sure this is in your .env.local and Vercel environment variables

// This is a helper function to create simple recommendations based on the disease name.
// You can expand this with more detailed advice.
const getRecommendations = (diseaseName: string) => {
    const lowerCaseDisease = diseaseName.toLowerCase();
    if (lowerCaseDisease.includes('healthy')) {
        return 'The crop appears healthy. Continue with your regular care schedule. Ensure proper watering and monitor for any changes.';
    }
    if (lowerCaseDisease.includes('rust')) {
        return 'Rust is a fungal disease. \n1. Apply a recommended fungicide. \n2. Remove and destroy infected plant debris after harvest. \n3. Ensure proper plant spacing for air circulation.';
    }
    if (lowerCaseDisease.includes('mosaic virus')) {
        return 'Mosaic Virus has no cure. \n1. Remove and destroy infected plants immediately to prevent spread. \n2. Control aphids, as they are common vectors. \n3. Use virus-free planting materials.';
    }
    return 'Possible disease detected. Consult agricultural best practices for this specific condition. Isolate the plant if possible to prevent spread.';
};

export async function analyzeCropImage(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated.' };
    }

    const file = formData.get('image') as File;
    if (!file) {
        return { success: false, message: 'No image file provided.' };
    }

    try {
        // 1. Call Hugging Face for prediction
        const hfResponse = await fetch(HF_API_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${HF_API_KEY}` },
            body: file,
        });

        if (!hfResponse.ok) {
            throw new Error(`Hugging Face API error: ${hfResponse.statusText}`);
        }
        const predictions = await hfResponse.json();

        if (!Array.isArray(predictions) || predictions.length === 0) {
            return { success: false, message: 'No prediction returned from model.' };
        }
        const topPrediction = predictions[0];

        // 2. Upload the original image to Supabase Storage for record-keeping
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('disease_images')
            .upload(fileName, file);

        if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('disease_images')
            .getPublicUrl(fileName);

        // 3. Save the complete analysis to your database
        const analysisData = {
            is_healthy: topPrediction.label.toLowerCase().includes('healthy'),
            disease_name: topPrediction.label,
            confidence_score: topPrediction.score,
            recommendations: getRecommendations(topPrediction.label),
        };

        const { data: savedAnalysis, error: dbError } = await supabase
            .from('disease_analyses')
            .insert({
                user_id: user.id,
                crop_id: null, // You can add a dropdown in the UI to select a crop
                image_url: publicUrl,
                ...analysisData
            })
            .select()
            .single();

        if (dbError) throw new Error(`Database error: ${dbError.message}`);

        return { success: true, analysis: savedAnalysis };

    } catch (error: any) {
        console.error('Error in analyzeCropImage action:', error);
        return { success: false, message: error.message };
    }
}
