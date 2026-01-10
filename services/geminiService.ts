
import { GoogleGenAI, Type } from "@google/genai";
import { SafetyInfo, Reagent, Standard, SafetySummary } from "../types";

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
    contents: `Find GHS safety information and MSDS highlights for: ${query}. 
    Please also provide details on:
    1. Environmental impact (how to dispose safely, potential pollution).
    2. Personnel safety (PPE required, health risks).
    3. Equipment safety (compatibility with glass/metal, storage conditions).
    Return results in Chinese.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          ghsSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
          hazards: { type: Type.ARRAY, items: { type: Type.STRING } },
          precautions: { type: Type.STRING },
          environmentalImpact: { type: Type.STRING },
          personnelSafety: { type: Type.STRING },
          equipmentSafety: { type: Type.STRING }
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

export const checkCompatibility = async (reagents: string[]): Promise<{ warning: string | null; summary?: SafetySummary } | null> => {
  if (reagents.length < 2) return null;
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `请对以下试剂进行深度安全评估：${reagents.join(', ')}。
    
    1. 检查它们之间是否存在危险的化学禁忌（混合风险）。如果有，请在 "warning" 字段中用中文进行预警。
    2. 生成一份详尽的 "试剂安全评估总结报告" (Safety Assessment Summary Report)，必须严格包含以下三个部分，且全部使用中文：
       - 环境污染与处置 (Environmental Impact)：说明对环境的潜在威胁及实验室端的专业处置建议。
       - 人员防护 (Personnel Safety)：说明必须佩戴的防护装备 (PPE) 及对人员健康的具体危害与急救建议。
       - 仪器设备注意事项 (Equipment Safety)：说明试剂对玻璃、金属等实验仪器的腐蚀性、存储禁忌及操作细节。
    
    请确保内容专业、准确，基于标准的实验室安全协议，严禁产生幻觉。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          warning: { type: Type.STRING },
          summary: {
            type: Type.OBJECT,
            properties: {
              environmental: { type: Type.STRING },
              personnel: { type: Type.STRING },
              equipment: { type: Type.STRING }
            },
            required: ["environmental", "personnel", "equipment"]
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
};
