import React, { useState } from 'react';
import { DebugLog } from '../types';
import { TerminalIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

interface DebugPanelProps {
  logs: DebugLog[];
  onClear: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ logs, onClear }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getLogColor = (type: DebugLog['type']) => {
        switch(type) {
            case 'request': return 'text-cyan-400';
            case 'response': return 'text-green-400';
            case 'error': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700/50 shadow-2xl">
      <header
        onClick={() => setIsExpanded(p => !p)}
        className="flex justify-between items-center p-2 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
            <TerminalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">Debug Console</h3>
        </div>
        <div className="flex items-center space-x-2">
          {logs.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="flex items-center space-x-1 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              title="Clear logs"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <button
              className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700"
              title={isExpanded ? "Collapse" : "Expand"}
          >
              {isExpanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[30vh]' : 'max-h-0'}`}>
        <div className="overflow-y-auto h-full bg-gray-800 dark:bg-black p-4 font-mono text-xs text-gray-300">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. API logging is currently enabled.</p>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 pb-2 last:border-b-0">
                  <p>
                    <span className="text-gray-500">{log.timestamp}</span>
                    {' '}
                    <span className={`${getLogColor(log.type)} font-bold`}>
                      [{log.type.toUpperCase()}]
                    </span>
                  </p>
                  <pre className="whitespace-pre-wrap break-all mt-1">
                    <code>{JSON.stringify(log.data, null, 2)}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;