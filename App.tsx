import React, { useState, useEffect, useCallback } from 'react';
import EnhancerPanel from './components/EnhancerPanel';
import RefinementView from './RefinementView';
import PromptResultsModal from './components/EnhancementResults';
import ApiKeyModal from './components/ApiKeyModal';
import DebugPanel from './components/DebugPanel';
import ToastNotifications from './components/ToastNotifications';
import GuidedTour from './components/GuidedTour';
import { PromptHistoryItem, RefinementQuestion, UserAnswer, OutputFormat, DebugLog, GeminiModel, ToastNotification, ToastType, TourStep } from './types';
import { getRefinementStep } from './services/geminiService';
import { getApiKey, saveApiKey } from './services/apiKeyService';
import { getTourStatus, setTourCompleted } from './services/tourService';
import { idlePrompts } from './components/idlePrompts';
import { BotIcon, AlertTriangleIcon, MenuIcon } from './components/icons';

const DEFAULT_BASE_SYSTEM_INSTRUCTION = `You are an expert-level AI prompt engineer. Your primary goal is to help a user refine a basic prompt idea into a final, detailed, and effective prompt through a conversational process.

Your process is as follows:
1.  Analyze the user's initial prompt idea and the ongoing conversation.
2.  If you need more information to create a high-quality final prompt, ask up to 3 clarifying questions. Each question must come with 3 concise, clickable suggested answers.
3.  If you have sufficient information, generate 2 distinct, final, well-structured prompts in the user-specified format.

Your JSON output MUST match one of two schemas:
- For asking questions: {"status": "refining", "questions": [{"question": "...", "answers": ["...", "...", "..."]}]}
- For providing the final prompt: {"status": "complete", "finalPrompts": ["...", "..."]}`;

const tourSteps: TourStep[] = [
  {
    targetId: 'tour-start-here-section',
    title: '1. Start Here',
    content: 'This is the main area where you will write your initial prompt idea. Just type a simple concept and let the AI help you refine it.',
  },
  {
    targetId: 'tour-browse-ideas-button',
    title: '2. Get Inspired',
    content: 'Not sure where to start? Click here to browse a collection of templates and detailed examples for common developer tasks.',
  },
  {
    targetId: 'tour-settings-section',
    title: '3. Configure Your Setup',
    content: 'In this section, you can set your Gemini API key and choose the AI model you want to use. "Pro" is more powerful, while "Flash" is faster.',
    requiredOpenSection: 'settings',
  },
  {
    targetId: 'tour-history-section',
    title: '4. Your Enhancement History',
    content: "All your completed prompt refinements are saved here. You can view the final results, reuse the original prompt, or delete entries.",
    requiredOpenSection: 'history',
  },
  {
    targetId: 'final-tour-step', // This ID doesn't need to exist, it signals a centered modal
    title: "You're All Set!",
    content: "You're ready to start creating amazing prompts. Enter an idea in the 'Start Here' panel to begin.",
  },
];

