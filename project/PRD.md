# Project Requirements Document: Prompt Kitchen

**Version:** 1.0
**Date:** July 27, 2025
**Status:** Finalized

---

## 1. Introduction

### 1.1. Project Overview

Prompt Kitchen is a web-based application designed to streamline the development, testing, and iteration of large language model (LLM) prompts. The tool enables developers and prompt engineers to write prompts, define comprehensive test suites with various inputs, and execute them against an LLM. The application provides clear pass/fail feedback, allowing for rapid refinement of prompts to ensure they meet quality and accuracy standards before deployment.

### 1.2. Goals and Objectives

- **Goal**: To accelerate the prompt engineering lifecycle.
- **Objective 1**: Provide a structured environment for creating and managing prompts.
- **Objective 2**: Enable robust testing of prompts against predefined test cases.
- **Objective 3**: Offer a clear and efficient way to evaluate prompt performance.
- **Objective 4**: Create a flexible architecture that can adapt to different LLMs and future requirements.

### 1.3. Target Audience

- Prompt Engineers
- AI/ML Developers
- Software Developers integrating LLM features

---

## 2. Scope

### 2.1. In-Scope Features

- **User Authentication**: Secure user login via Google OAuth.
- **Project Management**: Users can create, edit, and delete projects to organize their work.
- **Prompt Management**: Within a project, users can create, edit, and delete multiple prompts.
- **Test Suite Management**: For each prompt, users can create multiple test suites. Each suite can contain multiple test cases.
- **Test Case Management**: A test case consists of a set of input variables (key-value pairs) and an expected output, which can be either a string or a JSON object.
- **Prompt Execution**: Users can run a prompt against all test cases in a selected test suite. The system will support running all tests or skipping specific ones.
- **Results Evaluation**: The application will compare the LLM's output with the expected output. For strings, it will use an exact-match comparison. For JSON, it will perform a deep equality check.
- **Results Display**: A clear view showing the pass/fail status for each test case in a run.
- **Prompt Version History**: The system will automatically save a new version of a prompt whenever it is modified, allowing users to view and revert to previous versions.

### 2.2. Out-of-Scope Features (for V1)

- Advanced evaluation metrics (e.g., semantic similarity, regex matching, JSON validation).
- A "diff" view for comparing actual vs. expected results.
- Support for OAuth providers other than Google.
- Team collaboration features (e.g., sharing projects, multi-user editing).
- Direct integration with CI/CD pipelines.

---

## 3. Functional Requirements

### 3.1. User Stories

- **As a developer, I want to** sign in with my Google account **so that** I can securely access my projects.
- **As a prompt engineer, I want to** create a project **so that** I can group related prompts and tests together.
- **As a developer, I want to** write a prompt using `{{variable}}` syntax **so that** I can define dynamic templates.
- **As a prompt engineer, I want to** create a test suite with multiple test cases **so that** I can test my prompt against various scenarios.
- **As a developer, I want to** click a button to run my prompt against a test suite **so that** I can see how it performs.
- **As a prompt engineer, I want to** see a simple pass/fail result for each test case **so that** I can quickly identify which scenarios are failing.
- **As a developer, I want to** view the history of a prompt and restore a previous version **so that** I can easily undo changes that decrease performance.

### 3.2. System Features

| Feature ID | Description |
| :--- | :--- |
| AUTH-01 | The system shall allow users to register and log in using Google OAuth. |
| PROJ-01 | The system shall allow authenticated users to create, view, update, and delete projects. |
| PRMPT-01 | Within a project, the system shall allow users to create, view, update, and delete prompts. |
| PRMPT-02 | The prompt editor shall support `{{variable}}` syntax for templating. |
| TEST-01 | For each prompt, the system shall allow users to create, view, update, and delete test suites. |
| TEST-02 | Each test suite shall contain one or more test cases. |
| TEST-03 | Each test case shall consist of key-value inputs and an expected output, which can be either a single string or a JSON object. |
| TEST-04 | The system shall allow users to set a run mode for each test case (`DEFAULT`, `SKIP`, `ONLY`). If any test cases are marked as `ONLY`, only those tests will be executed. Otherwise, all `DEFAULT` tests will be run, and `SKIP` tests will be excluded. |
| EXEC-01 | The system shall connect to the OpenAI API to execute prompts. |
| EXEC-02 | The system shall replace variables in the prompt template with the values from a test case before sending it to the LLM. |
| EXEC-03 | Test suite execution shall be an asynchronous process. The client will poll an endpoint to retrieve results. |
| EVAL-01 | The system shall compare the LLM's output with the test case's expected output. For string comparisons, it will use an exact-match, case-sensitive comparison. For JSON comparisons, it will perform a deep equality check, ignoring the order of keys in objects. |
| PRMPT-03 | The system shall save a new version of a prompt to its history upon every modification. |
| PRMPT-04 | The system shall allow a user to view previous versions of a prompt and restore a selected version. When restoring, the system will copy the selected historical prompt text to the current prompt, creating a new entry in the history. |
| SYS-01 | The system shall handle API and database errors gracefully and provide meaningful feedback to the user. |
| UI-01 | The UI shall display a list of projects for the logged-in user. |
| UI-02 | The UI shall display the prompts within a selected project. |
| UI-03 | The UI shall display the test suites and test cases for a selected prompt. |
| UI-04 | The UI shall display the pass/fail results for each test case after a test run. |
| UI-05 | The UI will provide a mechanism to view prompt history and initiate a rollback. |

---

## 4. Non-Functional Requirements

### 4.1. Technology Stack

