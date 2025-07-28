# Prompt Kitchen - Detailed Task List

This document outlines the step-by-step tasks required to build the Prompt Kitchen application, based on the `PRD.md`.

---

## Phase 1: Project Scaffolding & Setup

### 1.1. Monorepo Setup
- ✅ 1.1.1. Initialize an npm project in the root directory (`npm init -y`).
- ✅ 1.1.2. Create a `packages` directory.
- ✅ 1.1.3. Configure npm workspaces in the root `package.json`.
- ✅ 1.1.4. Add a root-level `tsconfig.json` for shared settings.
- ✅ 1.1.5. Set up ESLint and Prettier in the root with shared configurations.

### 1.2. Shared Package Setup
- ✅ 1.2.1. Create the `packages/shared` directory.
- ✅ 1.2.2. Initialize an npm project within `packages/shared`.
- ✅ 1.2.3. Add TypeScript and a `tsconfig.json` that extends the root config.
- ✅ 1.2.4. Define Data Transfer Objects (DTOs) for all entities as specified in `PRD.md` (User, Project, Prompt, etc.).

### 1.3. Backend Scaffolding
- ✅ 1.3.1. Create the `packages/backend` directory.
- ✅ 1.3.2. Initialize an npm project.
- ✅ 1.3.3. Install Fastify, TypeScript, `ts-node`, and other initial dependencies.
- ✅ 1.3.4. Create a `tsconfig.json` extending the root config.
- ✅ 1.3.5. Set up a basic Fastify server in `src/index.ts`.
- ✅ 1.3.6. Add npm scripts for `dev` (using `ts-node-dev`) and `build` (using `tsc`).
- ✅ 1.3.7. Add the `packages/shared` package as a dependency.

### 1.4. Frontend Scaffolding
- ✅ 1.4.1. Create the `packages/frontend` directory.
- ✅ 1.4.2. Scaffold a new React project using Vite with the TypeScript template.
- ✅ 1.4.3. Install Tailwind CSS, React Router, and other initial dependencies.
- ✅ 1.4.4. Configure Tailwind CSS.
- ✅ 1.4.5. Add the `packages/shared` package as a dependency.
- ✅ 1.4.6. Set up basic routing structure.

---

## Phase 2: Backend Development

### 2.1. Database Setup
- ✅ 2.1.1. Install `sqlite3` and `knex` (as a query builder/migration tool).
- ✅ 2.1.2. Create a database abstraction layer (`src/db/db.ts`) that initializes and exports the `knex` instance.
- ✅ 2.1.3. Configure the database connection (e.g., file path from an environment variable).
- ✅ 2.1.4. Implement the database migration system.
    - ✅ 2.1.4.1. Create a `migrations` directory.
    - ✅ 2.1.4.2. Write a script to run migrations on application startup.
    - ✅ 2.1.4.3. Ensure the application fails to start if a migration fails.
- ✅ 2.1.5. Create initial migration files for all database tables (`users`, `projects`, `prompts`, `prompt_history`, `test_suites`, `test_cases`, `test_suite_runs`, `test_results`).

### 2.2. User Authentication (AUTH-01)
- ✅ 2.2.1. Implement Google OAuth.
    - ✅ 2.2.1.1. Set up a Google Cloud project and obtain OAuth 2.0 credentials.
    - ✅ 2.2.1.2. Install necessary libraries (e.g., `@fastify/oauth2`).
    - ✅ 2.2.1.3. Create `/auth/google` and `/auth/google/callback` routes.
    - ✅ 2.2.1.4. Implement the callback logic to handle user creation/login and session management (e.g., using `@fastify/session`).
- ✅ 2.2.2. Create a `UserRepository` class to handle all database interactions for the `users` table.
- ✅ 2.2.3. Create a `UserService` class to encapsulate authentication logic.
- ✅ 2.2.4. Create an `Auth` controller/route handler.
- [ ] 2.2.5. Implement a middleware/decorator to protect authenticated routes.

