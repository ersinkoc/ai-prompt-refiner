import { PromptTemplate } from '../types';

export const promptTemplates: PromptTemplate[] = [
  {
    title: 'Write Unit Tests',
    icon: '🧪',
    prompt: 'Write comprehensive unit tests for the following [LANGUAGE] code using the [TESTING_FRAMEWORK] framework. Ensure you cover all logical paths and edge cases, such as [SPECIFIC_CASE_1] and [SPECIFIC_CASE_2]. Mock any external dependencies like API calls or database interactions.'
  },
  {
    title: 'Generate API Docs',
    icon: '📄',
    prompt: 'Generate API documentation in Markdown format for the following code snippet. Describe the endpoint, its purpose, the required parameters (including data types), the expected request body structure, and provide example success and error responses in JSON format.'
  },
  {
    title: 'Create a README',
    icon: '📖',
    prompt: 'Create a professional README.md file for a project named "[PROJECT_NAME]". Include sections for: Project Overview, Features, Getting Started (Prerequisites, Installation), Usage, Tech Stack, and Contributing Guidelines.'
  },
  {
    title: 'Refactor Code',
    icon: '🔧',
    prompt: 'Analyze the following code for potential improvements. Refactor it to improve readability, performance, and maintainability. Add comments to explain the changes and justify your refactoring decisions. The target language is [LANGUAGE].'
  },
  {
    title: 'Explain a Concept',
    icon: '🧠',
    prompt: 'Explain the concept of [CONCEPT] in simple terms, as if you were talking to a junior developer. Provide a clear definition, a real-world analogy, and a concise code example in [LANGUAGE] to illustrate its practical application.'
  },
  {
    title: 'Write Git Commit Message',
    icon: '💬',
    prompt: 'Write a git commit message following the Conventional Commits specification. The change involves [TYPE_OF_CHANGE, e.g., feat, fix, chore] and a brief summary is "[SUMMARY_OF_CHANGE]". The body should provide more context about the problem and the solution.'
  },
];
