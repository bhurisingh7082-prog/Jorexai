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
    const { message } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify the following user message into exactly ONE of these intents: "IMAGE", "VIDEO", "FILE", "CODE", or "TEXT". 
      Only return the exact single word, nothing else. 
      "IMAGE" if they explicitly ask to generate/create/draw an image/picture/photo. 
      "VIDEO" if they explicitly ask to generate/make/animate a video. 
      "FILE" if they explicitly ask to create/generate a downloadable file or document. 
      "CODE" if they ask for code generation, code debugging, programming explanation, or software development.
      "TEXT" for chat, questions, writing, or anything else.
      Message: "${message}"`,
      config: {
        systemInstruction: "You are an intent router. Return exactly one word.",
        temperature: 0,
      },
    });
    
    const intent = response.text?.trim().toUpperCase() || "TEXT";
    res.status(200).json({ intent });
  } catch (err: any) {
    console.error("Intent error:", err);
    res.status(500).json({ error: err.message });
  }
}
