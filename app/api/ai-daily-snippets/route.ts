// app/api/ai-daily-snippets/route.ts
import { NextRequest, NextResponse } from 'next/server';

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;
const TEXT_MODEL = 'deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crops = searchParams.get('crops') ?? 'Maize';
  const region = searchParams.get('region') ?? 'Ghana';

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
          {
            role: 'system',
            content:
              'You are an agricultural extension officer in Ghana. Return ONLY a JSON object with one key: { "tip": "your tip here" }. No markdown, no extra text.',
          },
          {
            role: 'user',
            content: `Generate one practical, specific farming tip for today for a Ghanaian farmer growing ${crops} in the ${region} region. Make it actionable, relevant to Ghanaian conditions, and 1–2 sentences maximum.`,
          },
        ],
        max_tokens: 120,
      }),
    });

    if (!response.ok) throw new Error(`HF API error: ${response.status}`);

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content?.trim() ?? '';

    if (!content) throw new Error('Empty response');

    let tip: string;
    try {
      tip = JSON.parse(content).tip;
    } catch {
      // Fallback: regex extract
      const match = content.match(/"tip"\s*:\s*"([^"]+)"/);
      tip = match ? match[1] : content.replace(/[{}"\n]/g, '').trim();
    }

    return NextResponse.json({ tip }, {
      headers: {
        // Allow client to cache for 4 hours
        'Cache-Control': 'public, max-age=14400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[ai-daily-snippets]', error);
    return NextResponse.json({ tip: null }, { status: 500 });
  }
}
