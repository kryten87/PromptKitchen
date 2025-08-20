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
- ✅ 1.2.5. Add a validation library using `yup` for all DTOs, to be used by both backend and frontend.

### 1.3. Backend Scaffolding
- ✅ 1.3.1. Create the `packages/backend` directory.
- ✅ 1.3.2. Initialize an npm project.
- ✅ 1.3.3. Install Fastify, TypeScript, `ts-node`, and other initial dependencies.
- ✅ 1.3.4. Create a `tsconfig.json` extending the root config.
- ✅ 1.3.5. Set up a basic Fastify server in `src/index.ts`.
- ✅ 1.3.6. Add npm scripts for `dev` (using `tsx`) and `build` (using `tsc`).
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
- ✅ 2.2.5. Implement a middleware/decorator to protect authenticated routes.

### 2.3. Project Management (PROJ-01)
- ✅ 2.3.1. Create a `ProjectRepository` class for `projects` table DB interactions.
- ✅ 2.3.2. Create a `ProjectService` class for business logic.
- ✅ 2.3.3. Create RESTful API endpoints for projects (CRUD operations).
    - ✅ `GET /api/projects`
    - ✅ `POST /api/projects`
    - ✅ `GET /api/projects/:id`
    - ✅ `PUT /api/projects/:id`
    - ✅ `DELETE /api/projects/:id`
- ✅ 2.3.4. Add unit tests for `ProjectService`.

### 2.4. Prompt Management (PRMPT-01, PRMPT-02, PRMPT-03, PRMPT-04)
- ✅ 2.4.1. Create `PromptRepository` and `PromptHistoryRepository`.
- ✅ 2.4.2. Create a `PromptService` to handle business logic.
- ✅ 2.4.3. Implement logic in `PromptService` to automatically create a `PromptHistory` entry whenever a prompt is updated.
- ✅ 2.4.4. Implement logic to restore a prompt from its history.
- ✅ 2.4.5. Create RESTful API endpoints for prompts (CRUD).
    - ✅ `GET /api/projects/:projectId/prompts`
    - ✅ `POST /api/projects/:projectId/prompts`
    - ✅ `PUT /api/prompts/:id`
    - ✅ `DELETE /api/prompts/:id`
- ✅ 2.4.6. Create API endpoints for prompt history.
    - ✅ `GET /api/prompts/:id/history`
    - ✅ `POST /api/prompts/:id/restore` (restores a specific history version)
- ✅ 2.4.7. Add unit tests for `PromptService`.

### 2.5. Test Suite & Case Management (TEST-01, TEST-02, TEST-03, TEST-04)
- ✅ 2.5.1. Create `TestSuiteRepository` and `TestCaseRepository`.
- ✅ 2.5.2. Create a `TestSuiteService` for business logic.
- ✅ 2.5.3. Create RESTful API endpoints for test suites (CRUD).
- ✅ 2.5.4. Create RESTful API endpoints for test cases (CRUD within a suite).
- ✅ 2.5.5. Add unit tests for `TestSuiteService`.

### 2.6. Prompt Execution & Evaluation (EXEC-01, EXEC-02, EXEC-03, EVAL-01)
- ✅ 2.6.1. Create an `LLMService` to abstract the connection to the OpenAI API.
- ✅ 2.6.2. Implement a job queue for asynchronous test suite execution (e.g., using `p-queue` or a more robust solution like BullMQ if scaling is a concern).
- ✅ 2.6.3. Create an `ExecutionService` that:
    - ✅ 2.6.3.1. Takes a `testSuiteId` and creates a new `TestSuiteRun`.
    - ✅ 2.6.3.2. Fetches the test cases, filtering by `run_mode`.
    - ✅ 2.6.3.3. For each test case, interpolates variables into the prompt text.
    - ✅ 2.6.3.4. Calls the `LLMService` to get the result.
    - ✅ 2.6.3.5. Calls an `EvaluationService` to compare the result with the expected output.
    - ✅ 2.6.3.6. Stores the result in the `test_results` table.
    - ✅ 2.6.3.7. Updates the `TestSuiteRun` status (`completed`, `failed`).