### 2.3. Project Management (PROJ-01)
- [ ] 2.3.1. Create a `ProjectRepository` class for `projects` table DB interactions.
- [ ] 2.3.2. Create a `ProjectService` class for business logic.
- [ ] 2.3.3. Create RESTful API endpoints for projects (CRUD operations).
    - [ ] `GET /api/projects`
    - [ ] `POST /api/projects`
    - [ ] `GET /api/projects/:id`
    - [ ] `PUT /api/projects/:id`
    - [ ] `DELETE /api/projects/:id`
- [ ] 2.3.4. Add unit tests for `ProjectService`.

### 2.4. Prompt Management (PRMPT-01, PRMPT-02, PRMPT-03, PRMPT-04)
- [ ] 2.4.1. Create `PromptRepository` and `PromptHistoryRepository`.
- [ ] 2.4.2. Create a `PromptService` to handle business logic.
- [ ] 2.4.3. Implement logic in `PromptService` to automatically create a `PromptHistory` entry whenever a prompt is updated.
- [ ] 2.4.4. Implement logic to restore a prompt from its history.
- [ ] 2.4.5. Create RESTful API endpoints for prompts (CRUD).
    - [ ] `GET /api/projects/:projectId/prompts`
    - [ ] `POST /api/projects/:projectId/prompts`
    - [ ] `PUT /api/prompts/:id`
    - [ ] `DELETE /api/prompts/:id`
- [ ] 2.4.6. Create API endpoints for prompt history.
    - [ ] `GET /api/prompts/:id/history`
    - [ ] `POST /api/prompts/:id/restore` (restores a specific history version)
- [ ] 2.4.7. Add unit tests for `PromptService`.

### 2.5. Test Suite & Case Management (TEST-01, TEST-02, TEST-03, TEST-04)
- [ ] 2.5.1. Create `TestSuiteRepository` and `TestCaseRepository`.
- [ ] 2.5.2. Create a `TestSuiteService` for business logic.
- [ ] 2.5.3. Create RESTful API endpoints for test suites (CRUD).
- [ ] 2.5.4. Create RESTful API endpoints for test cases (CRUD within a suite).
- [ ] 2.5.5. Add unit tests for `TestSuiteService`.

### 2.6. Prompt Execution & Evaluation (EXEC-01, EXEC-02, EXEC-03, EVAL-01)
- [ ] 2.6.1. Create an `LLMService` to abstract the connection to the OpenAI API.
- [ ] 2.6.2. Implement a job queue for asynchronous test suite execution (e.g., using `p-queue` or a more robust solution like BullMQ if scaling is a concern).
- [ ] 2.6.3. Create an `ExecutionService` that:
    - [ ] 2.6.3.1. Takes a `testSuiteId` and creates a new `TestSuiteRun`.
    - [ ] 2.6.3.2. Fetches the test cases, filtering by `run_mode`.
    - [ ] 2.6.3.3. For each test case, interpolates variables into the prompt text.
    - [ ] 2.6.3.4. Calls the `LLMService` to get the result.
    - [ ] 2.6.3.5. Calls an `EvaluationService` to compare the result with the expected output.
    - [ ] 2.6.3.6. Stores the result in the `test_results` table.
    - [ ] 2.6.3.7. Updates the `TestSuiteRun` status (`completed`, `failed`).
- [ ] 2.6.4. Create an `EvaluationService` with methods for exact string match and deep JSON equality.
- [ ] 2.6.5. Create API endpoints for execution:
    - [ ] `POST /api/test-suites/:id/run` (starts a new run, returns a `runId`).
    - [ ] `GET /api/test-suite-runs/:runId` (polls for run status and results).
- [ ] 2.6.6. Add unit tests for `ExecutionService` and `EvaluationService`.

---

## Phase 3: Frontend Development

### 3.1. Core UI & Layout
- [ ] 3.1.1. Create a main application layout component (`AppLayout.tsx`) with a sidebar and main content area.
- [ ] 3.1.2. Set up a shared `ApiClient` to interact with the backend API.
- [ ] 3.1.3. Implement state management for user session (e.g., using React Context or a state management library).

### 3.2. Authentication UI (UI-01)
- [ ] 3.2.1. Create a `LoginPage.tsx`.
- [ ] 3.2.2. Add a "Login with Google" button that redirects to the backend OAuth endpoint.
- [ ] 3.2.3. Implement a callback page or logic to handle the redirect from the backend, storing the session token.
- [ ] 3.2.4. Create protected routes that redirect to the login page if the user is not authenticated.

### 3.3. Project Dashboard (UI-01, UI-02)
- [ ] 3.3.1. Create a `DashboardPage.tsx` to display a list of user's projects.
- [ ] 3.3.2. Implement a component to create a new project (e.g., a modal dialog).
- [ ] 3.3.3. Implement functionality to edit and delete projects.
- [ ] 3.3.4. Clicking a project should navigate to the project-specific view.

### 3.4. Prompt Editor View (UI-02, UI-03, UI-05)
- [ ] 3.4.1. Create a `ProjectPage.tsx` that shows a list of prompts for the selected project.
- [ ] 3.4.2. Create a `PromptEditor.tsx` component.
    - [ ] 3.4.2.1. A text area for the prompt text.
    - [ ] 3.4.2.2. A "Save" button.
    - [ ] 3.4.2.3. A "View History" button.
- [ ] 3.4.3. Implement a `PromptHistoryModal.tsx` to display previous versions and a "Restore" button.

### 3.5. Test Suite View (UI-03, UI-04)
- [ ] 3.5.1. Create a `TestSuitePanel.tsx` within the `ProjectPage.tsx`.
- [ ] 3.5.2. Display a list of test suites for the selected prompt.
- [ ] 3.5.3. Implement UI for creating, editing, and deleting test suites.
- [ ] 3.5.4. Implement a `TestCaseEditor.tsx` to manage test cases within a suite.
    - [ ] 3.5.4.1. Inputs for key-value variables.
    - [ ] 3.5.4.2. An editor for the expected output (string or JSON).
    - [ ] 3.5.4.3. Controls for setting the `run_mode` (`DEFAULT`, `SKIP`, `ONLY`).
- [ ] 3.5.5. Add a "Run Test Suite" button.

### 3.6. Results Display (UI-04)
- [ ] 3.6.1. After a run is initiated, poll the backend for results.
- [ ] 3.6.2. Create a `TestResultsView.tsx` component.
- [ ] 3.6.3. Display the results in a table: `Test Case Name | Status (Pass/Fail) | Actual Output`.
- [ ] 3.6.4. Style passing tests in green and failing tests in red.

---

## Phase 4: Integration, Testing & Deployment

### 4.1. End-to-End Testing
- [ ] 4.1.1. Write end-to-end tests for the main user flows (e.g., using Cypress or Playwright).
    - [ ] 4.1.1.1. User login flow.
    - [ ] 4.1.1.2. Create project -> create prompt -> create test suite -> run test -> view results.
    - [ ] 4.1.1.3. Prompt versioning and restoration flow.

### 4.2. Finalization
- [ ] 4.2.1. Review and refine the UI/UX.
- [ ] 4.2.2. Add comprehensive error handling and user feedback messages.
- [ ] 4.2.3. Write README files for `frontend`, `backend`, and root directories.
- [ ] 4.2.4. Prepare environment variable templates (`.env.example`).

### 4.3. Deployment
- [ ] 4.3.1. Create Dockerfiles for the `frontend` and `backend`.
- [ ] 4.3.2. Create a `docker-compose.yml` for local development and deployment.
- [ ] 4.3.3. Set up a CI/CD pipeline (e.g., GitHub Actions) to automate testing and building.
- [ ] 4.3.4. Deploy the application to a hosting provider.
