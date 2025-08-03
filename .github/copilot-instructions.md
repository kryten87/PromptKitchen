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
- **Tasks**: _IMPORTANT!!!_ a task is not considered complete until all unit tests pass, the code is linted & fixed, and all packages build successfully. This is a critical part of the development process to ensure code quality and maintainability. Use `npm run check` in the root of the repository to check everything.
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
- **Top-level Imports (Hard Requirement)**: All import statements must be static and placed at the top of each file. Inline or dynamic imports (e.g., `import()` inside functions or blocks) are strictly prohibited everywhere in the codebase, except for true dynamic loading scenarios (such as React lazy loading or code splitting). This rule applies to all backend, frontend, and shared code. Violations are not permitted and must be corrected immediately.

## Task Completion Checklist
- After you finish a task from the task list (eg. when you finish section 1.2.3), you **must** follow these steps precisely:
  1. Run `npm run check` in the root of the repository.
  2. If the check fails, you **must** analyze the errors and fix them.
  3. Repeat steps 1 and 2 until `npm run check` passes successfully.
  4. Only after `npm run check` passes, mark the task as complete in the task list with a ✅ character.
  5. Do not announce that a task is finished until all these steps are complete. There is no need to ask for permission to proceed with these checks.

Refer to `project/PRD.md` for further details and best practices.

