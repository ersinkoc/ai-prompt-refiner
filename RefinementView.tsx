
import React, { useState, useEffect } from 'react';
import { RefinementQuestion, UserAnswer, QuestionType, RefinementStatus, RefinementContext, FocusArea } from './types';
import { SparklesIcon, InfoIcon, CheckCircleIcon, AlertTriangleIcon, EyeIcon } from './components/icons';
import PromptPreview from './components/PromptPreview';

interface RefinementViewProps {
  isLoading: boolean;
  questions: RefinementQuestion[];
  onRefine: (answers: UserAnswer[]) => void;
  basePrompt: string;
  refinementRound?: number;
  maxRounds?: number;
  confidence?: number;
  suggestedApproach?: string;
  nextSteps?: string[];
  canContinueRefining?: boolean;
  onContinueRefining?: () => void;
  // Preview props
  selectedStacks?: string[];
  focusAreas?: FocusArea[];
  complexity?: 'basic' | 'detailed' | 'comprehensive';
  outputStyle?: 'professional' | 'casual' | 'technical' | 'educational';
}

const RefinementView: React.FC<RefinementViewProps> = ({
  isLoading,
  questions,
  onRefine,
  basePrompt,
  refinementRound = 1,
  maxRounds = 3,
  confidence = 85,
  suggestedApproach = 'comprehensive',
  nextSteps = [],
  canContinueRefining = false,
  onContinueRefining,
  selectedStacks = [],
  focusAreas = [],
  complexity = 'detailed',
  outputStyle = 'professional'
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    // Reset answers and validation errors when new questions arrive
    setAnswers({});
    setValidationErrors({});
  }, [questions]);

  const validateAnswer = (question: RefinementQuestion, answer: string): string | null => {
    if (question.required && (!answer || answer.trim() === '')) {
      return 'This question is required';
    }
    return null;
  };

  const handleAnswerSelect = (question: RefinementQuestion, answer: string) => {
    const questionKey = question.id || question.question;
    setAnswers(prev => ({ ...prev, [questionKey]: answer }));

    // Clear validation error when user selects an answer
    if (validationErrors[questionKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionKey];
        return newErrors;
      });
    }
  };

  const handleCustomAnswerChange = (question: RefinementQuestion, customAnswer: string) => {
    const questionKey = question.id || question.question;
    setAnswers(prev => ({ ...prev, [questionKey]: customAnswer }));

    // Validate on change
    const error = validateAnswer(question, customAnswer);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [questionKey]: error }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionKey];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate all required questions
    const errors: Record<string, string> = {};
    questions.forEach(q => {
      const questionKey = q.id || q.question;
      const error = validateAnswer(q, answers[questionKey] || '');
      if (error) {
        errors[questionKey] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const submittedAnswers: UserAnswer[] = questions.map(q => {
      const questionKey = q.id || q.question;
      return {
        id: q.id || `q_${questions.indexOf(q)}`,
        question: q.question,
        questionId: q.id || `q_${questions.indexOf(q)}`,
        answer: answers[questionKey] || 'No answer provided',
        questionType: q.type || QuestionType.CLARIFICATION,
        timestamp: new Date()
      };
    });
    onRefine(submittedAnswers);
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.CLARIFICATION:
        return '❓';
      case QuestionType.SPECIFICATION:
        return '⚙️';
      case QuestionType.SCENARIO:
        return '🎭';
      case QuestionType.CONSTRAINT:
        return '🚫';
      case QuestionType.EXAMPLE:
        return '💡';
      case QuestionType.PRIORITY:
        return '🎯';
      default:
        return '❓';
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.CLARIFICATION:
        return 'Clarification';
      case QuestionType.SPECIFICATION:
        return 'Specification';
      case QuestionType.SCENARIO:
        return 'Scenario';
      case QuestionType.CONSTRAINT:
        return 'Constraint';
      case QuestionType.EXAMPLE:
        return 'Example';
      case QuestionType.PRIORITY:
        return 'Priority';
      default:
        return 'Question';
    }
  };

  return (
    <div className="w-full max-w-3xl h-full flex flex-col">
      <div className="flex-1 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700/50 flex flex-col">

        {/* Refinement Progress Header */}
        <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Round {refinementRound} of {maxRounds}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      confidence >= 90 ? 'bg-green-500' :
                      confidence >= 70 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(refinementRound / maxRounds) * 100}%` }}
            />
          </div>

          {/* Approach Badge */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200">
                {suggestedApproach} approach
              </span>
              {refinementRound > 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Building on previous answers
                </span>
              )}
            </div>
            {nextSteps.length > 0 && (
              <button
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center"
                title="Next steps"
              >
                <InfoIcon className="w-3 h-3 mr-1" />
                View next steps
              </button>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-4">
          {questions.map((q, index) => {
            const questionKey = q.id || q.question;
            const hasError = !!validationErrors[questionKey];
            const isAnswered = !!answers[questionKey];

            return (
              <div key={q.id || index} className={`space-y-3 ${hasError ? 'border-l-4 border-red-500 pl-4' : ''}`}>
                {/* Question Header */}
                <div className="flex items-start space-x-3">
                  <span className="text-2xl flex-shrink-0">{getQuestionTypeIcon(q.type || QuestionType.CLARIFICATION)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                        {index + 1}. {q.question}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {getQuestionTypeLabel(q.type || QuestionType.CLARIFICATION)}
                      </span>
                      {q.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300">
                          Required
                        </span>
                      )}
                      {isAnswered && (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    {/* Question Description */}
                    {q.followUpQuestions && q.followUpQuestions.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        This may lead to follow-up questions about: {q.followUpQuestions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="flex flex-wrap gap-2 mb-3 ml-11">
                  {q.answers.map((ans, ansIndex) => (
                    <button
                      key={ansIndex}
                      onClick={() => handleAnswerSelect(q, ans)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${
                        answers[questionKey] === ans
                          ? 'bg-cyan-500 text-white shadow-lg transform scale-105'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 hover:transform hover:scale-105'
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>

                {/* Custom Answer Input */}
                {(q.allowCustom !== false) && (
                  <div className="ml-11">
                    <input
                      type="text"
                      placeholder={q.allowCustom !== false ? "Or type your own answer..." : "Select from the options above"}
                      value={answers[questionKey] || ''}
                      onChange={(e) => handleCustomAnswerChange(q, e.target.value)}
                      disabled={q.allowCustom === false}
                      className={`w-full bg-gray-100/70 dark:bg-gray-800/70 border rounded-md p-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                        hasError
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-cyan-500'
                      } ${q.allowCustom === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {hasError && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                        <AlertTriangleIcon className="w-3 h-3 mr-1" />
                        {validationErrors[questionKey]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading || questions.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-base font-semibold text-white bg-cyan-600 rounded-lg disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>{refinementRound === 1 ? 'Start Refining' : 'Continue Refining'}</span>
          </button>

          {canContinueRefining && onContinueRefining && (
            <button
              onClick={onContinueRefining}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-base font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/50 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/70 transition-colors"
            >
              <span>Ask More Questions</span>
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
              <span className="text-lg text-gray-700 dark:text-gray-300">The AI is thinking...</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If this takes too long, the service might be experiencing high demand. The system will automatically retry if needed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinementView;