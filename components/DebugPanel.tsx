import React, { useState, useRef, useEffect } from 'react';
import { DebugLog } from '../types';
import { TerminalIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, CopyIcon } from './icons';

interface DebugPanelProps {
  logs: DebugLog[];
  onClear: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ logs, onClear }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const getLogColor = (type: DebugLog['type']) => {
        switch(type) {
            case 'request': return 'text-cyan-400';
            case 'response': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'retry_attempt': return 'text-yellow-400';
            case 'retry_delay': return 'text-orange-400';
            case 'parse_error': return 'text-pink-400';
            case 'fallback_success': return 'text-purple-400';
            case 'validation_fallback_success': return 'text-indigo-400';
            case 'validation_error': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const getLogIcon = (type: DebugLog['type']) => {
        switch(type) {
            case 'request': return '⬆️';
            case 'response': return '⬇️';
            case 'error': return '❌';
            case 'retry_attempt': return '🔄';
            case 'retry_delay': return '⏱️';
            case 'parse_error': return '⚠️';
            case 'fallback_success': return '✨';
            case 'validation_fallback_success': return '🔧';
            case 'validation_error': return '🚫';
            default: return '📝';
        }
    };

    const formatJsonForDisplay = (data: any): string => {
        try {
            return JSON.stringify(data, null, 2);
        } catch (error) {
            return String(data);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Brief visual feedback could be added here
        });
    };

    const scrollToLog = (index: number) => {
        setSelectedLogIndex(index);
        setTimeout(() => {
            const logElements = scrollContainerRef.current?.querySelectorAll('[data-log-index]');
            const targetElement = logElements?.[index] as HTMLElement;
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.classList.add('ring-2', 'ring-cyan-500');
                setTimeout(() => {
                    targetElement.classList.remove('ring-2', 'ring-cyan-500');
                }, 2000);
            }
        }, 100);
    };

    // ESC key handler
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isExpanded) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isExpanded]);

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 bg-gray-900 dark:bg-black border-t border-gray-700 shadow-2xl transition-all duration-300 ease-in-out ${
      isExpanded ? 'h-[60vh]' : 'h-10'
    }`}>
      {/* Header */}
      <header
        onClick={() => setIsExpanded(p => !p)}
        className="flex justify-between items-center p-3 cursor-pointer bg-gray-800 dark:bg-gray-900 border-b border-gray-700 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center space-x-3">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-sm font-semibold text-white">Debug Console</h3>
            <span className="text-xs text-gray-400">({logs.length} logs)</span>
            {logs.length > 0 && (
              <div className="flex items-center space-x-1">
                {logs.slice(-5).map((log, idx) => (
                  <span
                    key={idx}
                    className={`text-xs ${getLogColor(log.type)}`}
                    title={log.type}
                  >
                    {getLogIcon(log.type)}
                  </span>
                ))}
              </div>
            )}
        </div>
        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-all"
                title="Clear all logs"
              >
                <TrashIcon className="w-4 h-4" />
                <span className="text-xs">Clear</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation();
                  const allLogsText = logs.map(log =>
                    `[${log.type.toUpperCase()}] ${log.timestamp}\n${formatJsonForDisplay(log.data)}\n${'='.repeat(80)}`
                  ).join('\n\n');
                  copyToClipboard(allLogsText);
                }}
                className="flex items-center space-x-1 px-2 py-1 rounded-md text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-all"
                title="Copy all logs"
              >
                <CopyIcon className="w-4 h-4" />
                <span className="text-xs">Copy All</span>
              </button>
            </>
          )}
          <button
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title={isExpanded ? "Collapse (ESC)" : "Expand"}
          >
              {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Content */}
      {isExpanded && (
        <div className="flex h-[calc(100%-3.5rem)]">
          {/* Log Navigation */}
          <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Navigation</h4>
            <div className="space-y-1">
              {logs.map((log, index) => (
                <button
                  key={index}
                  onClick={() => scrollToLog(index)}
                  className={`w-full text-left p-2 rounded text-xs font-mono transition-all hover:bg-gray-700 ${
                    selectedLogIndex === index ? 'bg-cyan-900/50 text-cyan-300 border-l-2 border-cyan-400' : 'text-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{getLogIcon(log.type)}</span>
                    <span className={`truncate ${getLogColor(log.type)}`}>
                      {log.type}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[10px] mt-1 truncate">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Log Content */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto bg-black"
          >
            <div className="p-4">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <TerminalIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No logs yet. Enable API logging to see request/response data.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      data-log-index={index}
                      className={`border border-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
                        selectedLogIndex === index ? 'ring-2 ring-cyan-500/50' : ''
                      }`}
                    >
                      {/* Log Header */}
                      <div className={`bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center justify-between`}>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getLogIcon(log.type)}</span>
                          <div>
                            <span className={`font-bold ${getLogColor(log.type)} uppercase tracking-wider text-sm`}>
                              {log.type}
                            </span>
                            <span className="text-gray-500 text-xs ml-3">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(formatJsonForDisplay(log.data))}
                          className="p-1 rounded text-gray-500 hover:text-cyan-400 hover:bg-gray-800 transition-all"
                          title="Copy this log"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Log Content */}
                      <div className="bg-gray-950 p-4">
                        <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                          <code className="whitespace-pre">
                            {formatJsonForDisplay(log.data)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;