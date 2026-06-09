import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { Readable } from 'stream';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = getAI();
    const operationName = req.query.op as string;
    if (!operationName) throw new Error("Missing operationName");
    
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!uri) {
      return res.status(404).json({ error: "Video URI not found" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey || '' },
    });
    
    res.setHeader('Content-Type', 'video/mp4');
    
    if (videoRes.body) {
      // Create a node Readable stream from the web ReadableStream
      // Standard Node approach for Vercel functions
      const reader = videoRes.body.getReader();
      const stream = new Readable({
        async read() {
          const { done, value } = await reader.read();
          if (done) {
            this.push(null);
          } else {
            this.push(Buffer.from(value));
          }
        }
      });
      stream.pipe(res);
    } else {
      res.status(500).json({ error: "Failed to download video stream" });
    }
  } catch (err: any) {
    console.error("Video download error:", err);
    res.status(500).json({ error: err.message });
  }
}
