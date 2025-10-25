import { GoogleGenAI, Type } from "@google/genai";
import { RefinementQuestion, UserAnswer, DebugLog, GeminiModel, RefinementStatus, RefinementContext, GeminiResponse } from "../types";
import { getApiKey } from './apiKeyService';
import { getContextualQuestions, getBestPractices, getCommonIssues } from './techStackQuestions';

const log = (onLog: (log: DebugLog) => void, type: DebugLog['type'], data: any) => {
    onLog({
        timestamp: new Date().toISOString(),
        type,
        data,
    });
};

// Analyze prompt complexity and determine approach
const analyzePromptComplexity = (prompt: string, selectedStacks: string[]): {
  estimatedRounds: number;
  complexity: 'basic' | 'detailed' | 'comprehensive';
  confidence: number;
} => {
  const complexityIndicators = {
    basic: ['explain', 'what is', 'how to', 'basic'],
    detailed: ['implement', 'create', 'build', 'develop'],
    comprehensive: ['optimize', 'architecture', 'design pattern', 'enterprise', 'scalable']
  };

  let complexityScore = 0;
  const promptLower = prompt.toLowerCase();

  Object.entries(complexityIndicators).forEach(([level, indicators]) => {
    const matches = indicators.filter(indicator => promptLower.includes(indicator)).length;
    if (matches > 0) {
      complexityScore += level === 'basic' ? 1 : level === 'detailed' ? 2 : 3;
    }
  });

  // Stack complexity adds to the score
  complexityScore += Math.min(selectedStacks.length * 0.5, 2);

  let complexity: 'basic' | 'detailed' | 'comprehensive';
  let estimatedRounds: number;

  if (complexityScore <= 2) {
    complexity = 'basic';
    estimatedRounds = 2;
  } else if (complexityScore <= 4) {
    complexity = 'detailed';
    estimatedRounds = 3;
  } else {
    complexity = 'comprehensive';
    estimatedRounds = 4;
  }

  const confidence = Math.min(85 + (complexityScore * 3), 95);

  return { estimatedRounds, complexity, confidence };
};

// Generate enhanced system instruction
const generateEnhancedSystemInstruction = (context: RefinementContext): string => {
  const { basePrompt, selectedStacks, conversationHistory, refinementRound, maxRounds, focusAreas, complexity, outputStyle } = context;

  const bestPractices = getBestPractices(selectedStacks);
  const commonIssues = getCommonIssues(selectedStacks);
  const contextualQuestions = getContextualQuestions(selectedStacks);

  let instruction = `You are an expert-level AI prompt engineer specializing in iterative refinement. Your goal is to help the user create the perfect prompt through intelligent conversation.

CURRENT CONTEXT:
- Base Prompt: "${basePrompt}"
- Selected Technologies: ${selectedStacks.join(', ') || 'None specified'}
- Refinement Round: ${refinementRound}/${maxRounds}
- Complexity Level: ${complexity}
- Output Style: ${outputStyle}

TECHNOLOGY-SPECIFIC INSIGHTS:
${bestPractices.length > 0 ? `
Best Practices for Selected Technologies:
${bestPractices.map(practice => `• ${practice}`).join('\n')}
` : ''}

${commonIssues.length > 0 ? `
Common Issues to Address:
${commonIssues.map(issue => `• ${issue}`).join('\n')}
` : ''}

CONVERSATION STRATEGY:
1. If this is the first round (round 1), ask 2-3 foundational questions to understand the core requirements.
2. In subsequent rounds, ask 1-2 more specific questions based on previous answers.
3. Focus on the user's enabled focus areas: ${focusAreas.filter(f => f.enabled).map(f => f.name).join(', ') || 'General'}
4. Adapt your questioning depth based on the complexity level: ${complexity}
5. Consider the conversation history to avoid redundant questions.

QUESTIONING GUIDELINES:
- Ask targeted questions that build upon previous answers
- Provide 3-4 concise, actionable suggested answers
- Allow for custom responses when appropriate
- Consider the selected technology stack for context-aware questions
- If sufficient information is gathered, generate 2 distinct, high-quality prompts

OUTPUT REQUIREMENTS:
- Format: ${outputStyle}
- Include specific examples relevant to the selected technologies
- Address common issues and best practices
- Provide actionable, ready-to-use prompts

JSON RESPONSE FORMAT:
{
  "status": "refining" | "complete" | "needs_more_context",
  "questions": [Only if status is "refining"],
  "finalPrompts": [Only if status is "complete"],
  "refinementCount": ${refinementRound},
  "suggestedApproach": "detailed" | "concise" | "comprehensive",
  "confidence": 0-100,
  "nextSteps": ["Brief description of next steps"]
}`;

  return instruction;
};

