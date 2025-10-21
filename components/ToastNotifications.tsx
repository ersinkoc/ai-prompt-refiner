import React from 'react';
import { ToastNotification } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from './icons';

interface ToastNotificationsProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <AlertTriangleIcon className="w-6 h-6 text-red-500" />,
  info: <InfoIcon className="w-6 h-6 text-blue-500" />,
};

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-0 right-0 p-4 space-y-2 z-[100]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 overflow-hidden flex"
        >
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0">
              {icons[toast.type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => onDismiss(toast.id)}
                className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications;
