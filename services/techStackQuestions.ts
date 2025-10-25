import { RefinementQuestion, QuestionType, TechStackContext } from '../types';

export const techStackQuestions: Record<string, TechStackContext> = {
  // React Stack
  'React': {
    stacks: ['React'],
    contextualQuestions: [
      {
        id: 'react-version',
        type: QuestionType.SPECIFICATION,
        question: "Which React version are you working with?",
        answers: ['React 18+', 'React 17', 'React 16', 'Not sure'],
        allowCustom: true,
        required: false,
        followUpQuestions: ['Are you using Hooks or Class Components?']
      },
      {
        id: 'react-architecture',
        type: QuestionType.SPECIFICATION,
        question: "What's your preferred React architecture?",
        answers: ['Functional Components with Hooks', 'Class Components', 'Mixed approach'],
        allowCustom: true,
        dependsOn: ['react-version'],
        required: true
      },
      {
        id: 'react-state',
        type: QuestionType.SPECIFICATION,
        question: "How do you plan to manage state?",
        answers: ['useState + useReducer', 'Redux Toolkit', 'Zustand', 'Context API', 'External state management'],
        allowCustom: true,
        dependsOn: ['react-architecture']
      }
    ],
    bestPractices: [
      "Use functional components with hooks",
      "Implement proper TypeScript typing",
      "Follow React best practices for performance",
      "Consider code splitting for larger apps"
    ],
    commonIssues: [
      "Props typing with TypeScript",
      "State management patterns",
      "Component re-rendering optimization",
      "Hook dependency arrays"
    ]
  },

  // TypeScript Stack
  'TypeScript': {
    stacks: ['TypeScript'],
    contextualQuestions: [
      {
        id: 'typescript-experience',
        type: QuestionType.SPECIFICATION,
        question: "What's your TypeScript experience level?",
        answers: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        required: true
      },
      {
        id: 'typescript-strictness',
        type: QuestionType.SPECIFICATION,
        question: "How strict should TypeScript configuration be?",
        answers: ['Very strict (all strict checks)', 'Moderately strict', 'Lenient mode'],
        dependsOn: ['typescript-experience']
      },
      {
        id: 'typescript-features',
        type: QuestionType.SPECIFICATION,
        question: "Which TypeScript features are most important?",
        answers: ['Type safety only', 'Advanced types (generics, utilities)', 'Decorators', 'All features'],
        allowCustom: true,
        dependsOn: ['typescript-experience']
      }
    ],
    bestPractices: [
      "Use interfaces over types for object shapes",
      "Leverage TypeScript's type inference",
      "Create proper generic types",
      "Use strict mode configurations"
    ],
    commonIssues: [
      "Typing React props",
      "Generic type parameters",
      "Union and intersection types",
      "Type assertion vs type guards"
    ]
  },

  // Node.js Stack
  'Node.js': {
    stacks: ['Node.js'],
    contextualQuestions: [
      {
        id: 'nodejs-version',
        type: QuestionType.SPECIFICATION,
        question: "Which Node.js version are you targeting?",
        answers: ['Node.js 20+ (LTS)', 'Node.js 18 (LTS)', 'Node.js 16 (LTS)', 'Latest version'],
        required: true
      },
      {
        id: 'nodejs-framework',
        type: QuestionType.SPECIFICATION,
        question: "What Node.js framework are you using?",
        answers: ['Express.js', 'Fastify', 'Koa.js', 'NestJS', 'Hapi.js', 'Custom/Other'],
        allowCustom: true,
        dependsOn: ['nodejs-version']
      },
      {
        id: 'nodejs-purpose',
        type: QuestionType.SCENARIO,
        question: "What's the main purpose of your Node.js application?",
        answers: ['REST API', 'GraphQL API', 'Microservices', 'CLI tool', 'Web scraping', 'Data processing'],
        allowCustom: true,
        dependsOn: ['nodejs-framework']
      }
    ],
    bestPractices: [
      "Use async/await over callbacks",
      "Implement proper error handling",
      "Use environment variables for configuration",
      "Follow Node.js security best practices"
    ],
    commonIssues: [
      "Callback hell vs Promises",
      "Error handling patterns",
      "Memory management",
      "Performance optimization"
    ]
  },

  // Python Stack
  'Python': {
    stacks: ['Python'],
    contextualQuestions: [
      {
        id: 'python-version',
        type: QuestionType.SPECIFICATION,
        question: "Which Python version are you using?",
        answers: ['Python 3.11+', 'Python 3.10', 'Python 3.9', 'Python 3.8', 'Not sure'],
        required: true
      },
      {
        id: 'python-framework',
        type: QuestionType.SPECIFICATION,
        question: "What Python framework/library are you working with?",
        answers: ['Django', 'Flask', 'FastAPI', 'Streamlit', 'Pandas/NumPy', 'Custom script'],
        allowCustom: true,
        dependsOn: ['python-version']
      },
      {
        id: 'python-usecase',
        type: QuestionType.SCENARIO,
        question: "What type of Python development are you doing?",
        answers: ['Web development', 'Data science', 'Machine learning', 'Automation scripting', 'CLI tool', 'API development'],
        allowCustom: true,
        dependsOn: ['python-framework']
      }
    ],
    bestPractices: [
      "Use type hints for better code documentation",
      "Follow PEP 8 style guidelines",
      "Use virtual environments for dependency management",
      "Implement proper exception handling"
    ],
    commonIssues: [
      "Dependency management with pip/poetry",
      "Virtual environment setup",
      "Type hinting best practices",
      "Performance optimization"
    ]
  },

  // Testing Stack
  'Testing': {
    stacks: ['Jest', 'Vitest', 'PyTest', 'Cypress', 'Playwright'],
    contextualQuestions: [
      {
        id: 'testing-type',
        type: QuestionType.SPECIFICATION,
        question: "What type of testing do you need?",
        answers: ['Unit testing only', 'Integration testing', 'E2E testing', 'Full testing suite'],
        required: true
      },
      {
        id: 'testing-framework',
        type: QuestionType.SPECIFICATION,
        question: "Which testing framework are you using?",
        answers: ['Jest', 'Vitest', 'PyTest', 'Mocha', 'Jasmine', 'Custom/Other'],
        allowCustom: true,
        dependsOn: ['testing-type']
      },
      {
        id: 'testing-coverage',
        type: QuestionType.SPECIFICATION,
        question: "What's your target test coverage?",
        answers: ['Above 90%', '70-90%', '50-70%', 'Just critical paths'],
        dependsOn: ['testing-framework']
      }
    ],
    bestPractices: [
      "Write descriptive test names",
      "Follow AAA (Arrange-Act-Assert) pattern",
      "Mock external dependencies properly",
      "Test edge cases and error scenarios"
    ],
    commonIssues: [
      "Mock setup and teardown",
      "Async testing patterns",
      "Test data management",
      "Coverage requirements"
    ]
  },

  // Docker Stack
  'Docker': {
    stacks: ['Docker'],
    contextualQuestions: [
      {
        id: 'docker-purpose',
        type: QuestionType.SCENARIO,
        question: "What's the main purpose of using Docker?",
        answers: ['Development environment', 'Production deployment', 'CI/CD pipeline', 'Microservices'],
        required: true
      },
      {
        id: 'docker-type',
        type: QuestionType.SPECIFICATION,
        question: "What type of Docker setup do you need?",
        answers: ['Single container application', 'Multi-container with Docker Compose', 'Kubernetes deployment', 'Development environment only'],
        dependsOn: ['docker-purpose']
      },
      {
        id: 'docker-base-image',
        type: QuestionType.SPECIFICATION,
        question: "What base image preference do you have?",
        answers: ['Alpine Linux (lightweight)', 'Ubuntu/Debian (full-featured)', 'Distroleless (minimal)', 'Official language images'],
        dependsOn: ['docker-type']
      }
    ],
    bestPractices: [
      "Use multi-stage builds for smaller images",
      "Minimize layer count",
      "Use .dockerignore files",
      "Don't run as root user"
    ],
    commonIssues: [
      "Image size optimization",
      "Volume mounting",
      "Network configuration",
      "Environment variable management"
    ]
  },

  // Database Stack
  'PostgreSQL': {
    stacks: ['PostgreSQL'],
    contextualQuestions: [
      {
        id: 'postgres-version',
        type: QuestionType.SPECIFICATION,
        question: "Which PostgreSQL version are you using?",
        answers: ['PostgreSQL 15+', 'PostgreSQL 14', 'PostgreSQL 13', 'Older version'],
        required: true
      },
      {
        id: 'postgres-usecase',
        type: QuestionType.SCENARIO,
        question: "What's your primary use case for PostgreSQL?",
        answers: ['OLTP application', 'Analytics/Reporting', 'Hybrid workload', 'JSON document storage'],
        dependsOn: ['postgres-version']
      },
      {
        id: 'postgres-orm',
        type: QuestionType.SPECIFICATION,
        question: "How are you interacting with PostgreSQL?",
        answers: ['Prisma', 'TypeORM', 'Sequelize', 'SQLAlchemy', 'Raw SQL', 'Other ORM'],
        allowCustom: true,
        dependsOn: ['postgres-usecase']
      }
    ],
    bestPractices: [
      "Use appropriate indexes for query performance",
      "Implement proper connection pooling",
      "Use transactions for data consistency",
      "Regular database maintenance"
    ],
    commonIssues: [
      "Query optimization",
      "Connection management",
      "Indexing strategies",
      "Migration management"
    ]
  }
};

