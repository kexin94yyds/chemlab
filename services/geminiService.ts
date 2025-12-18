
import { GoogleGenAI, Type } from "@google/genai";
import { SafetyInfo, Reagent, Standard } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const lookupChemicalProperties = async (query: string): Promise<Reagent | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Look up physical and chemical properties for: ${query}. Provide common name, CAS, molecular weight, density, melting point, boiling point, solubility, and pKa where available.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cas: { type: Type.STRING },
          name: { type: Type.STRING },
          mw: { type: Type.NUMBER },
          density: { type: Type.NUMBER },
          mp: { type: Type.STRING },
          bp: { type: Type.STRING },
          solubility: { type: Type.STRING },
          pKa: { type: Type.STRING }
        },
        required: ["cas", "name", "mw"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
};

export const searchStandards = async (query: string): Promise<Standard[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请检索与 "${query}" 相关的中国国家标准 (GB/T) 或行业标准。
    特别注意：参考食品伙伴网 (foodmate.net) 的标准库分类逻辑，优先提供食品安全、添加剂、污染物限制等相关标准。
    返回 3 个最相关的标准。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            code: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["code", "title", "summary"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getSafetyDetails = async (query: string): Promise<SafetyInfo | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find GHS safety information and MSDS highlights for: ${query}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ghsSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
          hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautions: { type: Type.STRING }
        },
        required: ["name", "ghsSignals", "hazards", "precautions"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
};

export const checkCompatibility = async (reagents: string[]): Promise<string | null> => {
  if (reagents.length < 2) return null;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Check for dangerous chemical incompatibilities between: ${reagents.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          warning: { type: Type.STRING }
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.warning || null;
  } catch (e) {
    return null;
  }
};
