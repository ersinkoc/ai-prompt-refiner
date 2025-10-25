
import React, { useState, useEffect } from 'react';
import { RefinementQuestion, UserAnswer } from './types';
import { SparklesIcon } from './components/icons';

interface RefinementViewProps {
  isLoading: boolean;
  questions: RefinementQuestion[];
  onRefine: (answers: UserAnswer[]) => void;
  basePrompt: string;
}

const RefinementView: React.FC<RefinementViewProps> = ({ isLoading, questions, onRefine, basePrompt }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset answers when new questions arrive
    setAnswers({});
  }, [questions]);

  const handleAnswerSelect = (question: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [question]: answer }));
  };

  const handleCustomAnswerChange = (question: string, customAnswer: string) => {
    setAnswers(prev => ({ ...prev, [question]: customAnswer }));
  };

  const handleSubmit = () => {
    const submittedAnswers: UserAnswer[] = questions.map(q => ({
      question: q.question,
      answer: answers[q.question] || 'No answer provided', // Fallback
    }));
    onRefine(submittedAnswers);
  };

  return (
    <div className="relative w-full max-w-3xl">
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Refining prompt idea:</p>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">"{basePrompt}"</h2>
          </div>
        
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">{index + 1}. {q.question}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {q.answers.map((ans, ansIndex) => (
                  <button
                    key={ansIndex}
                    onClick={() => handleAnswerSelect(q.question, ans)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      answers[q.question] === ans
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {ans}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type your own answer..."
                value={answers[q.question] || ''}
                onChange={(e) => handleCustomAnswerChange(q.question, e.target.value)}
                className="w-full bg-gray-100/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-base font-semibold text-white bg-cyan-600 rounded-lg disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Refine Further</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 dark:border-cyan-400"></div>
            <span className="text-lg text-gray-700 dark:text-gray-300">The AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinementView;