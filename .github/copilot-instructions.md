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
- **Monorepo**: The codebase will be organized into a monorepo with three main packages: `frontend`, `backend`, and `shared`.
- **Database Abstraction**: All database access will be performed through an abstraction layer to facilitate future migration to other SQL databases like PostgreSQL or MySQL. No ORM will be used.
- **Database Migrations**: The backend API will be responsible for running database migrations. Migrations will execute automatically upon application startup. If any migration fails, the application must fail to start. The migration system should be idempotent, meaning it will do nothing if no migration scripts need to be run.
- **Data Transfer Objects (DTOs)**: DTOs will be used for all data exchange with the database to ensure a clear data contract.
- **Dependency Injection**: Manual dependency injection will be used to promote modularity and testability. No DI frameworks.
- **Code Style**: Logic will be encapsulated in classes where appropriate. Small, pure functions with descriptive names are preferred.
- **Unit Testing**: Unit tests will be written concurrently with feature development. As each function or component is created or modified, corresponding unit tests must be created or updated to ensure correctness and prevent regressions.
- **API Keys**: LLM API keys will be stored securely as environment variables on the server.
- **Test Files**: All test files must follow the `*.spec.ts` or `*.spec.tsx` naming convention.

Refer to `project/PRD.md` for further details and best practices.