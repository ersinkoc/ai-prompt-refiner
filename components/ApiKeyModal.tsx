import React, { useState } from 'react';
import Modal from './Modal';
import { KeyIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey: string | null;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (keyInput.trim()) {
      onSave(keyInput.trim());
      setKeyInput('');
      setError('');
    } else {
        setError('API Key cannot be empty.');
    }
  };

  const handleClose = () => {
    // Reset state on close
    setKeyInput('');
    setError('');
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Set Your Gemini API Key"
      footer={
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors"
          >
            Save Key
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm">
          Your Gemini API key is required to communicate with the AI. It is stored securely in your browser's local storage and is never sent anywhere else.
        </p>
        <div className="relative">
          <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder={currentKey ? 'Enter new key to update' : 'Enter your API key'}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-900/70 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-cyan-500'}`}
          />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-500 dark:text-cyan-400 hover:underline inline-block">
          Get your Gemini API key from Google AI Studio &rarr;
        </a>
      </div>
    </Modal>
  );
};

export default ApiKeyModal;
