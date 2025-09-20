# AGENTS.md

This file provides guidelines for agentic coding assistants working in this repository.

## Commands

- **Check all packages**: `npm run check` (builds, lints, and tests everything)
- **Run all tests**: `npm test --workspaces`
- **Run single backend test**: `npm --workspace=packages/backend test -- <path/to/test.spec.ts>`
- **Run single frontend test**: `npm --workspace=packages/frontend test -- <path/to/test.spec.tsx>`
- **Lint all packages**: `npm run lint --workspaces`

## Code Style & Conventions

- **Tech Stack**: TypeScript monorepo (React/Fastify) using npm workspaces.
- **Imports**:
  - Use named exports only. No `export default`.
  - All imports must be static and at the top of the file.
  - Do not use barrel files (e.g. `index.ts` that re-export).
- **Testing**:
  - Use Jest for unit tests. Test files must be named `*.spec.ts` or `*.spec.tsx`.
  - For frontend components, use `data-testid` attributes in `kebab-case`.
- **Error Handling**: Encapsulate logic in classes and use pure functions.
- **Dependencies**: Use native `fetch` for HTTP requests.
- **Completion**: A task is only complete after `npm run check` passes without errors.
