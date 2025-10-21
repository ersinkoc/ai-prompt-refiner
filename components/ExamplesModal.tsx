import React, { useState } from 'react';
import Modal from './Modal';
import { promptTemplates } from './promptTemplates';
import { promptExamples } from './promptExamples';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const ExamplesModal: React.FC<ExamplesModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'examples'>('templates');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Browse Examples & Templates"
    >
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'templates'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Quick Start Templates
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'examples'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Detailed Examples
        </button>
      </div>
      
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {activeTab === 'templates' && promptTemplates.map(template => (
          <button
            key={template.title}
            onClick={() => onSelectPrompt(template.prompt)}
            title={template.prompt}
            className="w-full text-left bg-white dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700/80 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 flex items-center"
          >
            <span className="mr-3 text-lg">{template.icon}</span>
            <span>{template.title}</span>
          </button>
        ))}
        
        {activeTab === 'examples' && promptExamples.map(example => (
          <button
            key={example.title}
            onClick={() => onSelectPrompt(example.prompt)}
            className="w-full text-left bg-white dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700/80 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200"
          >
            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{example.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{example.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default ExamplesModal;
