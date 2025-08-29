Write Playwright tests for test suite management: insert new project into database with mock values; insert new prompt into the database for the new project; set up authenticated session; go to /projects/<id> --> should see project title & description, prompts header, prompt title plus "View", "Edit", "Delete" buttons in the prompt card

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

## E2E Tests for Test Suite Management

### Setup

- **File**: `packages/e2e/src/test-suite-management.spec.ts`
- **`beforeEach`**:
  - Create a mock user.
  - Create a mock project associated with the user.
  - Create a mock prompt associated with the project.
  - Generate a JWT for the user and set it in `localStorage`.
  - Navigate to the project's page: `/projects/<project-id>`.
- **`afterEach`**:
  - Delete the mock prompt, project, and user from the database.

### Test Cases

1.  **Initial Page Load and Prompt Details**
    - **Action**: Initial navigation to the project page.
    - **Expected Result**:
      - The project name and description should be visible.
      - A "Prompts" header should be visible.
      - The prompt card should be visible with its title and "View", "Edit", and "Delete" buttons.

2.  **View Prompt and Initial Test Suite State**
    - **Action**: Click the "View" button on the prompt card.
    - **Expected Result**:
      - A "Test Suites" title should be visible.
      - A "Create Test Suite" button should be visible.

3.  **Create New Test Suite Modal**
    - **Action**: Click the "Create Test Suite" button.
    - **Expected Result**:
      - The "Create New Test Suite" modal should appear.
      - The modal should contain a "Test Suite Name" input, a "Cancel" button, and a disabled "Create" button.

4.  **Cancel Creating a Test Suite**
    - **Action**:
      1. Click "Create Test Suite".
      2. Click the "Cancel" button.
    - **Expected Result**:
      - The modal should disappear.
      - No new test suite should be added.

5.  **Enable Create Button**
    - **Action**:
      1. Click "Create Test Suite".
      2. Enter text into the "Test Suite Name" input.
    - **Expected Result**: The "Create" button should become enabled.

6.  **Create a New Test Suite**
    - **Action**:
      1. Click "Create Test Suite".
      2. Fill in the "Test Suite Name".
      3. Click "Create".
    - **Expected Result**:
      - The modal should disappear.
      - The new test suite should be listed with "Test Cases", "Edit", "Delete", and "Run" buttons.

7.  **Delete a Test Suite (and cancel)**
    - **Action**:
      1. Create a new test suite.
      2. Click the "Delete" button for that test suite.
      3. A confirmation modal should appear.
      4. Click "No" in the confirmation modal.
    - **Expected Result**:
      - The modal should disappear.
      - The test suite should still be listed.

8.  **Delete a Test Suite (and confirm)**
    - **Action**:
      1. Create a new test suite.
      2. Click the "Delete" button.
      3. A confirmation modal should appear.
      4. Click "Yes" in the confirmation modal.
    - **Expected Result**:
      - The modal should disappear.
      - The test suite should be removed from the list.

9.  **Edit a Test Suite (and cancel)**
    - **Action**:
      1. Create a new test suite.
      2. Click the "Edit" button.
      3. An "Edit Test Suite" modal should appear.
      4. Click "Cancel".
    - **Expected Result**:
      - The modal should disappear.
      - The test suite's name should not have changed.

10. **Edit a Test Suite (and save)**
    - **Action**:
      1. Create a new test suite.
      2. Click the "Edit" button.
      3. Change the "Test Suite Name".
      4. Click "Save".
    - **Expected Result**:
      - The modal should disappear.
      - The test suite's name should be updated.

11. **View Test Cases Panel**
    - **Action**:
      1. Create a new test suite.
      2. Click the "Test Cases" button.
    - **Expected Result**:
      - The test cases panel should appear with "Add Test Case" and "Close" buttons.

12. **Close Test Cases Panel**
    - **Action**:
      1. Create a new test suite.
      2. Click "Test Cases".
      3. Click "Close".
    - **Expected Result**: The test cases panel should disappear.

13. **Add Test Case Panel (Future)**
    - **Action**:
      1. Create a new test suite.
      2. Click "Test Cases".
      3. Click "Add Test Case".
    - **Expected Result**: The "Create New Test Case" panel should appear.
