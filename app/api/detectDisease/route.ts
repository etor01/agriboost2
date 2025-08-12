import { NextResponse } from "next/server";

interface HuggingFacePrediction {
  label: string;
  score: number;
}

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: imageBase64 }),
      }
    );

    const predictions: HuggingFacePrediction[] = await hfResponse.json();

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return NextResponse.json({ error: "No predictions returned" }, { status: 500 });
    }

    const topPrediction = predictions.sort((a, b) => b.score - a.score)[0];
    return NextResponse.json(topPrediction);

  } catch (error) {
    console.error("Detection Error:", error);
    return NextResponse.json({ error: "Error detecting disease" }, { status: 500 });
  }
}