// Combined stack contexts for popular combinations
export const combinedStackContexts: Record<string, TechStackContext> = {
  'React+TypeScript': {
    stacks: ['React', 'TypeScript'],
    contextualQuestions: [
      {
        id: 'react-typescript-setup',
        type: QuestionType.SPECIFICATION,
        question: "How are you setting up React with TypeScript?",
        answers: ['Create React App (TypeScript template)', 'Vite + React + TypeScript', 'Next.js', 'Custom Webpack config'],
        required: true
      },
      {
        id: 'react-typescript-state',
        type: QuestionType.SPECIFICATION,
        question: "How will you handle state typing?",
        answers: ['Strict typing with interfaces', 'Type inference preferred', 'Mixed approach', 'Custom typing utilities'],
        dependsOn: ['react-typescript-setup']
      }
    ],
    bestPractices: [
      "Use React.FC for functional components",
      "Type props with interfaces",
      "Use proper generic types for hooks",
      "Leverage TypeScript for component prop validation"
    ],
    commonIssues: [
      "Typing children props",
      "Generic component patterns",
      "Event handler typing",
      "Context provider typing"
    ]
  },

  'Node.js+Express': {
    stacks: ['Node.js', 'Express.js'],
    contextualQuestions: [
      {
        id: 'express-typescript',
        type: QuestionType.SPECIFICATION,
        question: "Are you using TypeScript with Express?",
        answers: ['Yes, full TypeScript setup', 'JavaScript with JSDoc', 'Pure JavaScript'],
        required: true
      },
      {
        id: 'express-architecture',
        type: QuestionType.SPECIFICATION,
        question: "What's your Express application architecture?",
        answers: ['MVC pattern', 'Modular with routers', 'Microservices', 'Simple monolith'],
        dependsOn: ['express-typescript']
      }
    ],
    bestPractices: [
      "Use Express Router for organization",
      "Implement middleware properly",
      "Use async/await with error handling",
      "Environment-based configuration"
    ],
    commonIssues: [
      "Async middleware error handling",
      "Request/response typing",
      "Route organization",
      "Middleware order"
    ]
  },

  'React+Node.js': {
    stacks: ['React', 'Node.js'],
    contextualQuestions: [
      {
        id: 'fullstack-type',
        type: QuestionType.SPECIFICATION,
        question: "What type of full-stack application are you building?",
        answers: ['SPA with REST API', 'SSR application', 'Static site generation', 'Real-time application'],
        required: true
      },
      {
        id: 'fullstack-deployment',
        type: QuestionType.SPECIFICATION,
        question: "How will you deploy this application?",
        answers: ['Monolithic deployment', 'Separate frontend/backend', 'Serverless functions', 'Containerized deployment'],
        dependsOn: ['fullstack-type']
      }
    ],
    bestPractices: [
      "API versioning",
      "CORS configuration",
      "Authentication between services",
      "Error handling across layers"
    ],
    commonIssues: [
      "CORS configuration",
      "Authentication flow",
      "API communication patterns",
      "Deployment strategy"
    ]
  }
};

