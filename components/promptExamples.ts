import { PromptExample } from '../types';

export const promptExamples: PromptExample[] = [
  {
    title: 'Generate a Custom React Hook',
    description: 'Create a reusable hook for fetching data that handles loading, error, and data states.',
    prompt: 'Create a custom React hook in TypeScript called `useFetch`. It should accept a URL as an argument and manage the data fetching lifecycle, including loading, error, and final data states. The hook should return an object with `{ data, isLoading, error }`. Use the Fetch API for the request.'
  },
  {
    title: 'Debug a Python Traceback',
    description: 'Analyze a Python error message to find the root cause and suggest a solution.',
    prompt: `I have a Python script that is failing. Analyze the following traceback, explain the likely cause of the "TypeError", and suggest a specific code change to fix the issue.

Traceback:
\`\`\`
Traceback (most recent call last):
  File "main.py", line 15, in <module>
    result = calculate_sum(data)
  File "main.py", line 8, in calculate_sum
    total = total + item
TypeError: unsupported operand type(s) for +: 'int' and 'str'
\`\`\`
`
  },
  {
    title: 'Optimize a SQL Query',
    description: 'Improve the performance of a slow SQL query by adding appropriate indexes.',
    prompt: `The following SQL query is running slowly on a large 'users' table in PostgreSQL. Analyze the query and the table structure, then suggest the most effective index to add to improve its performance. Explain why your suggested index would help.

Query:
\`\`\`sql
SELECT * FROM users WHERE email LIKE '%@example.com' AND status = 'active';
\`\`\`

Table Structure:
\`\`\`sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP
);
\`\`\`
`
  },
  {
    title: 'Write a Dockerfile for a Node.js App',
    description: 'Create a multi-stage Dockerfile for a production-ready Node.js application.',
    prompt: 'Write a multi-stage Dockerfile for a Node.js Express application. The first stage should build the application by installing dependencies (including devDependencies) and running a build script. The final stage should be a lean, production-ready image that only copies over the necessary build artifacts and production dependencies from the builder stage. Use an Alpine-based Node image for the final stage to minimize size.'
  },
  {
    title: 'Configure a CI/CD Pipeline',
    description: 'Generate a basic GitHub Actions workflow file for a typical CI process.',
    prompt: `Generate a YAML configuration file for a GitHub Actions workflow named "CI Pipeline". This workflow should trigger on every push to the 'main' branch. It needs to perform the following jobs:
1.  Check out the repository's code.
2.  Set up Node.js version 18.
3.  Install project dependencies using 'npm ci'.
4.  Run the linter using 'npm run lint'.
5.  Run unit tests using 'npm run test'.`
  },
];