- ✅ 2.6.4. Create an `EvaluationService` with methods for exact string match and deep JSON equality.
- ✅ 2.6.5. Create API endpoints for execution:
    - ✅ `POST /api/test-suites/:id/run` (starts a new run, returns a `runId`).
    - ✅ `GET /api/test-suite-runs/:runId` (polls for run status and results).
- ✅ 2.6.6. Add unit tests for `ExecutionService` and `EvaluationService`.

### 2.7. OpenAI API Integration
- ✅ 2.7.1. Implement the OpenAI API integration in the `LLMService`.
    - ✅ 2.7.1.1. Add configuration for the OpenAI API key and endpoint (from environment variables).
    - ✅ 2.7.1.2. Implement methods to send prompt requests to the OpenAI API and handle responses.
    - ✅ 2.7.1.3. Add error handling and logging for API failures.
    - ✅ 2.7.1.4. Add unit tests for the OpenAI integration logic.

---

## Phase 3: Frontend Development

### 3.1. Core UI & Layout
- ✅ 3.1.1. Create a main application layout component (`AppLayout.tsx`) with a sidebar and main content area.
- ✅ 3.1.2. Set up a shared `ApiClient` to interact with the backend API.
- ✅ 3.1.3. Implement state management for user session (e.g., using React Context or a state management library).

### 3.2. Authentication UI (UI-01)
- ✅ 3.2.1. Create a `LoginPage.tsx`. LoginPage UI implemented, styled, and integrated into router. All checks pass.
- ✅ 3.2.2. Add a "Login with Google" button that redirects to the backend OAuth endpoint.
- ✅ 3.2.3. Implement a callback page or logic to handle the redirect from the backend, storing the session token.
- ✅ 3.2.4. Create protected routes that redirect to the login page if the user is not authenticated.
- ✅ 3.2.5. **Manual step:** Test the Google OAuth login flow in the browser (this must be performed by a human tester, not by Copilot).

### 3.3. Project Dashboard (UI-01, UI-02)
- ✅ 3.3.1. Create a `DashboardPage.tsx` to display a list of user's projects.
- ✅ 3.3.2. Implement a component to create a new project (e.g., a modal dialog). Modal, integration, and tests complete; all checks pass.
- ✅ 3.3.3. Implement functionality to edit and delete projects. Edit and delete UI, logic, and tests implemented in the dashboard. All checks pass (`npm run check`). See `project/tasks/TASK-3.3.3.md` for details.
- ✅ 3.3.4. Clicking a project should navigate to the project-specific view. ✅

### 3.4. Prompt Editor View (UI-02, UI-03, UI-05)
- ✅ 3.4.1. Create a `ProjectPage.tsx` that shows a list of prompts for the selected project.
- ✅ 3.4.2. Create a `PromptEditor.tsx` component.
    - ✅ 3.4.2.1. A text area for the prompt text.
    - ✅ 3.4.2.2. A "Save" button.
    - ✅ 3.4.2.3. A "View History" button.
- ✅ 3.4.3. Integrate PromptEditor into ProjectPage for prompt management.
    - ✅ 3.4.3.1. Add a "Create New Prompt" button to ProjectPage.
    - ✅ 3.4.3.2. Add "Edit" and "Delete" buttons to each prompt in the list.
    - ✅ 3.4.3.3. Implement state management to show/hide PromptEditor and track selected prompt.
    - ✅ 3.4.3.4. Handle prompt creation (POST to `/api/projects/:projectId/prompts`).
    - ✅ 3.4.3.5. Handle prompt updates via PromptEditor integration.
    - ✅ 3.4.3.6. Handle prompt deletion with confirmation dialog.
    - ✅ 3.4.3.7. Refresh prompt list after create/update/delete operations.
- ✅ 3.4.4. Implement a `PromptHistoryModal.tsx` to display previous versions and a "Restore" button.

