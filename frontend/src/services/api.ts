// src/services/api.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

export const generateActivity = async (keyword: string): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Crea una historia corta para un niño con síndrome de Down usando la palabra "${keyword}". Usa frases simples, positivas y amigables.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyCeyo-_JkJBpDWMpGefs2bMnmLI_GRw2So";

export async function generateGeminiContent(prompt: string): Promise<string> {
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error("Error al consumir la API de Gemini");
  }

  const data = await response.json();

  // Extraemos el texto generado
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No se generó contenido.";
}
