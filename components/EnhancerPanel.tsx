import React, { useState } from 'react';
import { categorizedTechStacks } from './techStacks';
import { SparklesIcon, RefreshCwIcon, EyeIcon, HistoryIcon, TrashIcon, ReuseIcon, ChevronDownIcon, LightbulbIcon, SettingsIcon, KeyIcon, BotIcon, PanelLeftCloseIcon, MoonIcon, SunIcon, InfoIcon } from './icons';
import { PromptHistoryItem, OutputFormat, GeminiModel } from '../types';
import ExamplesModal from './ExamplesModal';
import AboutModal from './AboutModal';

interface EnhancerPanelProps {
  onEnhance: (prompt: string) => void;
  onSetSystemInstruction: (instruction: string) => void;
  currentSystemInstruction: string;
  baseSystemInstruction: string;
  onResetSystemInstruction: () => void;
  selectedStacks: string[];
  onStacksChange: (stacks: string[]) => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (format: OutputFormat) => void;
  selectedModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  history: PromptHistoryItem[];
  onViewHistory: (item: PromptHistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onOpenApiKeyModal: () => void;
  openSections: Record<string, boolean>;
  onToggleSection: (section: string) => void;
  onClosePanel: () => void;
  isLoggingEnabled: boolean;
  onToggleLogging: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const trimText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

const sanitizeInput = (input: string): string => {
  return input.replace(/<\/?[^>]+(>|$)/g, "");
};

const EnhancerPanel: React.FC<EnhancerPanelProps> = ({
  onEnhance,
  onSetSystemInstruction,
  currentSystemInstruction,
  onResetSystemInstruction,
  selectedStacks,
  onStacksChange,
  outputFormat,
  onOutputFormatChange,
  selectedModel,
  onModelChange,
  history,
  onViewHistory,
  onDeleteHistory,
  onClearHistory,
  onOpenApiKeyModal,
  openSections,
  onToggleSection,
  onClosePanel,
  isLoggingEnabled,
  onToggleLogging,
  theme,
  onToggleTheme,
}) => {
  const [promptToEnhance, setPromptToEnhance] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isExamplesModalOpen, setIsExamplesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [openStackCategory, setOpenStackCategory] = useState<string | null>(null);
  
  const MAX_PROMPT_LENGTH = 2000;
  
  const stackCategories = Object.keys(categorizedTechStacks);
  const outputFormats: OutputFormat[] = ['Markdown', 'JSON', 'Plain Text'];
  
  const handleEnhanceClick = () => {
    const sanitizedPrompt = sanitizeInput(promptToEnhance).trim();
    if (!sanitizedPrompt) {
      setIsInvalid(true);
      setTimeout(() => setIsInvalid(false), 820); // Duration of the shake animation
      return;
    }
    onEnhance(sanitizedPrompt);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isInvalid) {
      setIsInvalid(false);
    }
    setPromptToEnhance(e.target.value);
  };
  
  const handleStackClick = (stackName: string) => {
    const newStacks = selectedStacks.includes(stackName)
      ? selectedStacks.filter(s => s !== stackName)
      : [...selectedStacks, stackName];
    onStacksChange(newStacks);
  };
  
  const prefillPromptAndFocus = (prompt: string) => {
      setPromptToEnhance(prompt);
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="unit tests"]');
      if (textarea) {
          textarea.focus();
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };
  
  const handleSelectExample = (prompt: string) => {
      prefillPromptAndFocus(prompt);
      setIsExamplesModalOpen(false);
  };

  return (
    <>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
            <BotIcon className="w-6 h-6 mr-3 text-cyan-500 dark:text-cyan-400"/>
            AI Prompt Refiner
          </h1>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setIsAboutModalOpen(true)} 
              title="About this project"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
           <button 
              onClick={onToggleTheme} 
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
             <button 
                onClick={onClosePanel} 
                title="Close Panel"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <PanelLeftCloseIcon className="w-5 h-5" />
              </button>
          </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700/50">
        
        {/* Settings Section (MERGED) */}
        <div id="tour-settings-section" className="py-6 first:pt-0 last:pb-0">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center"><SettingsIcon className="w-5 h-5 mr-2" />Settings</h2>
                 <button onClick={() => onToggleSection('settings')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSections.settings ? 'rotate-180' : ''}`} />
                </button>
            </div>
            {openSections.settings && (
                <div className="space-y-4 pt-2">
                    <button
                        onClick={onOpenApiKeyModal}
                        className="w-full text-left bg-white dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700/80 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 flex items-center"
                    >
                        <KeyIcon className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" />
                        <span>Update API Key</span>
                    </button>
                    
                    <div>
                        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <BotIcon className="w-4 h-4 mr-2 inline-block" />AI Model
                        </label>
                         <select
                            id="model-select"
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value as GeminiModel)}
                            className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced)</option>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label htmlFor="debug-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable API Logging
                      </label>
                      <button
                        id="debug-toggle"
                        onClick={onToggleLogging}
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-gray-800 ${
                          isLoggingEnabled ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            isLoggingEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                </div>
            )}
        </div>
        
        {/* System Instruction Section */}
        <div className="py-6 first:pt-0 last:pb-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Enhancement Context</h2>
             <div className="flex items-center space-x-2">
                 <button
                    onClick={onResetSystemInstruction}
                    title="Reset to default"
                    className="flex items-center justify-center p-2 text-sm font-medium text-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    <RefreshCwIcon className="w-4 h-4" />
                </button>
                <button onClick={() => onToggleSection('context')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSections.context ? 'rotate-180' : ''}`} />
                </button>
            </div>
          </div>
          {openSections.context && (
            <textarea
                value={currentSystemInstruction}
                onChange={(e) => onSetSystemInstruction(e.target.value)}
                className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[150px]"
                rows={8}
            />
          )}
        </div>