### 3.5. Test Suite View (UI-03, UI-04)
- ✅ 3.5.1. Create a `TestSuitePanel.tsx` within the `ProjectPage.tsx`.
- ✅ 3.5.2. Display a list of test suites for the selected prompt.
- ✅ 3.5.3. Implement UI for creating, editing, and deleting test suites.
- ✅ 3.5.4. Implement a `TestCaseEditor.tsx` to manage test cases within a suite.
    - ✅ 3.5.4.1. Inputs for key-value variables.
    - ✅ 3.5.4.2. An editor for the expected output (string or JSON).
    - ✅ 3.5.4.3. Controls for setting the `run_mode` (`DEFAULT`, `SKIP`, `ONLY`).
- ✅ 3.5.5. Add a "Run Test Suite" button.

### 3.6. Results Display (UI-04)
- ✅ 3.6.1. After a test suite run is initiated, the frontend should poll the backend for results and display them to the user. Ensure the polling logic is robust and fully tested. Do not proceed to later sections. ✅
- ✅ 3.6.2. Create a `TestResultsView.tsx` component.
- ✅ 3.6.3. Display the results in a table: `Test Case Name | Status (Pass/Fail) | Actual Output`.
- ✅ 3.6.4. Style passing tests in green and failing tests in red.
- ✅ 3.6.5. Integrate the `TestResultsView` component into the results display flow in the UI.

---

## Phase 4: Integration, Testing & Deployment

### 4.1. Review and Refine the UI/UX
- ✅ 4.1.1. Review all main user flows for clarity, consistency, and usability.
- ✅ 4.1.2. Refine layout, spacing, and visual hierarchy for all major screens.
- ✅ 4.1.3. Ensure accessibility best practices (labels, keyboard navigation, color contrast).
- ✅ 4.1.4. Validate responsiveness across desktop, tablet, and mobile breakpoints.
- ✅ 4.1.5. Update any outdated icons, colors, or design elements to match the latest design palette.
- ✅ 4.1.6. Gather feedback from users or stakeholders and iterate on UI improvements.
- ✅ 4.1.7. Document any major UI/UX changes in the project design notes.

### 4.2. Enhanced Test Matching (PRD-TEST-MATCH)

- ✅ 4.2.1 Shared (packages/shared) — Types, Registry, Evaluator
  - ✅ 4.2.1.1 Add DTO/types: `JsonPath`, `MatcherName`, `PathMatchMode`, `Assertion`, `AssertionResult` (in `packages/shared/src/types.ts` or `dtos.ts`) and export from `index`.
  - ✅ 4.2.1.2 Define matcher interfaces in `packages/shared/src/evaluation`: `MatcherContext`, `Matcher`, and `registry` scaffold.
  - ✅ 4.2.1.3 Add dependency `jsonpath-plus`; implement `resolveJsonPath(actual, path): unknown[]` with sugar normalization (prepend `$` when missing).
  - ✅ 4.2.1.4 Add dependency `fast-deep-equal`; implement `deepEqual(a,b)` util in `MatcherContext`.
  - ✅ 4.2.1.5 Implement matcher `toEqual` (deep equality) and message builder.
  - ✅ 4.2.1.6 Implement matcher `toBeNull` and message builder.
  - ✅ 4.2.1.7 Implement matcher `toContain`:
    - arrays: any element deep-equals expected.
    - strings: substring contains expected; support `{ value: string; caseInsensitive?: boolean }`.
    - messages for both modes.
  - ✅ 4.2.1.8 Implement matcher `toMatch` (strings only): accepts `string` or `{ source, flags }`. Defer regex compilation policy to consumer via evaluator options (see backend/frontend tasks).
  - ✅ 4.2.1.9 Implement matcher `toBeOneOf` using deep-equals against any option.
  - ✅ 4.2.1.10 Implement `evaluateAssertions(actual, assertions, opts?)`:
    - Resolve values via `resolveJsonPath` (0 results -> `[undefined]`).
    - Evaluate per value, aggregate by `pathMatch` (ANY/ALL), then apply `not`.
    - Build `AssertionResult[]` with friendly messages and `actualSamples`.
  - ✅ 4.2.1.11 Unit tests (Jest) for each matcher including edge cases (undefined/null, arrays/objects, case-insensitive string containment, regex flags).
  - ✅ 4.2.1.12 Unit tests (Jest) for `evaluateAssertions` covering ANY vs ALL, `not`, zero-results behavior, multiple values.
  - ✅ 4.2.1.13 Ensure `npm run -w shared build && npm run check` passes.

- ✅ 4.2.2 Backend (packages/backend) — Migrations & Config
  - ✅ 4.2.2.1 Migration `010_add_assertions_to_test_cases`: add nullable `assertions` TEXT to `test_cases`.
  - ✅ 4.2.2.2 Migration `011_add_details_to_test_results`: add nullable `details` TEXT to `test_results`.
  - ✅ 4.2.2.3 Migration tests: run up/down idempotently; verify columns exist.
  - ✅ 4.2.2.4 Add env defaults to config: `PK_MAX_ASSERTION_JSON_BYTES=65536`, `PK_MAX_TEST_RESULT_DETAILS_BYTES=524288`, `PK_REGEX_MAX_SOURCE_LEN=1024`, `PK_REGEX_MAX_TEST_STR_LEN=100000`, `PK_REGEX_ALLOWED_FLAGS=imsu`.
  - ✅ 4.2.2.5 Add dependencies: `re2` (node-re2) and `safe-regex2`.
  - ✅ 4.2.2.6 Implement `compileSafeRegex(pattern, flags, limits)` utility:
    - Validate flags against whitelist and source length.
    - Prefer RE2; if unavailable, reject patterns failing `safe-regex2` check.
    - Return a callable `{ test(str): boolean }` to be used by evaluator.

- ✅ 4.2.3 Backend — Evaluation Integration & Persistence
  - ✅ 4.2.3.1 Create `EvaluationService` that wraps shared `evaluateAssertions` and injects `compileSafeRegex` via options.
  - ✅ 4.2.3.2 Update execution pipeline: if `testCase.assertions?.length > 0`, use `EvaluationService`; else legacy exact/deep-equal.
  - ✅ 4.2.3.3 Persist `AssertionResult[]` JSON into `test_results.details` (nullable when legacy path used).
  - ✅ 4.2.3.4 Implement details size cap (`PK_MAX_TEST_RESULT_DETAILS_BYTES`): truncate `actualSamples` with `...truncated` marker and include SHA-256 hash of full content.
  - ✅ 4.2.3.5 Unit tests:
    - assertions path end-to-end (pass/fail, ANY/ALL, `not`).
    - regex safety and allowed flags enforcement.
    - details persistence + truncation + hashing.
  - ✅ 4.2.3.6 Ensure `npm run -w backend test && npm run check` passes.

- ✅ 4.2.4 Frontend (packages/frontend) — Test Case Editor UI
  - ✅ 4.2.4.1 Add `AssertionsSection` inside existing `TestCaseEditor`.
  - ✅ 4.2.4.2 Create `AssertionRow` with: Path input, ANY/ALL segmented toggle, Matcher select, NOT checkbox, Remove button.
  - ✅ 4.2.4.3 Create single contextual `ExpectedPanel` (docked side on wide screens):
    - toMatch: pattern input + flags checkboxes (i, m, s, u) with validation.
    - toBeOneOf: list editor (add/remove/reorder).
    - toEqual/toContain: JSON/Text editor; when Text + toContain, add “Case-insensitive” checkbox.
  - ✅ 4.2.4.4 Add toolbar actions: Add assertion, Import from last output (basic path/value scaffold), Preview.
  - ✅ 4.2.4.5 Wire client-side Preview using shared `evaluateAssertions`.
  - ✅ 4.2.4.6 Add inline validation: JSONPath parse, JSON validity, regex flags/length.
  - ✅ 4.2.4.7 Add `data-testid` attributes for all new controls (follow the naming scheme in the copilot instructions file)
  - ✅ 4.2.4.8 Unit tests (RTL/Jest) for adapters/validators and preview rendering.
  - ✅ 4.2.4.9 Ensure `npm run -w frontend test && npm run check` passes.