| Component | Technology |
| :--- | :--- |
| Language | TypeScript |
| Backend Framework | Fastify on NodeJS |
| Frontend Framework | React with Vite |
| Routing (Frontend) | React Router |
| Styling | Tailwind CSS |
| Database | SQLite3 (initially) |
| Package Manager | npm |
| Testing | Jest |
| Linting | ESLint |
| HTTP Client | Native `fetch` API |
| Validation | Yup (shared package, used on both backend and frontend) |

### 4.2. Architecture & Design

- **Monorepo**: The codebase will be organized into a monorepo with three main packages: `frontend`, `backend`, and `shared`.
- **Database Abstraction**: All database access will be performed through an abstraction layer to facilitate future migration to other SQL databases like PostgreSQL or MySQL. No ORM will be used.
- **Database Migrations**: The backend API will be responsible for running database migrations. Migrations will execute automatically upon application startup. If any migration fails, the application must fail to start. The migration system should be idempotent, meaning it will do nothing if no migration scripts need to be run.
- **Data Transfer Objects (DTOs)**: DTOs will be used for all data exchange with the database to ensure a clear data contract.
- **Dependency Injection**: Manual dependency injection will be used to promote modularity and testability. No DI frameworks.
- **Code Style**: Logic will be encapsulated in classes where appropriate. Small, pure functions with descriptive names are preferred.
- **Unit Testing**: Unit tests will be written concurrently with feature development. As each function or component is created or modified, corresponding unit tests must be created or updated to ensure correctness and prevent regressions.
- **API Keys**: LLM API keys will be stored securely as environment variables on the server.
- **Test Files**: All test files must follow the `*.spec.ts` or `*.spec.tsx` naming convention.

### 4.3. Data Models

The application's data is structured around five core entities, with relationships defined as follows:
- A `User` has zero or more `Projects`.
- A `Project` has zero or more `Prompts`.
- A `Prompt` has zero or more `TestSuites` and a history of its previous versions.
- A `TestSuite` has zero or more `TestCases` and a history of `TestSuiteRuns`.
- A `TestSuiteRun` groups the `TestResults` from a single execution and is linked to a specific `PromptHistory` version.

| Entity | Attributes | Notes |
| :--- | :--- | :--- |
| **User** | `id`, `email`, `name`, `oauth_provider`, `created_at` | Represents an authenticated user. |
| **Project** | `id`, `user_id`, `name`, `description`, `created_at`, `updated_at` | A container for related prompts. |
| **Prompt** | `id`, `project_id`, `name`, `prompt_text`, `created_at`, `updated_at` | The current, active version of a prompt. |
| **PromptHistory** | `id`, `prompt_id`, `prompt_text`, `version_number`, `created_at` | A snapshot of a prompt at a point in time. Version is an incrementing integer. |
| **TestSuite** | `id`, `prompt_id`, `name`, `created_at`, `updated_at` | A collection of test cases for a prompt. Test suites are independent of prompt versions. |
| **TestCase** | `id`, `test_suite_id`, `inputs`, `expected_output`, `output_type`, `run_mode`, `created_at`, `updated_at` | A single test. `inputs` is a JSON object. `expected_output` stores a string or serialized JSON. `output_type` can be `STRING` or `JSON`. `run_mode` can be `DEFAULT`, `SKIP`, or `ONLY`. If any test is marked `ONLY`, only those tests will run. |
| **TestSuiteRun** | `id`, `test_suite_id`, `prompt_history_id`, `run_at`, `status`, `pass_percentage` | Represents a single execution of a full test suite against a specific prompt version. `status` can be `PENDING`, `RUNNING`, `COMPLETED`, or `ERROR`. |
| **TestResult** | `id`, `test_suite_run_id`, `test_case_id`, `actual_output`, `status` | Records the outcome of a single test case. `actual_output` stores the string or JSON response from the LLM. `status` can be `PASS` or `FAIL`. |

### 4.4. Input Validation

- All user inputs must be validated both on the backend and frontend using schemas defined with the `yup` library.
- Validation schemas will live in the `shared` package and will be imported by both backend and frontend code.
- Validation will be enforced for all API endpoints and UI forms.
- Validation errors must be handled gracefully and surfaced to the user with clear messages.

### 4.5. Shared Validation Library

- The shared package will export validation schemas for all DTOs/entities (User, Project, Prompt, etc.) using `yup`.
- These schemas will be the single source of truth for input validation across the stack.
- Validation logic will be kept in sync with DTO definitions.

### 4.6. Security

- User authentication tokens will be returned by the backend as a bearer token (JWT) and must be stored in browser local storage by the frontend. Cookies will NOT be used for authentication. All API requests from the frontend to the backend must use the Authorization: Bearer <token> header.
- All sensitive credentials (like API keys) must be stored on the backend and never exposed to the client.

### 4.7. Database Connector Pattern (Best Practice)

- All database access must use a class-based connector pattern. The connector class should be instantiated with configuration (e.g., SQLite filename) and expose a `knex` instance for queries.
- All repositories and services must accept a database connector instance via their constructor (manual dependency injection). No global singletons should be used except for the production connector.
- All unit tests for database code must use an in-memory SQLite database (`filename: ':memory:'`) to ensure isolation and speed.
- Migrations must be run immediately after establishing a database connection, and before any queries are executed.
- This pattern must be followed for all future database-related code.

---

## 5. Future Considerations

- Support for additional OAuth providers.
- Implementation of more sophisticated evaluation methods (regex, semantic similarity).
- A "diff" view to visualize differences between actual and expected outputs.
- An abstraction layer for LLM providers to easily add support for models other than OpenAI.
- Role-based access control and team collaboration features.
