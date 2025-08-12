// app/(dashboard)/ai-center/actions.ts
'use server';

const HF_API_URL =
  'https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!; // Add this to your .env.local

// Function to call Hugging Face model
export async function analyzeCropImage(file: File) {
  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
      },
      body: file, // Send the actual file
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Hugging Face returns an array of predictions; we take the top one
    if (!Array.isArray(result) || result.length === 0) {
      return {
        success: false,
        message: 'No prediction returned from model.',
      };
    }

    const topPrediction = result[0];
    return {
      success: true,
      analysis: {
        is_healthy: topPrediction.label.toLowerCase().includes('healthy'),
        disease_name: topPrediction.label,
        confidence_score: topPrediction.score,
        recommendations: topPrediction.label.toLowerCase().includes('healthy')
          ? 'The crop appears healthy. Continue with your regular care schedule.'
          : 'Possible disease detected. Consult agricultural best practices for treatment.',
      },
    };
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return { success: false, message: error.message };
  }
}