- ✅ 4.2.5 Frontend — Results View Enhancements
  - ✅ 4.2.5.1 Update `TestResultsView` to render per-assertion chips: Pass/Fail, path, matcher, mode.
  - ✅ 4.2.5.2 Add expandable area to show `actualSamples` (respect truncation marker and show hash if present).
  - ✅ 4.2.5.3 Unit tests for rendering assertion details and expand/collapse.

### 4.3. End-to-End Testing

(Strategy: Create dedicated `packages/e2e` Playwright workspace; use ephemeral per-worker SQLite DB via temp file path; inject JWT directly into `localStorage`; mock LLM + execution endpoints; happy-path coverage only; run Chromium/Firefox/WebKit in parallel; no CI workflow yet; use `.env.e2e`; add `data-testid` attributes for resilient selectors.)

- ✅ 4.3.1. Move database connection code to shared package so it can be shared with playwright tests
- ✅ 4.3.2. Move database migration code to shared package so it can be shared with playwright tests
- ✅ 4.3.3. Move JWT generation code to shared package so it can be shared with playwright tests
- ✅ 4.3.4. Create `packages/e2e` workspace (package.json with Playwright, TypeScript, tsconfig, eslint config inherit root).
- ✅ 4.3.5. Install Playwright (`@playwright/test`) and browsers (`npx playwright install --with-deps`).
- ✅ 4.3.6. Add root script `e2e` => `npm run -w e2e test` and ensure workspace registration in root `package.json`.
- ✅ 4.3.7. Create `.env.e2e` (frontend & backend vars; include `E2E=1`, disable real OpenAI calls, set dummy API key).
- ✅ 4.3.8. Backend enhancement: allow DB filename override via env (e.g., `DB_FILE`); if unset default existing behavior.
- ✅ 4.3.9. Create Playwright config (`playwright.config.ts`): multiple projects (chromium, firefox, webkit); global setup & teardown; retries=0; workers=default.
- ✅ 4.3.10. Add `data-testid` attributes (follow the naming scheme in the copilot instructions file)
- ✅ 4.3.11. Create a single dummy test (load application page and check the title) to ensure playwright works correctly
- ✅ 4.3.12. Write Playwright tests without authentication - visit / route, redirect to /login
- ✅ 4.3.13. Write Playwright tests without authentication for /login page - should have "Login with Google" button
- [ ] 4.3.14. Write Playwright tests with authentication for /login page -- should redirect to /
- [ ] 4.3.15. Write Playwright tests with authentication for / page
  - [ ] 4.3.15.1 ...should have "Prompt Kitchen" title in the upper left corner
  - [ ] 4.3.15.2 ...should have "Home" link in the sidebar
  - [ ] 4.3.15.2 ...should have "Log Out" button in the sidebar
  - [ ] 4.3.15.2 ...should have "New Project" button in the body of the page
  - [ ] 4.3.15.2 ...should have "Dashboard" title in the body of the page

### 4.4. Finalization
- [ ] 4.4.1. Add comprehensive error handling and user feedback messages.
- [ ] 4.4.2. Write README files for `frontend`, `backend`, and root directories.
- [ ] 4.4.3. Prepare environment variable templates (`.env.example`).

### 4.5. Deployment
- [ ] 4.5.1. Create Dockerfiles for the `frontend` and `backend`.
- [ ] 4.5.2. Create a `docker-compose.yml` for local development and deployment.
- [ ] 4.5.3. Set up a CI/CD pipeline (e.g., GitHub Actions) to automate testing and building.
- [ ] 4.5.4. Deploy the application to a hosting provider.

### 4.6. Review and Refine the UI/UX
- [ ] 4.6.1. Review all main user flows for clarity, consistency, and usability.
- [ ] 4.6.2. Refine layout, spacing, and visual hierarchy for all major screens.
- [ ] 4.6.3. Ensure accessibility best practices (labels, keyboard navigation, color contrast).
- [ ] 4.6.4. Validate responsiveness across desktop, tablet, and mobile breakpoints.
- [ ] 4.6.5. Update any outdated icons, colors, or design elements to match the latest design palette.
- [ ] 4.6.6. Gather feedback from users or stakeholders and iterate on UI improvements.
- [ ] 4.6.7. Document any major UI/UX changes in the project design notes.
