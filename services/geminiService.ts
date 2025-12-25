import { GoogleGenAI, Type, Modality } from "@google/genai";
import { INDIAN_LANGUAGES } from "../constants";
import { Translation } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will not work.");
}

// This instance is for client-side operations
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function translateText(text: string, targetLanguage: string): Promise<string | null> {
    if(!API_KEY) return text; // return original text if no key
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Translate the following text to ${targetLanguage}: "${text}"`,
        });
        return response.text?.trim() || text;
    } catch (error) {
        console.error("Error translating text:", error);
        return text; // return original on error
    }
}

export async function translateLocale(englishLocale: Translation, targetLanguageCode: string): Promise<Translation | null> {
    if (!API_KEY) return null;

    const languageName = INDIAN_LANGUAGES.find(l => l.code === targetLanguageCode)?.name || targetLanguageCode;

    const prompt = `
        Translate all the string values in the following JSON object from English to ${languageName}.
        - IMPORTANT: DO NOT translate the JSON keys.
        - Maintain the exact same JSON structure as the input.
        - Ensure the output is a single, valid JSON object only, with no extra text, explanations, or markdown formatting like \`\`\`json.
        - For strings containing placeholders like "{place}" or "{query}", keep the placeholder exactly as it is in the translated string.
        - For example, if a string is "Places near you for {place}", the translation should be "[Translated text for 'Places near you for'] {place}".

        JSON to translate:
        ${JSON.stringify(englishLocale, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using a more capable model for structured data
            contents: prompt,
        });

        let jsonString = response.text || '';
        
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Could not find a valid JSON object in the response.");
        }

        jsonString = jsonString.substring(startIndex, endIndex + 1);
        
        const translatedObject = JSON.parse(jsonString);
        return translatedObject;
    } catch (error) {
        console.error("Error translating locale with Gemini:", error);
        return null;
    }
}

export async function searchLifeTaskOnline(query: string): Promise<string | null> {
    if (!API_KEY) {
        return "API Key not configured. Online search is disabled.";
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As Saarthi, an Indian life guidance assistant, provide a clear, simple, step-by-step guide for the following user query: "${query}". 
            Structure your response in Markdown format. Use "###" for main headings like "Step-by-Step Guide", "Common Mistakes", and "Official Links". Use asterisks for list items. 
            Keep the language extremely simple and direct. If you provide links, ensure they are relevant to India.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        let text = response.text?.trim() || "Sorry, I couldn't find any information on that topic.";
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter((chunk: any) => chunk.web && chunk.web.uri && chunk.web.title)
            .map((chunk: any) => ({
                title: chunk.web.title,
                uri: chunk.web.uri,
            }));

        if (sources.length > 0) {
            text += '\n\n### Sources\n';
            sources.forEach((source: {title: string, uri: string}) => {
                text += `* [${source.title}](${source.uri})\n`;
            });
        }
        
        return text;
    } catch (error) {
        console.error("Error searching with Gemini:", error);
        return "There was an error while searching. Please try again.";
    }
}

export async function searchSchemeOnline(query: string): Promise<string | null> {
    if (!API_KEY) {
        return "API Key not configured. Online search is disabled.";
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `As Saarthi, an Indian life guidance assistant, provide a clear, simple explanation for the following government scheme query: "${query}". 
            Explain what the scheme is, who is eligible, and what the benefits are.
            Structure your response in Markdown format. Use "###" for main headings like "About the Scheme", "Eligibility", "Benefits", and "Official Links". Use asterisks for list items.
            Keep the language extremely simple and direct. If you provide links, ensure they are relevant to India.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        let text = response.text?.trim() || "Sorry, I couldn't find any information on that topic.";
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter((chunk: any) => chunk.web && chunk.web.uri && chunk.web.title)
            .map((chunk: any) => ({
                title: chunk.web.title,
                uri: chunk.web.uri,
            }));

        if (sources.length > 0) {
            text += '\n\n### Sources\n';
            sources.forEach((source: {title: string, uri: string}) => {
                text += `* [${source.title}](${source.uri})\n`;
            });
        }
        
        return text;
    } catch (error) {
        console.error("Error searching schemes with Gemini:", error);
        return "There was an error while searching. Please try again.";
    }
}


export async function generateSpeech(text: string): Promise<string | null> {
    if (!API_KEY) {
        console.error("API Key not available for TTS service.");
        return null;
    }
    // The API key is required for all browser-based calls.
    const ttsAi = new GoogleGenAI({ apiKey: API_KEY });
    
    try {
        const response = await ttsAi.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;

    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

export async function detectLanguage(text: string): Promise<string> {
    if (!API_KEY) return 'English'; // Default fallback
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Detect the primary language of the following text. Respond with only the language name in English (e.g., "English", "Hindi", "Tamil", "Hinglish"). If it is a mix of Hindi and English, respond with "Hinglish". Text: "${text}"`,
        });
        const detected = response.text?.trim() || 'English';
        return detected.charAt(0).toUpperCase() + detected.slice(1).toLowerCase();
    } catch (error) {
        console.error("Error detecting language:", error);
        return 'English'; // Fallback on error
    }
}