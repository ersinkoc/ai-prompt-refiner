# GEMINI.md: AI Prompt Refiner

This document provides a comprehensive overview of the AI Prompt Refiner project, its architecture, and development conventions to be used as instructional context for future interactions.

## 1. Project Overview

The "AI Prompt Refiner" is a web application designed to help users transform basic ideas into well-structured, effective prompts for AI models. It employs a conversational interface where the Gemini AI asks clarifying questions to collaboratively build a high-quality final prompt with the user.

### Key Technologies

*   **Frontend Framework:** React with TypeScript
*   **Build Tool:** Vite
*   **AI Integration:** Google Gemini API (`@google/genai`)
*   **Styling:** Tailwind CSS (inferred from class names like `dark:`, `flex`, `p-6`)
*   **State Management:** React Hooks (`useState`, `useEffect`) for local component state and app-wide state managed in `App.tsx`.

### Architecture

The application follows a component-based architecture:

*   **`App.tsx`**: The root component that manages the main application state, including the refinement process, history, API key, and theme.
*   **`components/`**: Contains reusable UI components.
    *   `EnhancerPanel.tsx`: The main side panel where users input their initial prompt, configure settings, and view history.
    *   `RefinementView.tsx`: The core interactive view where the AI's questions are displayed and the user provides answers.
    *   `EnhancementResults.tsx`: A modal to display the final generated prompts.
    *   `geminiService.ts`: A dedicated service to handle all communication with the Google Gemini API, including constructing the request with system instructions and conversation history.
    *   `apiKeyService.ts` & `tourService.ts`: Services for managing the user's API key and guided tour status in `localStorage`.
*   **`types.ts`**: Defines the TypeScript types and interfaces used throughout the application (e.g., `PromptHistoryItem`, `RefinementQuestion`).

## 2. Building and Running

The project uses `npm` for package management and `vite` as the development server and build tool.

### Prerequisites

*   Node.js and npm
*   A Gemini API Key

### Setup and Execution

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set API Key:**
    Create a `.env.local` file in the project root and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run the Development Server:**
    This command starts the Vite dev server, typically on `http://localhost:3000`.
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    This command transpiles the TypeScript/React code and bundles it for production in the `dist/` directory.
    ```bash
    npm run build
    ```

5.  **Preview the Production Build:**
    This command serves the `dist/` folder to let you preview the production build locally.
    ```bash
    npm run preview
    ```

## 3. Development Conventions

*   **State Management:** Global state (like history, settings, and the core prompt refinement flow) is centralized in the `App.tsx` component and passed down to child components via props.
*   **Styling:** Utility-first styling is managed by Tailwind CSS. A dark mode is supported, controlled by a class on the `html` element.
*   **Services:** Business logic that interacts with external services or browser storage (like the Gemini API or `localStorage`) is abstracted into functions within the `services/` directory.
*   **Type Safety:** The project is written in TypeScript. Type definitions for shared data structures are collocated in `types.ts`.
*   **API Interaction:** All interactions with the Gemini API are handled by `services/geminiService.ts`. It uses the `responseSchema` feature to ensure the AI's output is a predictable JSON structure, which simplifies client-side logic.
*   **User Data Persistence:** Prompt history and the user's API key are persisted in the browser's `localStorage`.
