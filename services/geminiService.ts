import { GoogleGenAI, Type } from "@google/genai";
import { RefinementQuestion, UserAnswer, DebugLog, GeminiModel } from "../types";
import { getApiKey } from './apiKeyService';

interface GeminiRefinementResponse {
  status: 'refining' | 'complete';
  questions?: RefinementQuestion[];
  finalPrompts?: string[];
}

const log = (onLog: (log: DebugLog) => void, type: DebugLog['type'], data: any) => {
    onLog({
        timestamp: new Date().toISOString(),
        type,
        data,
    });
};

export async function getRefinementStep(
  originalPrompt: string,
  conversationHistory: UserAnswer[],
  systemInstruction: string,
  onLog: (log: DebugLog) => void,
  model: GeminiModel,
): Promise<GeminiRefinementResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key not found. Please set your API key in the settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    let fullPrompt = `The user's initial idea is: "${originalPrompt}"\n\n`;
    
    if (conversationHistory.length > 0) {
      fullPrompt += "Here is the conversation so far:\n";
      conversationHistory.forEach(turn => {
        fullPrompt += `Q: ${turn.question}\nA: ${turn.answer}\n`;
      });
      fullPrompt += "\nBased on this, what is the next step?";
    } else {
      fullPrompt += "\nThis is the first step. What questions do you have?"
    }

    const requestPayload = {
      model,
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { 
              type: Type.STRING,
              description: "Either 'refining' if you need to ask more questions, or 'complete' if you have enough information.",
              enum: ['refining', 'complete'],
            },
            questions: {
              type: Type.ARRAY,
              description: "An array of up to 3 question objects. Only include this if status is 'refining'.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answers: { 
                    type: Type.ARRAY, 
                    description: "An array of 3 concise suggested answers.",
                    items: { type: Type.STRING }
                  }
                },
                required: ['question', 'answers'],
              }
            },
            finalPrompts: {
              type: Type.ARRAY,
              description: "An array of 2 final, detailed prompts in Markdown format. Only include this if status is 'complete'.",
              items: { type: Type.STRING }
            }
          },
          required: ['status'],
        }
      }
    };
    
    log(onLog, 'request', requestPayload);

    const response = await ai.models.generateContent(requestPayload);
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The AI returned an empty response. Please try again.");
    }

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error("The AI returned a malformed response that could not be read. Please try again.");
    }
    
    log(onLog, 'response', { rawResponse: response, parsed: result });
    
    // Validate the parsed JSON against the expected structure
    if (result.status === 'refining' && Array.isArray(result.questions)) {
      return result;
    }
    if (result.status === 'complete' && Array.isArray(result.finalPrompts)) {
      return result;
    }

    const validationError = new Error("The AI returned an unexpected response format. Please try refining your initial prompt or check the model's compatibility.");
    log(onLog, 'error', { message: validationError.message, dataReceived: result });
    throw validationError;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(onLog, 'error', { message: errorMessage, error: error });
    
    // Re-throw our custom, user-friendly errors that were thrown in the 'try' block
    if (errorMessage.includes("malformed response") || errorMessage.includes("unexpected response format") || errorMessage.includes("empty response")) {
        throw error;
    }

    // Check for specific API key-related errors from the service and create a friendlier message
    if (errorMessage.toLowerCase().includes('api key not valid') || errorMessage.toLowerCase().includes('permission_denied')) {
        throw new Error('Your API key is not valid or has been rejected. Please check your key and update it in the settings.');
    }

    // Check for network-related errors and create a friendlier message
    if (errorMessage.toLowerCase().includes('fetch')) {
         throw new Error('A network error occurred. Please check your internet connection and try again.');
    }
    
    // Generic fallback for other errors (e.g., server-side issues)
    throw new Error(`An unexpected error occurred while communicating with the AI. Details: ${errorMessage}`);
  }
}