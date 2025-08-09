# Code Issues/Questions
- skipped tests
- refactor functions into small, pure helpers
- logging system -- frontend & backend
  - set `X-Request-ID` header on front end & log it on the back end?
- frontend/src/mocks -- what is this?
- ensure that access control is working -- person A can only see projects for person A
- playwright e2e tests
- shared eslint config -- warnings


# New Features
- close button for prompt view
- view last tests results when looking at a test suite
- need a way to match results similar to jest matchers

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

# Design & Functionality
- improve theme

# New Features
- functional log out button
- test results during tests -- show expected and actual values

