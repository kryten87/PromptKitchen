---
mode: "agent"
tools: ["githubRepo", "codebase", "fetch"]
description: "Maintain a structured task ledger for effective task management"
---

# Task Ledger Instructions

**Create** and **maintain** a comprehensive task ledger at `project/tasks/TASK.md`. This file serves as your memory repository and task planning system, helping you track progress, record important information, and maintain context throughout the task lifecycle. The task ledger is for your reference and can be removed once the task is complete. You are expected to manage this ledger autonomously without asking for permission.

## Importance of Task Ledger Maintenance

- **Context Preservation**: Update the ledger frequently as context compaction may cause information loss
- **Progress Tracking**: Record completed work, current tasks, and planned future steps
- **Knowledge Repository**: Store research findings and key learnings to avoid redundant information lookups
- **Decision Documentation**: Record important decisions and their rationale to maintain coherent task execution
- **Top-level Imports (Hard Requirement)**: All import statements must be static and placed at the top of each file. Inline or dynamic imports (e.g., `import()` inside functions or blocks) are strictly prohibited everywhere in the codebase, except for true dynamic loading scenarios (such as React lazy loading or code splitting). This rule applies to all backend, frontend, and shared code. Violations are not permitted and must be corrected immediately.

## Update Guidelines

1. **Initialization**: Create the task ledger at the beginning of a new task
2. **Regular Updates**:
   - **After completing a task item**: First, verify the task is truly complete by running `npm run check`. Only after all checks pass should you mark the task as complete in the ledger.
   - Update after discovering new tasks or dependencies
   - Update after making important decisions
   - Update after researching and learning new information
3. **Session Management**:
   - Begin each work session by reviewing the task ledger
   - End each work session by updating the current status and progress
4. **Research Management**:
   - Summarize key findings after researching documentation or code
   - Include relevant code snippets, API examples, or configuration patterns
5. **Milestone Tracking**:
   - Mark major milestones in the task progression
   - Record completion criteria for each milestone

Maintain this task ledger diligently throughout the task execution to ensure maximum effectiveness and continuity.


## Task Ledger Deletion Reminder

After the task is completed, you must delete the task ledger file (`project/tasks/TASK.md`). Do not leave ledger files in the repository after their purpose is fulfilled.

## Required Structure

````markdown
# Task Ledger

## Project Overview

[Brief description of the overall task, including goals and constraints]

## Requirements

[Detailed description of the task requirements, including any constraints or limitations]

## Current Status

[Overall progress status - "Not Started", "In Progress", "Blocked", or "Completed"]
[If blocked, briefly describe the blocker]
[If in progress, summarize the current step]

## Tasks

### Completed

- [x] Task 1: [Description and outcome]
- [x] Task 2: [Description and outcome]

### In Progress

- [ ] Current task: [Description and status]

### Pending

- [ ] Next task: [Description]
- [ ] Future task: [Description]

## Research Notes

### [Topic/Source Name 1]

- Key finding 1
- Key finding 2
- Code example:
  ```code
  example code
  ```

### [Topic/Source Name 2]

- Key finding 1
- Key finding 2

## Blockers & Issues

- Issue 1: [Description and potential solutions]
- Issue 2: [Description and potential solutions]

## Important Decisions

- Decision 1: [Choice made, rationale, and alternatives considered]
- Decision 2: [Choice made, rationale, and alternatives considered]

````

## Task Completion Checklist

1. **Mark the Task as Complete in the Task List**: When completing a numbered task from the task list, ensure you update the corresponding entry in `project/TASK-LIST.md` by replacing `[ ]` with `✅`. Do not skip this step.

2. **Delete the Task Ledger**: After completing the task, delete the task ledger file (`project/tasks/TASK.md`). This is mandatory to maintain a clean repository.

3. **Run Final Checks**: Run `npm run check` to ensure all tests pass, the code is linted, and the build succeeds. Only proceed to mark the task as complete after this step.

4. **Review and Confirm**: Double-check that both `project/TASK-LIST.md` and `project/tasks/TASK.md` are updated or removed as required.
