// app/(dashboard)/ai-center/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;
// Exactly the model from doc.txt — has a free inference provider via :novita
const VISION_MODEL = 'google/gemma-4-26B-A4B-it:novita';

/** Convert a browser File to a base64 data URL so it can be embedded in the chat message. */
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

/**
 * System prompt: establishes the Ghanaian agri-expert persona and enforces
 * strict JSON-only output with no surrounding text or markdown.
 */
const SYSTEM_PROMPT = `You are an expert agricultural diagnostician with deep knowledge of crops grown in Ghana, including maize, cassava, cocoa, yam, plantain, tomatoes, peppers, rice, groundnuts, sorghum, and other West African staple and cash crops. You are familiar with local farming conditions, pest pressures, common diseases, seasonal rainfall patterns (major and minor seasons), Harmattan dry periods, and locally available agro-chemical products and remedies found in Ghanaian markets (e.g. Accra, Kumasi, Tamale agro-shops).

When given an image, you MUST:
1. Determine whether the image contains a plant or crop. If it does not, set is_valid_plant to false.
2. If it is a plant: identify the crop, assess its health, name any visible disease or pest damage, and provide actionable healthy farming practices tailored to the Ghanaian context.
3. Reference locally available products, market seasons, or regional considerations where helpful.

CRITICAL: You MUST respond with ONLY a raw JSON object. No markdown, no code fences (\`\`\`), no explanations, no prose — just the JSON object itself starting with { and ending with }.

Use this exact schema:
{
  "is_valid_plant": boolean,
  "is_healthy": boolean | null,
  "crop_name": string | null,
  "disease_name": string | null,
  "confidence": "high" | "medium" | "low" | null,
  "diagnosis": string,
  "healthy_practices": string[]
}

Rules:
- If is_valid_plant is false: set is_healthy, crop_name, disease_name, confidence to null and healthy_practices to []. Use diagnosis to explain no plant was detected.
- If is_healthy is true: disease_name should be null or "None".
- healthy_practices must be an array of 3–6 specific, actionable strings (not generic advice).
- All string values must be in English.`;

export interface DiagnosisResult {
  is_valid_plant: boolean;
  is_healthy: boolean | null;
  crop_name: string | null;
  disease_name: string | null;
  confidence: 'high' | 'medium' | 'low' | null;
  diagnosis: string;
  healthy_practices: string[];
}

export async function analyzeCropImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: 'User not authenticated.' };
  }

  // Check scans remaining from DB (authoritative — not trusting the client)
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_scans_remaining')
    .eq('id', user.id)
    .single();

  if (!profile || profile.ai_scans_remaining <= 0) {
    return {
      success: false,
      message: 'No scans remaining. Please upgrade your plan.',
      outOfScans: true,
    };
  }

  const file = formData.get('image') as File;
  if (!file) {
    return { success: false, message: 'No image file provided.' };
  }

  try {
    // 1. Convert image to base64 data URL for the multimodal message
    const imageDataUrl = await fileToBase64(file);

    // 2. Call HuggingFace chat/completions vision endpoint (doc.txt format)
    const hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this crop image and return only the JSON response as instructed. No extra text.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      throw new Error(`AI model error: ${hfResponse.statusText} — ${errText}`);
    }

    const hfData = await hfResponse.json();
    const rawContent: string = hfData?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No content returned from the AI model.');
    }

    // 3. Parse JSON — with a fallback regex extraction in case the model
    //    adds minor surrounding text despite instructions
    let analysisResult: DiagnosisResult;
    try {
      analysisResult = JSON.parse(rawContent.trim());
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error(
          'The AI response was not valid JSON. Please try again.'
        );
      }
    }

    // 4. Guard: not a valid plant → return early, no storage write, no scan deduction
    if (!analysisResult.is_valid_plant) {
      return {
        success: false,
        invalidPlant: true,
        message:
          analysisResult.diagnosis ||
          'The image does not appear to contain a plant. Please upload a clear photo of a crop or plant.',
      };
    }

    // 5. Upload original image to Supabase Storage for record-keeping
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('disease_images')
      .upload(fileName, file);

    if (uploadError)
      throw new Error(`Image upload error: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from('disease_images').getPublicUrl(fileName);

    // 6. Save the full AI result to crop_diagnostics
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('crop_diagnostics')
      .insert({
        profile_id: user.id,
        crop_id: null,
        image_url: publicUrl,
        ai_result: analysisResult,
        status: 'completed',
      })
      .select()
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // 7. Authoritative DB decrement of ai_scans_remaining
    await supabase
      .from('profiles')
      .update({ ai_scans_remaining: profile.ai_scans_remaining - 1 })
      .eq('id', user.id);

    // 8. Log to activities table
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'scan_performed',
      title: 'AI Crop Scan',
      description: `Scanned ${analysisResult.crop_name ?? 'crop'}: ${
        analysisResult.is_healthy
          ? 'Healthy ✓'
          : analysisResult.disease_name ?? 'Issue detected'
      } (Confidence: ${analysisResult.confidence ?? 'N/A'})`,
    });

    return {
      success: true,
      analysis: savedAnalysis,
      scansRemaining: profile.ai_scans_remaining - 1,
    };
  } catch (error: any) {
    console.error('Error in analyzeCropImage action:', error);
    return { success: false, message: error.message };
  }
}
