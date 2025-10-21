import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from './Modal';
import { ClipboardIcon } from './icons';
import { ToastType } from '../types';

interface PromptResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  finalPrompts: string[];
  theme: 'light' | 'dark';
  addToast: (message: string, type: ToastType) => void;
}

const PromptResultsModal: React.FC<PromptResultsModalProps> = ({
  isOpen,
  onClose,
  originalPrompt,
  finalPrompts,
  theme,
  addToast,
}) => {

  const handleCopy = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    addToast('Prompt copied to clipboard!', 'success');
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Final Prompts for: "${originalPrompt}"`}
      footer={
        <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            Close
        </button>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
        {finalPrompts.length > 0 ? finalPrompts.map((prompt, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-900/70 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
             <article className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-sm max-w-none`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
             </article>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                onClick={() => handleCopy(prompt)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700/50 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <ClipboardIcon className="w-4 h-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No final prompts were generated.</p>
        )}
      </div>
    </Modal>
  );
};

export default PromptResultsModal;