        {/* Tech Stack Specialization */}
        <div className="py-6 first:pt-0 last:pb-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Specialize Expertise</h2>
             <button onClick={() => onToggleSection('expertise')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSections.expertise ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {openSections.expertise && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Focus the AI's knowledge on specific technologies. This will amend the context.</p>
              <div className="space-y-2">
                {stackCategories.map(category => (
                    <div key={category}>
                        <button
                            onClick={() => setOpenStackCategory(openStackCategory === category ? null : category)}
                            className="w-full flex justify-between items-center p-2 rounded-md bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            <span>{category}</span>
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${openStackCategory === category ? 'rotate-180' : ''}`} />
                        </button>
                        {openStackCategory === category && (
                            <div className="p-3 mt-2 bg-gray-100 dark:bg-gray-900/50 rounded-md flex flex-wrap gap-2">
                                {categorizedTechStacks[category].map(stack => (
                                    <button
                                        key={stack.id}
                                        onClick={() => handleStackClick(stack.name)}
                                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                                            selectedStacks.includes(stack.name)
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        <span className="mr-1">{stack.logo}</span>
                                        <span>{stack.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Prompt Enhancer Section (Always Open) */}
        <div id="tour-start-here-section" className="py-6 first:pt-0 last:pb-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Start Here</h2>
             <button
                id="tour-browse-ideas-button"
                onClick={() => setIsExamplesModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/50 rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
                title="Browse examples and templates"
            >
                <LightbulbIcon className="w-4 h-4" />
                <span>Browse Ideas</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Write a basic idea, and the AI will ask questions to refine it with you.</p>
          <div className="flex flex-col space-y-3">
            <div className="relative">
              <textarea
                value={promptToEnhance}
                onChange={handlePromptChange}
                maxLength={MAX_PROMPT_LENGTH}
                placeholder="e.g., write unit tests, generate API docs, or create a README..."
                className={`w-full bg-white dark:bg-gray-900/70 border rounded-lg p-3 pr-20 text-gray-800 dark:text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 transition-colors ${
                  isInvalid 
                    ? 'border-red-500/80 focus:ring-red-500 animate-shake' 
                    : 'border-gray-300 dark:border-gray-700 focus:ring-cyan-500'
                }`}
                rows={3}
              />
              <div className="absolute bottom-2.5 right-3 pointer-events-none">
                 <p className={`text-xs font-mono ${
                   promptToEnhance.length >= MAX_PROMPT_LENGTH
                     ? 'text-red-500 dark:text-red-400'
                     : promptToEnhance.length > MAX_PROMPT_LENGTH * 0.9
                     ? 'text-amber-500 dark:text-amber-400'
                     : 'text-gray-400 dark:text-gray-500'
                 }`}>
                   {promptToEnhance.length}/{MAX_PROMPT_LENGTH}
                 </p>
              </div>
              {isInvalid && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 px-1">Prompt cannot be empty.</p>}
            </div>
            
            <div>
              <label htmlFor="output-format" className="sr-only">Output Format</label>
              <select
                id="output-format"
                value={outputFormat}
                onChange={(e) => onOutputFormatChange(e.target.value as OutputFormat)}
                className="w-full bg-white dark:bg-gray-900/70 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {outputFormats.map(format => (
                  <option key={format} value={format}>{format} Output</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEnhanceClick}
              disabled={!promptToEnhance.trim()}
              className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors"
            >
                <SparklesIcon className="w-4 h-4" />
              <span>Enhance Prompt</span>
            </button>
          </div>
        </div>

        {/* Enhancement History Section */}
        <div id="tour-history-section" className="py-6 first:pt-0 last:pb-0">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center"><HistoryIcon className="w-5 h-5 mr-2" />Enhancement History</h2>
                <div className="flex items-center space-x-2">
                     {history.length > 0 && (
                        <button
                            onClick={onClearHistory}
                            className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                        >
                            Clear All
                        </button>
                     )}
                     <button onClick={() => onToggleSection('history')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${openSections.history ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {openSections.history && (
                <div>
                    {history.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {history.map(item => (
                                <div key={item.id} className="bg-white dark:bg-gray-900/70 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700/50">
                                    <p className="text-gray-600 dark:text-gray-400 italic mb-2">{trimText(item.originalPrompt, 80)}</p>
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => prefillPromptAndFocus(item.originalPrompt)} title="Reuse Original Prompt" className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"><ReuseIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onViewHistory(item)} title="View Final Prompts" className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"><EyeIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onDeleteHistory(item.id)} title="Delete" className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No history yet. Enhance a prompt to get started.</p>
                    )}
                </div>
            )}
        </div>
        <ExamplesModal 
            isOpen={isExamplesModalOpen}
            onClose={() => setIsExamplesModalOpen(false)}
            onSelectPrompt={handleSelectExample}
        />
        <AboutModal
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(false)}
        />
    </div>
    </>
  );
};

export default EnhancerPanel;