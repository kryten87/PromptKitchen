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
