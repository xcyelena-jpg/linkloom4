import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestionResponse } from "../types";

// Fix for TypeScript build error "Cannot find name 'process'"
declare const process: any;

// Safety check: Don't crash if key is missing
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeContent = async (
  title: string,
  description: string,
  url: string
): Promise<AISuggestionResponse> => {
  // If no API Key or no AI instance, return basic fallback immediately
  if (!ai) {
    console.warn("Gemini API Key is missing. Returning fallback data.");
    return {
      tags: ["Uncategorized"],
      summary: "AI analysis unavailable (Missing API Key).",
      suggestedTitle: title,
      suggestedFolder: "General"
    };
  }

  try {
    const prompt = `
      I have a piece of content I want to save. 
      URL: ${url}
      Title: ${title}
      Description/Notes: ${description}

      Please analyze this information and provide:
      1. A list of 3-5 relevant short tags (max 10 chars each).
      2. A one-sentence summary (max 20 words).
      3. A clean, short title.
      4. A generic "Folder" category name (e.g., "Inspiration", "Education", "Entertainment", "News", "Shopping").
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of relevant tags",
            },
            summary: {
              type: Type.STRING,
              description: "A concise summary of the content",
            },
            suggestedTitle: {
              type: Type.STRING,
              description: "A cleaned up title",
            },
            suggestedFolder: {
              type: Type.STRING,
              description: "A broad category folder name",
            },
          },
          required: ["tags", "summary", "suggestedFolder"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AISuggestionResponse;
    }
    
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Error analyzing content:", error);
    // Fallback if AI fails
    return {
      tags: ["Uncategorized"],
      summary: "Could not generate summary.",
      suggestedTitle: title,
      suggestedFolder: "General"
    };
  }
};
