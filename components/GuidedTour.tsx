import React, { useState, useLayoutEffect } from 'react';
import { TourStep } from '../types';
import { XIcon } from './icons';

interface GuidedTourProps {
  isOpen: boolean;
  steps: TourStep[];
  currentStepIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  steps,
  currentStepIndex,
  onNext,
  onPrev,
  onFinish,
}) => {
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);

  const currentStep = steps[currentStepIndex];
  const isFinalStep = currentStepIndex === steps.length - 1;

  useLayoutEffect(() => {
    if (!isOpen || !currentStep) return;

    let positionTimer: number;

    if (currentStep.targetId === 'final-tour-step') {
      setTargetPosition(null);
      return;
    }

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        // Scroll the element into view so the user can see it.
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
        
        // After a delay to allow the scroll animation, calculate the final position for the highlight.
        positionTimer = window.setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        }, 300);
      } else {
        setTargetPosition(null);
      }
    };
    
    // Delay waiting for UI to update (e.g., collapsible sections opening) before scrolling.
    const renderTimer = window.setTimeout(updatePosition, 150);
    
    const handleResize = () => {
        const element = document.getElementById(currentStep.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setTargetPosition({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(renderTimer);
      clearTimeout(positionTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, currentStep]);

  if (!isOpen) {
    return null;
  }

  const tooltipStyle: React.CSSProperties = {};
  if (targetPosition) {
    const spaceBelow = window.innerHeight - (targetPosition.top + targetPosition.height);
    const tooltipHeightEstimate = 150;

    if (spaceBelow < tooltipHeightEstimate && targetPosition.top > tooltipHeightEstimate) {
      // Not enough space below, place it above
      tooltipStyle.bottom = `${window.innerHeight - targetPosition.top + 12}px`;
    } else {
      // Default to below
      tooltipStyle.top = `${targetPosition.top + targetPosition.height + 12}px`;
    }

    const tooltipWidth = 320;
    if (targetPosition.left + tooltipWidth > window.innerWidth) {
        // Align right if it overflows
        tooltipStyle.right = `1rem`;
    } else {
        tooltipStyle.left = `${targetPosition.left}px`;
    }
    tooltipStyle.maxWidth = `${tooltipWidth}px`;
  }
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0"
        style={{
             boxShadow: targetPosition ? `0 0 0 9999px rgba(0,0,0,0.6)` : 'none',
             backgroundColor: targetPosition ? 'transparent' : 'rgba(0,0,0,0.5)',
             backdropFilter: targetPosition ? 'none' : 'blur(4px)',
             transition: 'background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out'
        }}
        onClick={onFinish}
      ></div>

      {/* Highlighted element */}
      {targetPosition && (
          <div
            className="absolute bg-transparent rounded-md"
            style={{
              top: `${targetPosition.top - 4}px`,
              left: `${targetPosition.left - 4}px`,
              width: `${targetPosition.width + 8}px`,
              height: `${targetPosition.height + 8}px`,
              boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.8), 0 0 0 9999px rgba(0,0,0,0.6)',
              transition: 'all 0.3s ease-in-out',
            }}
          />
      )}
      
      {/* Tooltip or Centered Modal */}
      <div
        style={targetPosition ? tooltipStyle : {}}
        className={`absolute z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${!targetPosition ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{currentStep.content}</p>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">{currentStepIndex + 1} / {steps.length}</span>
             <button onClick={onFinish} className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
                Skip Tour
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {currentStepIndex > 0 && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={isFinalStep ? onFinish : onNext}
              className="px-3 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors"
            >
              {isFinalStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;