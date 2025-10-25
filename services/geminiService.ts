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

// Retry configuration for API calls
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
};

// Function to calculate delay with exponential backoff
const getRetryDelay = (attemptNumber: number): number => {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffFactor, attemptNumber - 1);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
};

// Function to check if error is retryable
const isRetryableError = (error: any): boolean => {
    if (!error) return false;

    const errorMessage = error.message || String(error);
    const errorCode = error.code || error.status;

    // Check for 503 Service Unavailable
    if (errorCode === 503 || errorMessage.includes('503')) {
        return true;
    }

    // Check for overloaded model messages
    if (errorMessage.includes('overloaded') || errorMessage.includes('UNAVAILABLE')) {
        return true;
    }

    // Check for network errors that might be temporary
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
        return true;
    }

    // Check for rate limiting (429)
    if (errorCode === 429 || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return true;
    }

    return false;
};

// Sleep function for delays
const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Fallback parsing function for malformed responses
const tryFallbackParse = (text: string, parsedResult?: any): GeminiResponse | null => {
  try {
    // If we have a partially parsed result, try to fix it
    if (parsedResult) {
      return fixPartialResponse(parsedResult);
    }

    // Try to extract JSON from malformed text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extractedJson = JSON.parse(jsonMatch[0]);
      return fixPartialResponse(extractedJson);
    }

    // Try to detect response pattern and create a basic structure
    if (text.toLowerCase().includes('question') || text.includes('?')) {
      // Looks like a questioning response
      return {
        status: 'refining',
        questions: [{
          id: 'fallback_1',
          type: 'clarification',
          question: "I need more information to help you better. Could you provide more details about what you'd like to create?",
          answers: ["Add more context", "Specify the output format", "Describe the target audience"],
          allowCustom: true,
          required: false,
          dependsOn: [],
          followUpQuestions: []
        }]
      };
    }

    // Default fallback - treat as complete with a generic prompt
    return {
      status: 'complete',
      finalPrompts: [
        "Based on your request, here's a refined prompt that should work well:",
        "Alternative approach: Here's another version of the prompt:"
      ],
      refinementCount: 1,
      confidence: 60,
      suggestedApproach: 'basic',
      nextSteps: ['Review and refine the prompts as needed']
    };
  } catch (error) {
    return null;
  }
};

