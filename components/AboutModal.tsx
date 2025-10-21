import React from 'react';
import Modal from './Modal';
import { GitHubIcon, GlobeIcon } from './icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_REPO_URL = "https://github.com/ersinkoc/ai-prompt-refiner";

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About AI Prompt Refiner"
      footer={
         <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            Close
        </button>
      }
    >
      <div className="space-y-4 text-sm">
        <p>
          <strong>AI Prompt Refiner</strong> is a free and open-source tool designed for developers to help them create better, more effective prompts for AI models like Gemini.
        </p>
        <p>
          This project was created to simplify the path from an idea to a production-ready prompt and to make it a collaborative process.
        </p>
        
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">How to Use</h3>
            <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href={window.location.href}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <GlobeIcon className="w-5 h-5"/>
                    <span>Use the Hosted Version</span>
                </a>
                <a 
                    href={GITHUB_REPO_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white transition-colors"
                >
                    <GitHubIcon className="w-5 h-5"/>
                    <span>View the Code (GitHub)</span>
                </a>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
