# Prompt Kitchen Copilot Instructions

## Tech Stack

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
| Authentication | Google OAuth with JSON Web Tokens (JWT) |
| Version Control | Git |
| Deployment | Docker |


## Implementation Strategy
- **Autonomy**: You are expected to work autonomously. After receiving a task, proceed with the implementation without asking for permission at each step. If you encounter issues, attempt to resolve them independently. Only ask for clarification if you are blocked or if a decision requires user input.
- **Tasks**: _IMPORTANT!!!_ a task is not considered complete until `npm run check` has been run and all errors are resolved. This includes ensuring all unit tests pass, the code is linted & fixed, and all packages build successfully. This is a critical part of the development process to ensure code quality and maintainability. Use `npm run check` in the root of the repository to check everything.
- **Monorepo**: The codebase will be organized into a monorepo with three main packages: `frontend`, `backend`, and `shared`.
- **Database Abstraction**: All database access will be performed through an abstraction layer to facilitate future migration to other SQL databases like PostgreSQL or MySQL. No ORM will be used.
- **Database Migrations**: The backend API will be responsible for running database migrations. Migrations will execute automatically upon application startup. If any migration fails, the application must fail to start. The migration system should be idempotent, meaning it will do nothing if no migration scripts need to be run.
- **Data Transfer Objects (DTOs)**: DTOs will be used for all data exchange with the database to ensure a clear data contract.
- **Dependency Injection**: Manual dependency injection will be used to promote modularity and testability. No DI frameworks.
- **Code Style**: Logic will be encapsulated in classes where appropriate. Small, pure functions with descriptive names are preferred.
- **Exports**: do not use default exports. Always used named exports. The reason for this is that it makes mocking easier in unit tests.
- **Unit Testing**: Unit tests will be written concurrently with feature development. As each function or component is created or modified, corresponding unit tests must be created or updated to ensure correctness and prevent regressions.
- **API Keys**: LLM API keys will be stored securely as environment variables on the server.
- **Test Files**: All test files must follow the `*.spec.ts` or `*.spec.tsx` naming convention.
- **Top-level Imports (Hard Requirement)**: All import statements must be static and placed at the very top of each file. **Inline imports are strictly forbidden**—this includes any `import` or `require()` statements inside functions, blocks, or conditional logic. The only exceptions are true dynamic loading scenarios (such as React lazy loading or code splitting). This rule applies to all backend, frontend, and shared code. Any violation (inline import or require) must be corrected immediately.

- **Barrel Files Are Forbidden**: It is strictly forbidden to write barrel files (e.g., files that re-export symbols from other modules, such as `index.ts` with `export * from './foo'`). All imports must be direct and explicit. Barrel files introduce ambiguity, complicate static analysis, and violate the project's import discipline. Any barrel file found must be deleted and replaced with explicit imports.

- **Task Ledger Deletion Reminder**: If a task ledger is used (see `project/tasks/TASK.md`), it must be deleted after the task is completed. Do not leave ledger files in the repository after their purpose is fulfilled.

## Frontend Testing Attributes

- **Data TestID Naming Scheme**: All frontend components must use `data-testid` attributes following a strict naming convention for automated testing. The naming scheme is:
  - **Format**: `[component]-[function]-[type]` or `[component]-[function]-[type]-[unique-id]`
  - **Case**: All lowercase, kebab-case
  - **Component**: The React component name converted to kebab-case (e.g., `ConfirmationModal` becomes `confirmation-modal`)
  - **Function**: Describes what the element does (e.g., `ok`, `cancel`, `submit`, `delete`)
  - **Type**: Matches the HTML element type (e.g., `button`, `input`, `form`, `modal`, `row`)
  - **Unique ID**: For collection elements, use the data ID (e.g., database ID) when available. Avoid array indices unless absolutely necessary as they are not static values.
  - **Examples**:
    - Single element: `"confirmation-modal-ok-button"`
    - Collection element: `"test-results-result-row-abcd1234"`
    - Input field: `"user-profile-email-input"`
    - Form: `"project-create-form"`

## Migration Testing Notes

If you need to run a migration test, always use a temporary SQLite file in the `/tmp` directory (e.g., `/tmp/test-migrate.sqlite3`).
- Run migration scripts against this file to avoid interfering with application data.
- After the test completes, delete the temporary file to keep the environment clean.

## Task Completion Checklist
- After you finish a task from the task list (eg. when you finish section 1.2.3), you **must** follow these steps precisely:
  1. Run `npm run check` in the root of the repository.
  2. If the check fails, you **must** analyze the errors and fix them.
  3. Repeat steps 1 and 2 until `npm run check` passes successfully.
  4. Only after `npm run check` passes, mark the task as complete in the task list with a ✅ character.
     - **Important:** When updating the task list to mark an item as done, the **only** change you should make is to replace `[ ]` with `✅`. Do **not** change indentation, formatting, or reflow any lines. Do **not** reformat or adjust whitespace—just swap the checkbox.
  5. Do not announce that a task is finished until all these steps are complete. There is no need to ask for permission to proceed with these checks.

Refer to `project/PRD.md` for further details and best practices.

- **Task List Updates**: When completing a numbered task from the task list, you must update the corresponding entry in `project/TASK-LIST.md` by replacing `[ ]` with `✅`. This step is non-negotiable.

- **Task Ledger Deletion**: After completing a task, delete the task ledger file (`project/tasks/TASK.md`). This is a strict requirement to keep the repository clean.

- **Critical Requirement for TASK-LIST.md**: If you are asked to complete a numbered section in `project/TASK-LIST.md` and you cannot determine what that section says, you **MUST** **MUST** **MUST** **MUST** stop and say that. **DO NOT UNDER ANY CIRCUMSTANCES MAKE UP INSTRUCTIONS!!!**

