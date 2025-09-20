# Future

## Code Issues/Questions
- skipped tests
- test warnings
- make sure migrations are running correctly in both prod & non-prod environments
- refactor functions into small, pure helpers
- ensure that access control is working -- person A can only see projects for person A
- logging system -- frontend & backend
  - set `X-Request-ID` header on front end & log it on the back end?
- frontend/src/mocks -- what is this?
- add lint, lint:fix to e2e

## Tweaks
- thorough review of unit tests
- can we run e2e tests against a :memory: database?
- code coverage
- look for ways to reduce code duplication (eg. using APIClient on front end in some places, making raw requests in others) - can the LLM analyze this?

## New Features
- close button for prompt view
- view last tests results when looking at a test suite
- need a way to match results similar to jest matchers
- test run history
- model selection
- when running a test suite are we hitting the AI multiple times or just once?
- JSON editing where appropriate
- auth middleware should check user in database; caching might be necessary
- "Run with" option to select model at run time
- default view for an item in a list -- short with view/edit/etc. buttons. click view, it expands to show more while others remain small

---

# DONE

## Issues I'm seeing with the prompts
- failing to check things off
- failing to use `npm run check` to test
- too much stopping & asking me if I'd like to continue

use LLM to refine fix-problem and use-task-ledger prompts

sort out front end/back end ports/proxies

## Code Issues/Questions
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
- playwright e2e tests

## Design & Functionality
- improve theme

## New Features
- functional log out button
- test results during tests -- show expected and actual values

## UX Problems
- Create Test Case: "Create" button disabled if no variable entered

## Findings 9/3/2025
- when adding a new test case with advanced assertions, the first edit does not save. Second and later edits work **FIXED**
- toMatch with a regex string does not work with i flag - flag is not saved **FIXED**

# To Do for Release 0.1

## Bugs
*verify that these are still a thing*
**DONE** - added a project, prompt, test suite, and two test cases. Then added a second project -- first project gone
**DONE** - when visiting app, on 401 response from server, log out and redirect to login page

## UX Problems
**DONE** - when I have a prompt open and I click "create" for another prompt, all other panels should close (currently showing incorrect info because it keeps the old data) and it should switch to the new prompt
**DONE** - create test case: add expected output with no variables --> enable create button
**DONE** - after "Create New Test Suite", view test cases for the new test suite

## Tweaks
**DONE** - after creating project, jump directly to project/:id page
**DONE** - after creating prompt, jump directly to view prompt page
