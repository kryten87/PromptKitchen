# UX Review

## Plan

1. Dashboard
  - Project edit button & dialog
  - Project delete functionality
  - Project edit
    - opens dialog
    - edit name
    - edit description
    - cancel button works
    - create button works
  - new project
    - opens dialog
    - edit name
    - edit description
    - cancel button works
    - create button works

# Playwright Tests

## Tests for prompt management

[task created] Write Playwright tests for prompt management --> insert new project into database with mock values; set up authenticated session; go to /projects/<id>
[task created] - should see title & description, prompts header, "Create New Prompt" button
[task created] - click "Create New Prompt" --> see "Create New Prompt" panel, Prompt Name input element, Prompt Text input element, Cancel button, "Create Prompt" button (disabled)
[task created]   - enter Prompt Name, Prompt Text --> "Create Prompt" button should be enabled
[task created]     - click "Cancel" --> prompt panel disappears, "No prompts found for this project." visible
[task created]     - click "Create Prompt" --> Prompt listed on page, View, Edit, Delete buttons; Edit Prompt panel is NOT visible (this is not what we see currently)
[task created]       - click "Delete" --> confirmation modal appears
[task created]         - click "No" --> confirmation modal disappears, prompt still listed on page
[task created]         - click "Yes" --> confirmation modal disappears, prompt no longer listed on page
[task created]       - click "Edit" --> edit panel appears, "Cancel" button, "Save" button is disabled
[task created]         - click "Cancel" --> edit panel disappears, no change to prompt on screen
[task created]         - change Prompt Name, Prompt Text --> "Save" button is enabled
[task created]           - click "Save" --> edit panel disappears, prompt on screen changes to match new values
      - click "View" --> see "Test Suites" with "Create Test Suite" button
        - click "Create Test Suite" --> "Create New Test Suite" modal, Test Suite Name input, "Cancel" button, "Create" button disabled
          - click "Cancel" --> modal disappears, no change to test suites
          - enter Test Suite Name --> "Create" button enabled
            - click "Create" --> test suite added to list, buttons: "Test Cases", "Edit", "Delete", "Run"
              - click "Delete" --> "Are you sure you want to delete this test suite?" modal "No", "Yes" buttons
                - click "No" --> modal disappears, no change to list of test suites
                - click "Yes" --> modal disappears, test suite is removed from list
              - click "Edit" --> Edit Test Suite modal, Test Suite Name input element, "Cancel", "Save" buttons
                - click "Cancel" --> modal disappears, no change to test suites
                - edit test suite name, click "Save" --> modal disappears, test suite name changes in list
              - click "Test Cases" --> Test cases panel appears, "Add Test Case", "Close" buttons
                - click "Close" --> Test cases panel disappears
                - click "Add Test Case" --> "Create New Test Case" panel appears @TODO


# Code Issues/Questions
- skipped tests
- refactor functions into small, pure helpers
- logging system -- frontend & backend
  - set `X-Request-ID` header on front end & log it on the back end?
- frontend/src/mocks -- what is this?
- ensure that access control is working -- person A can only see projects for person A
- playwright e2e tests

# Bugs
- added a project, prompt, test suite, and two test cases. Then added a second project -- first project gone

# UX Problems
- Create Test Case: "Create" button disabled if no variable entered
- when I have a prompt open and I click "view" for another prompt, all other panels should close (currently showing incorrect info because it keeps the old data)

# Tweaks
- after creating project, jump directly to project/:id page
- after creating prompt, jump directly to view prompt page

# New Features
- close button for prompt view
- view last tests results when looking at a test suite
- need a way to match results similar to jest matchers
- test run history
- model selection
- JSON editing where appropriate
- auth middleware should check user in database; caching might be necessary


# DONE --------------------------

# Issues I'm seeing with the prompts
- failing to check things off
- failing to use `npm run check` to test
- too much stopping & asking me if I'd like to continue

use LLM to refine fix-problem and use-task-ledger prompts

sort out front end/back end ports/proxies

# Code Issues/Questions
- check for
  - inline imports
  - require statements
  - inline if statements
- using alerts for "are you sure?" prompts
- are there dtos for every model?
- clean up module loading
  - remove ts-node-dev and replace with tsx
- move database migrations
- shared eslint config -- warnings

# Design & Functionality
- improve theme

# New Features
- functional log out button
- test results during tests -- show expected and actual values

