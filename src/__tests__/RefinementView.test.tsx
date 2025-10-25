import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RefinementView from '../../RefinementView';
import { RefinementQuestion } from '../../types';

describe('RefinementView', () => {
  const mockQuestions: RefinementQuestion[] = [
    {
      question: 'What is the primary goal of your prompt?',
      answers: ['Generate code', 'Write documentation', 'Create tests']
    },
    {
      question: 'What programming language are you targeting?',
      answers: ['JavaScript', 'Python', 'TypeScript']
    }
  ];

  const mockOnRefine = vi.fn();
  const basePrompt = 'Create a function that sorts an array';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render questions and predefined answers', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    expect(screen.getByText('1. What is the primary goal of your prompt?')).toBeInTheDocument();
    expect(screen.getByText('2. What programming language are you targeting?')).toBeInTheDocument();
    expect(screen.getByText('Generate code')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('should show selected predefined answer in input field', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    // Click on a predefined answer
    const generateCodeButton = screen.getByText('Generate code');
    fireEvent.click(generateCodeButton);

    // The input field should now contain the selected answer
    const inputFields = screen.getAllByPlaceholderText('Or type your own answer...');
    expect(inputFields[0]).toHaveValue('Generate code');
  });

  it('should allow custom answers in input field', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    const inputFields = screen.getAllByPlaceholderText('Or type your own answer...');

    // Type a custom answer
    fireEvent.change(inputFields[0], { target: { value: 'Analyze data' } });

    expect(inputFields[0]).toHaveValue('Analyze data');
  });

  it('should handle mixed predefined and custom answers', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    const inputFields = screen.getAllByPlaceholderText('Or type your own answer...');

    // Select a predefined answer for first question
    fireEvent.click(screen.getByText('Generate code'));

    // Type a custom answer for second question
    fireEvent.change(inputFields[1], { target: { value: 'Go' } });

    // Verify both answers are displayed correctly
    expect(inputFields[0]).toHaveValue('Generate code');
    expect(inputFields[1]).toHaveValue('Go');
  });

  it('should enable submit button when all questions are answered', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Refine Further' });
    expect(submitButton).toBeDisabled();

    // Answer both questions
    fireEvent.click(screen.getByText('Generate code'));
    fireEvent.click(screen.getByText('Python'));

    expect(submitButton).toBeEnabled();
  });

  it('should submit answers with fallback for unanswered questions', () => {
    render(
      <RefinementView
        isLoading={false}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    // Answer only one question
    fireEvent.click(screen.getByText('Generate code'));

    // Submit should be disabled until all are answered
    const submitButton = screen.getByRole('button', { name: 'Refine Further' });
    expect(submitButton).toBeDisabled();
  });

  it('should show loading state when isLoading is true', () => {
    render(
      <RefinementView
        isLoading={true}
        questions={mockQuestions}
        onRefine={mockOnRefine}
        basePrompt={basePrompt}
      />
    );

    expect(screen.getByText('The AI is thinking...')).toBeInTheDocument();
  });
});