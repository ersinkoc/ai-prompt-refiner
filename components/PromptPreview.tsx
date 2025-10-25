import React, { useState, useEffect } from 'react';
import { UserAnswer, FocusArea } from '../types';
import { CopyIcon, EyeIcon, SparklesIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';

interface PromptPreviewProps {
  basePrompt: string;
  conversationHistory: UserAnswer[];
  selectedStacks: string[];
  focusAreas: FocusArea[];
  complexity: 'basic' | 'detailed' | 'comprehensive';
  outputStyle: 'professional' | 'casual' | 'technical' | 'educational';
  isOpen: boolean;
  onClose: () => void;
}

interface QualityMetrics {
  clarity: number;
  specificity: number;
  completeness: number;
  overall: number;
}

interface PromptSection {
  id: string;
  type: 'context' | 'requirements' | 'constraints' | 'examples' | 'format';
  content: string;
  editable: boolean;
  order: number;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({
  basePrompt,
  conversationHistory,
  selectedStacks,
  focusAreas,
  complexity,
  outputStyle,
  isOpen,
  onClose
}) => {
  const [promptPreview, setPromptPreview] = useState<string>('');
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics>({
    clarity: 0,
    specificity: 0,
    completeness: 0,
    overall: 0
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Generate real-time preview
  const generatePreview = () => {
    setIsGenerating(true);

    let preview = '# Refined Prompt\n\n';

    // Add context section
    preview += '## Context\n';
    preview += `**Base Idea:** ${basePrompt}\n\n`;

    if (selectedStacks.length > 0) {
      preview += '**Technology Stack:** ' + selectedStacks.join(', ') + '\n\n';
    }

    // Add conversation insights
    if (conversationHistory.length > 0) {
      preview += '## Refinement Insights\n';
      conversationHistory.forEach((answer, index) => {
        preview += `**${index + 1}. ${answer.questionType}:**\n`;
        preview += `Q: ${answer.question}\n`;
        preview += `A: ${answer.answer}\n\n`;
      });
    }

    // Add requirements based on complexity
    preview += '## Requirements\n';
    switch (complexity) {
      case 'basic':
        preview += '- Clear and straightforward instructions\n';
        preview += '- Simple, actionable steps\n';
        preview += '- Basic context information\n';
        break;
      case 'detailed':
        preview += '- Comprehensive instructions with context\n';
        preview += '- Multiple implementation options\n';
        preview += '- Detailed constraints and requirements\n';
        preview += '- Best practices and examples\n';
        break;
      case 'comprehensive':
        preview += '- Expert-level detailed instructions\n';
        preview += '- Multiple implementation approaches\n';
        preview += '- Detailed constraints and edge cases\n';
        preview += '- Comprehensive examples and best practices\n';
        preview += '- Error handling and optimization tips\n';
        preview += '- Advanced techniques and patterns\n';
        break;
    }

    // Add focus area specific requirements
    const enabledFocusAreas = focusAreas.filter(area => area.enabled);
    if (enabledFocusAreas.length > 0) {
      preview += '\n## Focus Areas\n';
      enabledFocusAreas.forEach(area => {
        preview += `- **${area.name}** (Weight: ${area.weight})\n`;

        switch (area.id) {
          case 'technical':
            preview += '  - Technical specifications and implementation details\n';
            preview += '  - Code examples and patterns\n';
            preview += '  - Architecture and design considerations\n';
            break;
          case 'business':
            preview += '  - Business requirements and objectives\n';
            preview += '  - User stories and acceptance criteria\n';
            preview += '  - Stakeholder considerations\n';
            break;
          case 'examples':
            preview += '  - Practical examples and use cases\n';
            preview += '  - Sample inputs and outputs\n';
            preview += '  - Common scenarios and solutions\n';
            break;
        }
      });
    }

    // Add output style specific instructions
    preview += '\n## Output Format\n';
    preview += '**Style:** ' + outputStyle + '\n';
    switch (outputStyle) {
      case 'professional':
        preview += '- Formal and professional tone\n';
        preview += '- Structured and well-organized\n';
        preview += '- Business-appropriate language\n';
        break;
      case 'casual':
        preview += '- Conversational and friendly tone\n';
        preview += '- Easy to understand language\n';
        preview += '- Relatable examples\n';
        break;
      case 'technical':
        preview += '- Technical precision and accuracy\n';
        preview += '- Specific terminology and concepts\n';
        preview += '- Implementation-focused details\n';
        break;
      case 'educational':
        preview += '- Clear explanations and definitions\n';
        preview += '- Learning objectives and outcomes\n';
        preview += '- Progressive complexity\n';
        break;
    }

    // Add quality guidelines
    preview += '\n## Quality Guidelines\n';
    preview += '- Be specific and detailed\n';
    preview += '- Provide clear examples\n';
    preview += '- Include necessary context\n';
    preview += '- Define expected outputs\n';

    setPromptPreview(preview);
    setIsGenerating(false);

    // Simulate quality metrics calculation
    const metrics = calculateQualityMetrics(preview, conversationHistory, selectedStacks);
    setQualityMetrics(metrics);

    // Generate suggestions
    const improvementSuggestions = generateSuggestions(metrics, preview);
    setSuggestions(improvementSuggestions);
  };

  const calculateQualityMetrics = (preview: string, history: UserAnswer[], stacks: string[]): QualityMetrics => {
    let clarity = 50;
    let specificity = 50;
    let completeness = 50;

    // Calculate based on content
    if (preview.length > 200) clarity += 20;
    if (history.length >= 3) specificity += 15;
    if (stacks.length > 0) completeness += 20;
    if (preview.includes('examples')) specificity += 10;
    if (preview.includes('constraints')) completeness += 15;
    if (preview.includes('requirements')) completeness += 10;

    const overall = Math.round((clarity + specificity + completeness) / 3);

    return {
      clarity: Math.min(clarity, 100),
      specificity: Math.min(specificity, 100),
      completeness: Math.min(completeness, 100),
      overall
    };
  };

  const generateSuggestions = (metrics: QualityMetrics, preview: string): string[] => {
    const suggestions: string[] = [];

    if (metrics.clarity < 70) {
      suggestions.push('Add more specific details and examples');
    }
    if (metrics.specificity < 70) {
      suggestions.push('Include more specific requirements and constraints');
    }
    if (metrics.completeness < 70) {
      suggestions.push('Add more context about the intended use case');
    }
    if (preview.length < 300) {
      suggestions.push('Expand with more detailed instructions');
    }

    return suggestions;
  };

  const getQualityColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [basePrompt, conversationHistory, selectedStacks, focusAreas, complexity, outputStyle, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-cyan-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Prompt Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quality Metrics */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <span>Quality Assessment</span>
            <span className={`ml-3 text-sm font-medium ${getQualityColor(qualityMetrics.overall)}`}>
              {qualityMetrics.overall}% Overall
            </span>
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clarity</span>
                <span className={`text-sm font-medium ${getQualityColor(qualityMetrics.clarity)}`}>
                  {qualityMetrics.clarity}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getQualityColor(qualityMetrics.clarity).replace('text-', 'bg-')}`}
                  style={{ width: `${qualityMetrics.clarity}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Specificity</span>
                <span className={`text-sm font-medium ${getQualityColor(qualityMetrics.specificity)}`}>
                  {qualityMetrics.specificity}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getQualityColor(qualityMetrics.specificity).replace('text-', 'bg-')}`}
                  style={{ width: `${qualityMetrics.specificity}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completeness</span>
                <span className={`text-sm font-medium ${getQualityColor(qualityMetrics.completeness)}`}>
                  {qualityMetrics.completeness}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getQualityColor(qualityMetrics.completeness).replace('text-', 'bg-')}`}
                  style={{ width: `${qualityMetrics.completeness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Improvement Suggestions:</p>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Generating preview...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => copyToClipboard(promptPreview, 'full')}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <CopyIcon className="w-4 h-4" />
                  {copiedSection === 'full' ? 'Copied!' : 'Copy Full'}
                </button>
                <button
                  onClick={generatePreview}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/70 rounded-md transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Regenerate
                </button>
              </div>

              {/* Preview Text */}
              <div className="relative">
                <pre className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap">
                  {promptPreview}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {conversationHistory.length} rounds • {selectedStacks.length} technologies
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptPreview;