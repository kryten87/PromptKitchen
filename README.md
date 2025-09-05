# Prompt Kitchen

## Overview

Prompt Kitchen is a web-based application designed to streamline the development, testing, and iteration of large language model (LLM) prompts. It provides a structured environment for prompt engineers and developers to write, test, and refine prompts, ensuring they meet quality and accuracy standards before deployment.

The application allows users to:

- Organize work into projects.
- Create and manage prompts with full version history.
- Build comprehensive test suites with multiple test cases.
- Define test case inputs and expected outputs.
- Use simple exact-match validation or advanced, Jest-style assertions for flexible testing.
- Execute prompts against an LLM and receive clear pass/fail feedback.

## Key Features

- **Project Management**: Create, edit, and delete projects to organize your work.
- **Prompt Management**: Write prompts using `{{variable}}` syntax for templating. All changes are versioned, and you can view or restore previous versions.
- **Test Suite Management**: Group related tests into suites for each prompt.
- **Advanced Assertions**: Go beyond simple string matching. Define multiple assertions per test case using **JSONPath** to target specific parts of an LLM's output. Use familiar matchers like `toEqual`, `toContain`, `toMatch`, and `toBeOneOf`, complete with a `not` modifier for negation.
- **Asynchronous Execution**: Run test suites against the OpenAI API. The application polls for results, allowing you to continue working without waiting.
- **Clear Results**: View a detailed breakdown of pass/fail status for each test case and each individual assertion.
- **Secure Authentication**: User authentication is handled securely via Google OAuth.

## Technology Stack

The project is a TypeScript monorepo built with modern web technologies.

| Component           | Technology                    |
| ------------------- | ----------------------------- |
| **Language**        | TypeScript                    |
| **Monorepo**        | npm Workspaces                |
| **Backend**         | Fastify on NodeJS             |
| **Frontend**        | React with Vite               |
| **Styling**         | Tailwind CSS                  |
| **Database**        | SQLite3                       |
| **Testing**         | Jest (Unit), Playwright (E2E) |
| **Linting**         | ESLint                        |
| **Package Manager** | npm                           |

## Project Structure

The monorepo is organized into the following packages:

- `packages/backend`: The Fastify backend server, handling API requests, database interactions, and LLM communication.
- `packages/frontend`: The React single-page application that provides the user interface.
- `packages/shared`: Code shared between the frontend and backend, including DTOs, validation schemas, and evaluation logic.
- `packages/e2e`: End-to-end tests for validating critical user flows.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version specified in `.nvmrc`)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd prompt-kitchen
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Copy the example environment file for the backend:

    ```bash
    cp packages/backend/.env.example packages/backend/.env
    ```

    Edit `packages/backend/.env` and fill in the required values, such as your `OPENAI_API_KEY` and Google OAuth credentials.

### Running the Development Server

To start the frontend and backend servers concurrently in development mode, run:

```bash
npm run dev
```

This will:

- Start the backend server with hot-reloading.
- Start the frontend Vite development server.
- The application will be available at `http://localhost:5173`.

## Development Commands

The following commands are available for development and testing.

- **Check all packages (build, lint, test):**

  ```bash
  npm run check
  ```

- **Run all tests:**

  ```bash
  npm test
  ```

- **Run a single backend test:**

  ```bash
  npm --workspace=packages/backend test -- <path/to/test.spec.ts>
  ```

- **Run a single frontend test:**

  ```bash
  npm --workspace=packages/frontend test -- <path/to/test.spec.tsx>
  ```

- **Lint all packages:**
  ```bash
  npm run lint --workspaces
  ```
