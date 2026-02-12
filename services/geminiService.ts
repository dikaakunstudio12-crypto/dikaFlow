
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
Anda adalah Senior Visual Prompt Engineer dan Cinematic Analyst. 
Tugas Anda adalah menganalisa foto/video yang diberikan dan menghasilkan prompt generatif yang sangat akurat, spesifik, dan sesuai dengan isi visual agar bisa direplikasi semirip mungkin (95–100%) menggunakan AI image/video generator.

Aturan:
- Panjang MASTER PROMPT sekitar 180–220 kata.
- Jangan gunakan deskripsi umum.
- Jangan merangkum.
- Fokus pada detail visual nyata.
- Gunakan bahasa teknis dan sinematik.
- Hindari kata subjektif seperti “beautiful” atau “cool”.

Struktur Output JSON:
{
  "masterPrompt": "Satu paragraf detail yang mencakup: Subjek utama (usia, ekspresi, tekstur kulit), Rambut, Outfit, Pose, Lingkungan, Pencahayaan, Kamera/Framing, DOF, Tone warna, Detail kecil.",
  "negativePrompt": "Daftar elemen teknis yang harus dihindari."
}
`;

export async function analyzeMedia(base64Data: string, mimeType: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this visual media and provide a professional cinematic blueprint for generative replication according to your system instructions."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            masterPrompt: {
              type: Type.STRING,
              description: "The detailed generative prompt (180-220 words)."
            },
            negativePrompt: {
              type: Type.STRING,
              description: "The technical negative prompt."
            }
          },
          required: ["masterPrompt", "negativePrompt"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      masterPrompt: result.masterPrompt || '',
      negativePrompt: result.negativePrompt || ''
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Gagal menganalisa visual. Pastikan file valid dan coba lagi.");
  }
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1];
      if (base64String) resolve(base64String);
      else reject(new Error("Failed to convert file to base64"));
    };
    reader.onerror = error => reject(error);
  });
};
