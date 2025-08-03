---
mode: "agent"
tools: ["githubRepo", "codebase", "fetch"]
description: "Correct the problem described in the chat"
---

# Problem Fixing Instructions

**Fix** the issue described in the chat and make sure that:
1. all unit tests pass
2. all linting errors are correct
3. all packages build successfully

## Guidelines

1. **Read** and **understand** the problem described in the chat
2. If you are lacking information, **ask** clarifying questions
3. **Fix** the issue
4. **Check** the results. Run `npm run check` in the root of the repository to ensure that everything is working.