// A simple hook to detect mobile screen sizes
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);
    return isMobile;
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [apiKey, setApiKey] = useState<string | null>(() => getApiKey());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Debug panel state
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isLoggingEnabled, setIsLoggingEnabled] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Guided tour state
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Side panel sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    settings: false,
    context: false,
    expertise: false,
    history: false,
  });

  const [displayPrompts, setDisplayPrompts] = useState<string[]>([]);

  const isMobile = useIsMobile();
  // Main side panel collapse state
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(window.innerWidth < 1024);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  // Check for tour status and set initial prompts on load
  useEffect(() => {
    if (apiKey && !getTourStatus()) {
      setIsTourActive(true);
    }
    // On initial load, select 3 random prompts to display
    const shuffled = [...idlePrompts].sort(() => 0.5 - Math.random());
    setDisplayPrompts(shuffled.slice(0, 3));
  }, []);

  const startRefinementProcess = async (prompt: string) => {
    setError(null);
    setPromptState({
      stage: 'loading',
      basePrompt: prompt,
      questions: [],
      conversationHistory: [],
      finalPrompts: [],
    });

    try {
      const result = await getRefinementStep(prompt, [], systemInstruction, handleLog, selectedModel);

      if (result.status === 'refining') {
        setPromptState(s => ({ ...s, stage: 'refining', questions: result.questions || [] }));
      } else if (result.status === 'complete') {
        const newHistoryItem: PromptHistoryItem = {
          id: `${Date.now()}`,
          originalPrompt: prompt,
          conversationHistory: [],
          finalPrompts: result.finalPrompts || [],
          timestamp: new Date(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);
        setPromptState(s => ({ ...s, stage: 'final', finalPrompts: result.finalPrompts || [] }));
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      setPromptState(s => ({ ...s, stage: 'error' }));
    }
  };
  
  const handleSaveApiKey = (key: string) => {
    const isFirstKey = !getApiKey();
    saveApiKey(key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
    addToast('API Key saved successfully!', 'success');

    // If an action was pending, resume it
    if (pendingPrompt) {
      startRefinementProcess(pendingPrompt);
      setPendingPrompt(null);
    } else if (isFirstKey && !getTourStatus()) {
      // Start tour after setting API key for the first time
      setIsTourActive(true);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // State for the side panel
  const [baseSystemInstruction, setBaseSystemInstruction] = useState(DEFAULT_BASE_SYSTEM_INSTRUCTION);
  const [systemInstruction, setSystemInstruction] = useState(DEFAULT_BASE_SYSTEM_INSTRUCTION);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('Markdown');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  
  // State for the main interactive process
  const [error, setError] = useState<string | null>(null);
  const [promptState, setPromptState] = useState<{
    stage: 'idle' | 'refining' | 'final' | 'loading' | 'error';
    basePrompt: string;
    questions: RefinementQuestion[];
    conversationHistory: UserAnswer[];
    finalPrompts: string[];
  }>({
    stage: 'idle',
    basePrompt: '',
    questions: [],
    conversationHistory: [],
    finalPrompts: [],
  });
  
  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('promptHistoryV2');
      if (savedHistory) {
        const parsedHistory: PromptHistoryItem[] = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  // Save history to localStorage whenever it changes, with a debounce
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      try {
        localStorage.setItem('promptHistoryV2', JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
    }, 500); // Auto-save after 500ms of inactivity

    return () => {
      clearTimeout(debounceSave);
    };
  }, [history]);
  
  const handleLog = (log: DebugLog) => {
    if (!isLoggingEnabled) return;
    setDebugLogs(prev => [log, ...prev]);
  };

  // Combine base instruction with tech stack info
  const updateSystemInstruction = useCallback(() => {
    let newInstruction = baseSystemInstruction;
    if (selectedStacks.length > 0) {
      newInstruction += `\n\nCRITICAL: The user is working with the following technology stack: ${selectedStacks.join(', ')}. All questions and final prompts must be highly relevant to this specific stack.`;
    }
    newInstruction += `\n\nWhen you are ready to generate the final prompts (status: 'complete'), you MUST format them as ${outputFormat}.`;
    setSystemInstruction(newInstruction);
  }, [baseSystemInstruction, selectedStacks, outputFormat]);

  useEffect(() => {
    updateSystemInstruction();
  }, [baseSystemInstruction, selectedStacks, outputFormat, updateSystemInstruction]);

  // Starts the multi-step enhancement process, checking for API key first
  const handleEnhanceRequest = async (prompt: string) => {
    if (!getApiKey()) {
      setPendingPrompt(prompt);
      setIsApiKeyModalOpen(true);
      return;
    }
    await startRefinementProcess(prompt);
  };
  
  // Handles the next step in the refinement loop
  const handleRefinementRequest = async (answers: UserAnswer[]) => {
      setError(null);
      const newConversationHistory = [...promptState.conversationHistory, ...answers];

      setPromptState(s => ({ ...s, stage: 'loading', conversationHistory: newConversationHistory }));

      try {
        const result = await getRefinementStep(promptState.basePrompt, newConversationHistory, systemInstruction, handleLog, selectedModel);

        if (result.status === 'refining') {
          setPromptState(s => ({ ...s, stage: 'refining', questions: result.questions || [] }));
        } else if (result.status === 'complete') {
          const newHistoryItem: PromptHistoryItem = {
            id: `${Date.now()}`,
            originalPrompt: promptState.basePrompt,
            conversationHistory: newConversationHistory,
            finalPrompts: result.finalPrompts || [],
            timestamp: new Date(),
          };
          setHistory(prev => [newHistoryItem, ...prev]);
          setPromptState(s => ({ ...s, stage: 'final', finalPrompts: result.finalPrompts || [] }));
        }
      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
          setError(errorMessage);
          setPromptState(s => ({ ...s, stage: 'error' }));
      }
  };

  const handleSetBaseSystemInstruction = (instruction: string) => {
    setBaseSystemInstruction(instruction);
  };
  
  const handleResetSystemInstruction = () => {
    setBaseSystemInstruction(DEFAULT_BASE_SYSTEM_INSTRUCTION);
  };
  
  const handleSetOutputFormat = (format: OutputFormat) => {
    setOutputFormat(format);
  };
  
  const handleViewHistory = (item: PromptHistoryItem) => {
    setPromptState({
      stage: 'final',
      basePrompt: item.originalPrompt,
      conversationHistory: item.conversationHistory,
      finalPrompts: item.finalPrompts,
      questions: [],
    });
    if (isPanelCollapsed) {
        setIsPanelCollapsed(false);
    }
  };
  
  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    addToast('History item deleted.', 'info');
  };
  
  const handleClearHistory = () => {
    if(window.confirm("Are you sure you want to clear all history? This cannot be undone.")) {
        setHistory([]);
        addToast('All history has been cleared.', 'success');
    }
  };

  const handleCloseModal = () => {
    // After closing the final prompt modal or an error, reset to the idle screen
    setError(null);
    setPromptState(s => ({ ...s, stage: 'idle', finalPrompts: [] }));
  };
  
  // Guided Tour Handlers
  const handleTourNext = () => {
    const nextStep = tourStep + 1;
    const requiredSection = tourSteps[nextStep]?.requiredOpenSection;
    if (requiredSection && !openSections[requiredSection]) {
        toggleSection(requiredSection);
    }
    setTourStep(nextStep);
  };

  const handleTourPrev = () => {
    setTourStep(prev => prev - 1);
  };

  const handleTourFinish = () => {
    setIsTourActive(false);
    setTourCompleted();
  };

  const renderIdleContent = () => {
    if (isMobile) {
      return (
        <div className="text-center p-6 max-w-sm">
          <BotIcon className="w-16 h-16 mx-auto text-cyan-500 dark:text-cyan-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">AI Prompt Refiner</h2>
          <p className="text-md text-gray-600 dark:text-gray-400">
            Tap the menu icon to open the panel and start refining your prompt idea.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-10 rounded-xl border border-gray-200 dark:border-gray-700/50 max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">Refine Your Prompt Idea</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
              Use the panel on the left to start. The AI will ask you questions to collaboratively build the perfect prompt.
          </p>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50">
              <h3 className="text-md text-gray-500 font-medium mb-4">Or try one of these ideas:</h3>
              <div className="flex flex-wrap justify-center gap-3">
                  {displayPrompts.map((prompt, index) => (
                      <button
                          key={index}
                          onClick={() => handleEnhanceRequest(prompt)}
                          className="bg-white dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700/80 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200"
                      >
                          {prompt}
                      </button>
                  ))}
              </div>
          </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-screen flex flex-col font-sans antialiased transition-colors duration-300">
      <ToastNotifications toasts={toasts} onDismiss={removeToast} />
      <GuidedTour
        isOpen={isTourActive}
        steps={tourSteps}
        currentStepIndex={tourStep}
        onNext={handleTourNext}
        onPrev={handleTourPrev}
        onFinish={handleTourFinish}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className={`bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700/50 h-full flex flex-col transition-all duration-300 ease-in-out ${isPanelCollapsed ? 'w-0 min-w-0' : 'w-full md:w-1/3 md:max-w-sm xl:max-w-md'}`}>
          <div className={`flex flex-col h-full transition-opacity duration-300 ${isPanelCollapsed ? 'opacity-0' : 'opacity-100'}`}>
              <EnhancerPanel
                onEnhance={handleEnhanceRequest}
                onSetSystemInstruction={handleSetBaseSystemInstruction}
                currentSystemInstruction={systemInstruction}
                baseSystemInstruction={baseSystemInstruction}
                onResetSystemInstruction={handleResetSystemInstruction}
                selectedStacks={selectedStacks}
                onStacksChange={setSelectedStacks}
                outputFormat={outputFormat}
                onOutputFormatChange={handleSetOutputFormat}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                history={history}
                onViewHistory={handleViewHistory}
                onDeleteHistory={handleDeleteHistory}
                onClearHistory={handleClearHistory}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                openSections={openSections}
                onToggleSection={toggleSection}
                onClosePanel={() => setIsPanelCollapsed(true)}
                isLoggingEnabled={isLoggingEnabled}
                onToggleLogging={() => setIsLoggingEnabled(p => !p)}
                theme={theme}
                onToggleTheme={toggleTheme}
              />
          </div>
        </div>
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto relative">
           {isPanelCollapsed && (
              <button
                onClick={() => setIsPanelCollapsed(false)}
                title="Open Panel"
                className="absolute top-4 left-4 z-10 p-2 rounded-full text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <MenuIcon className="w-5 h-5" />
              </button>
            )}
          {promptState.stage === 'idle' && renderIdleContent()}
          {(promptState.stage === 'refining' || promptState.stage === 'loading') && (
              <RefinementView
                  isLoading={promptState.stage === 'loading'}
                  questions={promptState.questions}
                  onRefine={handleRefinementRequest}
                  basePrompt={promptState.basePrompt}
              />
          )}
          {promptState.stage === 'error' && error && (
            <div className="text-center bg-red-50 dark:bg-red-900/20 backdrop-blur-sm p-10 rounded-xl border border-red-200 dark:border-red-500/30 max-w-2xl">
                <div className="flex justify-center mb-4">
                    <AlertTriangleIcon className="w-12 h-12 text-red-500 dark:text-red-400"/>
                </div>
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">An Error Occurred</h2>
                <p className="text-md text-red-700 dark:text-red-300 mb-6">
                    {error}
                </p>
                <button
                    onClick={handleCloseModal}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                    Start Over
                </button>
            </div>
          )}
        </main>
      </div>
      
      {isLoggingEnabled && 
        <DebugPanel 
          logs={debugLogs}
          onClear={() => setDebugLogs([])}
        />
      }

      <PromptResultsModal
        isOpen={promptState.stage === 'final'}
        onClose={handleCloseModal}
        originalPrompt={promptState.basePrompt}
        finalPrompts={promptState.finalPrompts}
        theme={theme}
        addToast={addToast}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
          setIsApiKeyModalOpen(false);
          setPendingPrompt(null);
        }}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  );
};

export default App;