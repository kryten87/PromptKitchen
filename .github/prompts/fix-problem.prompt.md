---
mode: "agent"
tools: ["githubRepo", "codebase", "fetch"]
description: "Correct the problem described in the chat"
---

# Problem Fixing Instructions

**Fix** the issue described in the chat.

## Guidelines

1.  **Read** and **understand** the problem described in the chat.
2.  If you are lacking information, **ask** clarifying questions. Otherwise, proceed autonomously.
3.  **Fix** the issue.
4.  **Verify** the fix by running `npm run check` in the root of the repository.
5.  If `npm run check` fails, **analyze the output, fix the new issues, and repeat the check**. Continue this cycle until all checks pass.
6.  Do not ask for permission to run checks or fix subsequent errors. Proceed with the necessary steps to ensure the codebase is clean.
7.  **Top-level Imports (Hard Requirement)**: All import statements must be static and placed at the top of each file. Inline or dynamic imports (e.g., `import()` inside functions or blocks) are strictly prohibited everywhere in the codebase, except for true dynamic loading scenarios (such as React lazy loading or code splitting). This rule applies to all backend, frontend, and shared code. Violations are not permitted and must be corrected immediately.