// Helper function to get contextual questions based on selected stacks
export const getContextualQuestions = (selectedStacks: string[]): RefinementQuestion[] => {
  const questions: RefinementQuestion[] = [];

  // Check for stack combinations first
  const stackCombo = selectedStacks.sort().join('+');
  if (combinedStackContexts[stackCombo]) {
    questions.push(...combinedStackContexts[stackCombo].contextualQuestions);
  }

  // Add individual stack questions
  selectedStacks.forEach(stack => {
    if (techStackQuestions[stack]) {
      questions.push(...techStackQuestions[stack].contextualQuestions);
    }
  });

  // Sort questions by dependencies
  return sortQuestionsByDependencies(questions);
};

// Helper function to sort questions based on dependencies
const sortQuestionsByDependencies = (questions: RefinementQuestion[]): RefinementQuestion[] => {
  const sorted: RefinementQuestion[] = [];
  const remaining = [...questions];

  while (remaining.length > 0) {
    const questionsWithoutDeps = remaining.filter(q =>
      !q.dependsOn || q.dependsOn.every(dep =>
        sorted.some(sortedQ => sortedQ.id === dep)
      )
    );

    if (questionsWithoutDeps.length === 0) {
      // If we have circular dependencies or orphaned questions, add them anyway
      sorted.push(...remaining);
      break;
    }

    sorted.push(...questionsWithoutDeps);
    questionsWithoutDeps.forEach(q => {
      const index = remaining.indexOf(q);
      if (index > -1) remaining.splice(index, 1);
    });
  }

  return sorted;
};

// Get best practices for selected stacks
export const getBestPractices = (selectedStacks: string[]): string[] => {
  const practices: string[] = [];

  selectedStacks.forEach(stack => {
    if (techStackQuestions[stack]) {
      practices.push(...techStackQuestions[stack].bestPractices);
    }
  });

  // Check for combined stack practices
  const stackCombo = selectedStacks.sort().join('+');
  if (combinedStackContexts[stackCombo]) {
    practices.push(...combinedStackContexts[stackCombo].bestPractices);
  }

  return [...new Set(practices)]; // Remove duplicates
};

// Get common issues for selected stacks
export const getCommonIssues = (selectedStacks: string[]): string[] => {
  const issues: string[] = [];

  selectedStacks.forEach(stack => {
    if (techStackQuestions[stack]) {
      issues.push(...techStackQuestions[stack].commonIssues);
    }
  });

  // Check for combined stack issues
  const stackCombo = selectedStacks.sort().join('+');
  if (combinedStackContexts[stackCombo]) {
    issues.push(...combinedStackContexts[stackCombo].commonIssues);
  }

  return [...new Set(issues)]; // Remove duplicates
};