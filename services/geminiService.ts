import { GoogleGenAI, Type } from "@google/genai";
import { Dish } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key must be provided via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export const getGeminiRecommendations = async (query: string): Promise<Dish[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Suggest 5 distinct and delicious food dishes based on this craving: "${query}". 
      Make them sound appetizing. Return a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER, description: "Price in USD, between 10 and 30" },
              calories: { type: Type.NUMBER },
              category: { type: Type.STRING, description: "e.g., Italian, Mexican, etc." },
              imageKeyword: { type: Type.STRING, description: "A single keyword to search for an image, e.g., 'pizza', 'burger'" }
            },
            required: ["name", "description", "price", "category", "imageKeyword"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawData = JSON.parse(jsonText);
    
    // Transform into our Dish type with picsum images
    return rawData.map((item: any, index: number) => ({
      id: `gemini-${Date.now()}-${index}`,
      name: item.name,
      description: item.description,
      price: item.price,
      calories: item.calories || 500,
      rating: 4.8,
      category: item.category,
      // Using a deterministic random image based on index/keyword for demo purposes
      image: `https://picsum.photos/seed/${item.imageKeyword}${index}/400/300`
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