// Function to fix partial/malformed responses
const fixPartialResponse = (partialResult: any): GeminiResponse | null => {
  try {
    // If it has a status field, we can work with it
    if (partialResult.status) {
      const result: Partial<GeminiResponse> = {
        status: partialResult.status
      };

      if (partialResult.status === 'refining') {
        result.questions = Array.isArray(partialResult.questions) ? partialResult.questions : [{
          id: 'fallback_1',
          type: 'clarification',
          question: partialResult.question || "Could you provide more details?",
          answers: Array.isArray(partialResult.answers) ? partialResult.answers : ["Yes", "No", "Maybe"],
          allowCustom: true,
          required: false,
          dependsOn: [],
          followUpQuestions: []
        }];
      } else if (partialResult.status === 'complete') {
        result.finalPrompts = Array.isArray(partialResult.finalPrompts) ? partialResult.finalPrompts :
          [partialResult.prompt || partialResult.result || "Here's your refined prompt."];
        result.refinementCount = partialResult.refinementCount || 1;
        result.confidence = partialResult.confidence || 60;
        result.suggestedApproach = partialResult.suggestedApproach || 'basic';
        result.nextSteps = partialResult.nextSteps || [];
      }

      return result as GeminiResponse;
    }

    // Try to infer status from content
    if (Array.isArray(partialResult.questions) || partialResult.question) {
      return {
        status: 'refining',
        questions: Array.isArray(partialResult.questions) ? partialResult.questions : [{
          id: 'fallback_1',
          type: 'clarification',
          question: partialResult.question || "Could you provide more details?",
          answers: partialResult.answers || ["Yes", "No", "Maybe"],
          allowCustom: true,
          required: false,
          dependsOn: [],
          followUpQuestions: []
        }]
      };
    }

    if (Array.isArray(partialResult.finalPrompts) || partialResult.prompt || partialResult.result) {
      return {
        status: 'complete',
        finalPrompts: Array.isArray(partialResult.finalPrompts) ? partialResult.finalPrompts :
          [partialResult.prompt || partialResult.result || "Here's your refined prompt."],
        refinementCount: 1,
        confidence: 60,
        suggestedApproach: 'basic',
        nextSteps: []
      };
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Enhanced validation function
const validateAndNormalizeResponse = (result: any, context?: RefinementContext): {
  isValid: boolean;
  normalizedResponse?: GeminiResponse;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!result || typeof result !== 'object') {
    errors.push('Response is not a valid object');
    return { isValid: false, errors };
  }

  if (!result.status) {
    errors.push('Missing status field');
    return { isValid: false, errors };
  }

  const normalizedResponse: Partial<GeminiResponse> = { status: result.status };

  // Validate refining status
  if (result.status === 'refining') {
    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      errors.push('Questions array is missing or empty for refining status');
    } else {
      normalizedResponse.questions = result.questions.map((q: any, index: number) => ({
        id: q.id || `question_${index}`,
        type: q.type || 'clarification',
        question: q.question || `Question ${index + 1}`,
        answers: Array.isArray(q.answers) ? q.answers : ["Yes", "No", "Maybe"],
        allowCustom: q.allowCustom !== false,
        required: q.required || false,
        dependsOn: q.dependsOn || [],
        followUpQuestions: q.followUpQuestions || []
      }));
    }
  }

  // Validate complete status
  if (result.status === 'complete') {
    if (!Array.isArray(result.finalPrompts) || result.finalPrompts.length === 0) {
      errors.push('Final prompts array is missing or empty for complete status');
    } else {
      normalizedResponse.finalPrompts = result.finalPrompts;
      normalizedResponse.refinementCount = result.refinementCount || context?.refinementRound || 1;
      normalizedResponse.confidence = result.confidence || 85;
      normalizedResponse.suggestedApproach = result.suggestedApproach || 'comprehensive';
      normalizedResponse.nextSteps = result.nextSteps || [];
    }
  }

  // Handle other status values
  if (result.status === 'needs_more_context') {
    // Treat as refining with a generic question
    normalizedResponse.status = 'refining';
    normalizedResponse.questions = [{
      id: 'context_needed',
      type: 'clarification',
      question: "I need more context to help you better. Could you provide additional details?",
      answers: ["Add specific requirements", "Describe the use case", "Specify constraints"],
      allowCustom: true,
      required: false,
      dependsOn: [],
      followUpQuestions: []
    }];
  }

  return {
    isValid: errors.length === 0,
    normalizedResponse: normalizedResponse as GeminiResponse,
    errors
  };
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

  let lastError: any = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
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
      log(onLog, 'parse_error', {
        rawText: jsonText,
        error: parseError instanceof Error ? parseError.message : String(parseError)
      });

      // Try to extract useful information from malformed JSON
      const fallbackResult = tryFallbackParse(jsonText);
      if (fallbackResult) {
        log(onLog, 'fallback_success', { original: jsonText, fallback: fallbackResult });
        return fallbackResult;
      }

      throw new Error("The AI returned a response that couldn't be processed. The service may be experiencing issues. Please try again.");
    }

    log(onLog, 'response', { rawResponse: response, parsed: result });

    // Enhanced validation with more flexible structure checking
    const validationResult = validateAndNormalizeResponse(result, context);
    if (validationResult.isValid) {
      return validationResult.normalizedResponse!;
    }

    // If validation fails, try fallback parsing
    const fallbackResult = tryFallbackParse(jsonText, result);
    if (fallbackResult) {
      log(onLog, 'validation_fallback_success', {
        original: result,
        fallback: fallbackResult,
        validationErrors: validationResult.errors
      });
      return fallbackResult;
    }

    const validationError = new Error(`The AI returned an unexpected response format. This might be a temporary issue. ${validationResult.errors.join('. ')}`);
    log(onLog, 'validation_error', {
      message: validationError.message,
      dataReceived: result,
      errors: validationResult.errors,
      rawResponse: jsonText
    });
    throw validationError;

    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log the error for this attempt
      log(onLog, 'retry_attempt', {
        attempt,
        maxRetries: RETRY_CONFIG.maxRetries,
        error: errorMessage,
        isRetryable: isRetryableError(error)
      });

      // Check if this is a retryable error and we have more attempts
      if (attempt < RETRY_CONFIG.maxRetries && isRetryableError(error)) {
        const delay = getRetryDelay(attempt);
        log(onLog, 'retry_delay', { delay, attempt });

        // Wait before retrying
        await sleep(delay);
        continue;
      }

      // If we've exhausted all retries or it's not retryable, handle the error
      const finalErrorMessage = error instanceof Error ? error.message : String(error);
      log(onLog, 'error', { message: finalErrorMessage, error: error, totalAttempts: attempt });

      // Check if we exhausted retries due to service overload
      if (attempt === RETRY_CONFIG.maxRetries && isRetryableError(lastError)) {
        throw new Error(`The AI service is temporarily unavailable after ${RETRY_CONFIG.maxRetries} retry attempts. This usually happens when the model is overloaded. Please wait a moment and try again.`);
      }

      // Re-throw our custom, user-friendly errors that were thrown in the 'try' block
      if (finalErrorMessage.includes("malformed response") || finalErrorMessage.includes("unexpected response format") || finalErrorMessage.includes("empty response")) {
          throw error;
      }

      // Check for specific API key-related errors from the service and create a friendlier message
      if (finalErrorMessage.toLowerCase().includes('api key not valid') || finalErrorMessage.toLowerCase().includes('permission_denied')) {
          throw new Error('Your API key is not valid or has been rejected. Please check your key and update it in the settings.');
      }

      // Check for network-related errors and create a friendlier message
      if (finalErrorMessage.toLowerCase().includes('fetch')) {
           throw new Error('A network error occurred. Please check your internet connection and try again.');
      }

      // Generic fallback for other errors (e.g., server-side issues)
      throw new Error(`An unexpected error occurred while communicating with the AI. Details: ${finalErrorMessage}`);
    }
  }

  // This should never be reached, but just in case
  throw new Error('Unexpected error: Retry loop completed without success or failure.');
}