export async function getRefinementStep(
  originalPrompt: string,
  conversationHistory: UserAnswer[],
  systemInstruction: string,
  onLog: (log: DebugLog) => void,
  model: GeminiModel,
  context?: RefinementContext,
): Promise<GeminiResponse> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Gemini API Key not found. Please set your API key in the settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    // Use enhanced system instruction if context is provided
    const finalSystemInstruction = context
      ? generateEnhancedSystemInstruction(context)
      : systemInstruction;

    // Build conversation context
    let conversationContext = `The user's initial idea is: "${originalPrompt}"\n\n`;

    if (conversationHistory.length > 0) {
      conversationContext += "Here is the conversation so far:\n";
      conversationHistory.forEach((turn, index) => {
        conversationContext += `Round ${index + 1}:\n`;
        conversationContext += `Q: ${turn.question}\n`;
        conversationContext += `A: ${turn.answer}\n`;
        conversationContext += `Question Type: ${turn.questionType}\n\n`;
      });

      if (context) {
        conversationContext += `Current Refinement Round: ${context.refinementRound}/${context.maxRounds}\n`;
        conversationContext += "Based on this context, continue the refinement process.";
      }
    } else {
      conversationContext += "This is the first step in the refinement process.";
      if (context) {
        const complexity = analyzePromptComplexity(originalPrompt, context.selectedStacks);
        conversationContext += `\n\nComplexity Analysis: ${complexity.complexity} (Estimated ${complexity.estimatedRounds} rounds)`;
      }
    }

    // Build the request payload with enhanced schema
    const requestPayload = {
      model,
      contents: { parts: [{ text: conversationContext }] },
      config: {
        systemInstruction: finalSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Current status of the refinement process",
              enum: ['refining', 'complete', 'needs_more_context'],
            },
            questions: {
              type: Type.ARRAY,
              description: "Array of refined questions. Only include if status is 'refining'.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique identifier for the question" },
                  type: {
                    type: Type.STRING,
                    description: "Type of question for categorization",
                    enum: ['clarification', 'specification', 'scenario', 'constraint', 'example', 'priority']
                  },
                  question: { type: Type.STRING, description: "The question to ask the user" },
                  answers: {
                    type: Type.ARRAY,
                    description: "Array of 3-4 suggested answers",
                    items: { type: Type.STRING }
                  },
                  allowCustom: {
                    type: Type.BOOLEAN,
                    description: "Whether custom input should be allowed"
                  },
                  required: {
                    type: Type.BOOLEAN,
                    description: "Whether this question is required"
                  },
                  dependsOn: {
                    type: Type.ARRAY,
                    description: "IDs of questions this depends on",
                    items: { type: Type.STRING }
                  }
                },
                required: ['id', 'type', 'question', 'answers'],
              }
            },
            finalPrompts: {
              type: Type.ARRAY,
              description: "Array of 2-3 refined, detailed prompts in the specified format. Only include if status is 'complete'.",
              items: { type: Type.STRING }
            },
            refinementCount: {
              type: Type.INTEGER,
              description: "Current refinement round number"
            },
            suggestedApproach: {
              type: Type.STRING,
              description: "Suggested approach for the prompts",
              enum: ['detailed', 'concise', 'comprehensive']
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence level in the refinement (0-100)"
            },
            nextSteps: {
              type: Type.ARRAY,
              description: "Brief description of next steps",
              items: { type: Type.STRING }
            }
          },
          required: ['status'],
        }
      }
    };

    log(onLog, 'request', { payload: requestPayload, context });

    const response = await ai.models.generateContent(requestPayload);

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("The AI returned an empty response. Please try again.");
    }

    let result: GeminiResponse;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      throw new Error("The AI returned a malformed response that could not be read. Please try again.");
    }

    log(onLog, 'response', { rawResponse: response, parsed: result });

    // Enhanced validation with backward compatibility
    if (result.status === 'refining' && Array.isArray(result.questions)) {
      // Add missing properties for backward compatibility
      result.questions = result.questions.map((q, index) => ({
        id: q.id || `question_${index}`,
        type: q.type || 'clarification',
        question: q.question,
        answers: q.answers || [],
        allowCustom: q.allowCustom !== false,
        required: q.required || false,
        dependsOn: q.dependsOn || [],
        followUpQuestions: q.followUpQuestions || []
      }));
      return result;
    }

    if (result.status === 'complete' && Array.isArray(result.finalPrompts)) {
      result.refinementCount = result.refinementCount || context?.refinementRound || 1;
      result.confidence = result.confidence || 85;
      result.suggestedApproach = result.suggestedApproach || 'comprehensive';
      result.nextSteps = result.nextSteps || [];
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