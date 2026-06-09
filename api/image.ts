import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "missing-key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getAI();
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }
    const { prompt } = body;
    
    // Configure Vercel specific settings for longer execution if using pro, but
    // we'll leave it as standard here. Max duration can be set in vercel.json.
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1",
      }
    });

    const base64EncodeString = response.generatedImages[0].image.imageBytes;
    if (!base64EncodeString) throw new Error("No image generated");
    
    const imageUrl = `data:image/jpeg;base64,${base64EncodeString}`;
    res.status(200).json({ imageUrl });
  } catch (err: any) {
    console.error("Image error:", err);
    res.status(500).json({ error: err.message });
  }
}
