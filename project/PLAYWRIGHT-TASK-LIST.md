Write Playwright tests for prompt management --> insert new project into database with mock values; set up authenticated session; go to /projects/<id>
- should see title & description, prompts header, "Create New Prompt" button
- click "Create New Prompt" --> see "Create New Prompt" panel, Prompt Name input element, Prompt Text input element, Cancel button, "Create Prompt" button (disabled)
  - enter Prompt Name, Prompt Text --> "Create Prompt" button should be enabled
    - click "Cancel" --> prompt panel disappears, "No prompts found for this project." visible
    - click "Create Prompt" --> Prompt listed on page, View, Edit, Delete buttons; Edit Prompt panel is NOT visible (this is not what we see currently)
      - click "Delete" --> confirmation modal appears
        - click "No" --> confirmation modal disappears, prompt still listed on page
        - click "Yes" --> confirmation modal disappears, prompt no longer listed on page
      - click "Edit" --> edit panel appears, "Cancel" button, "Save" button is disabled
        - click "Cancel" --> edit panel disappears, no change to prompt on screen
        - change Prompt Name, Prompt Text --> "Save" button is enabled
          - click "Save" --> edit panel disappears, prompt on screen changes to match new values
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



---

## Revised Test Cases for Prompt Management

### Setup
- **File**: `packages/e2e/src/prompt-management.spec.ts`
- **`beforeEach`**:
  - Create a mock user.
  - Create a mock project associated with the user.
  - Generate a JWT for the user and set it in `localStorage`.
  - Navigate to the project's page: `/projects/<project-id>`.
- **`afterEach`**:
  - Delete the mock project and user from the database.

### Test Cases

1.  **Initial Page Load**
    - **Action**: None (initial navigation).
    - **Expected Result**:
      - The page title should contain the project name.
      - The project description should be visible.
      - A "Prompts" header should be visible.
      - A "Create New Prompt" button should be visible.
      - A "No prompts found for this project." message should be visible.

2.  **Create New Prompt Panel**
    - **Action**: Click the "Create New Prompt" button.
    - **Expected Result**:
      - The "Create New Prompt" panel should appear.
      - The panel should contain:
        - A "Prompt Name" input field.
        - A "Prompt Text" input field.
        - A "Cancel" button.
        - A "Create Prompt" button, which should be disabled.

3.  **Enable Create Prompt Button**
    - **Action**:
      1. Click "Create New Prompt".
      2. Enter text into the "Prompt Name" input.
      3. Enter text into the "Prompt Text" input.
    - **Expected Result**: The "Create Prompt" button should become enabled.

4.  **Cancel Creating a Prompt**
    - **Action**:
      1. Click "Create New Prompt".
      2. Click the "Cancel" button.
    - **Expected Result**:
      - The "Create New Prompt" panel should disappear.
      - The "No prompts found for this project." message should be visible.

5.  **Create a New Prompt**
    - **Action**:
      1. Click "Create New Prompt".
      2. Fill in "Prompt Name" and "Prompt Text".
      3. Click "Create Prompt".
    - **Expected Result**:
      - The "Create New Prompt" panel should disappear.
      - The new prompt should be listed on the page with its name.
      - The prompt entry should have "View", "Edit", and "Delete" buttons.
      - The "No prompts found for this project." message should no longer be visible.

6.  **Delete a Prompt (and cancel)**
    - **Action**:
      1. Create a new prompt.
      2. Click the "Delete" button for that prompt.
      3. A confirmation modal should appear.
      4. Click "No" in the confirmation modal.
    - **Expected Result**:
      - The confirmation modal should disappear.
      - The prompt should still be listed on the page.

7.  **Delete a Prompt (and confirm)**
    - **Action**:
      1. Create a new prompt.
      2. Click the "Delete" button for that prompt.
      3. A confirmation modal should appear.
      4. Click "Yes" in the confirmation modal.
    - **Expected Result**:
      - The confirmation modal should disappear.
      - The prompt should be removed from the list.
      - The "No prompts found for this project." message should appear.

8.  **Edit a Prompt (and cancel)**
    - **Action**:
      1. Create a new prompt.
      2. Click the "Edit" button for that prompt.
      3. An "Edit Prompt" panel should appear with "Cancel" and a disabled "Save" button.
      4. Click "Cancel".
    - **Expected Result**:
      - The "Edit Prompt" panel should disappear.
      - The prompt's content on the screen should not have changed.

9.  **Edit a Prompt (and save)**
    - **Action**:
      1. Create a new prompt.
      2. Click the "Edit" button.
      3. Change the "Prompt Name" and "Prompt Text".
      4. The "Save" button should become enabled.
      5. Click "Save".
    - **Expected Result**:
      - The "Edit Prompt" panel should disappear.
      - The prompt's name on the screen should be updated to the new name.

---

## Checklist for Writing Playwright Tests

1.  **Create New Test File**: Create `packages/e2e/src/prompt-management.spec.ts`.
2.  **Implement `beforeEach` and `afterEach`**:
    - Copy the setup from `home-project-management.spec.ts` as a starting point.
    - In `beforeEach`, after creating the project, navigate to `/projects/<project-id>`.
    - In `afterEach`, ensure all created mock data (prompts, projects, users) is cleaned up.
3.  **Write Test for Initial Page Load**:
    - Verify the project title, description, and the presence of the "Create New Prompt" button and "No prompts" message.
4.  **Write Tests for Creating Prompts**:
    - Follow the "Create New Prompt Panel", "Enable Create Prompt Button", "Cancel Creating a Prompt", and "Create a New Prompt" test cases.
    - Use `data-testid` attributes for selecting elements.
5.  **Write Tests for Deleting Prompts**:
    - Implement the "Delete a Prompt (and cancel)" and "Delete a Prompt (and confirm)" test cases.
    - You will need a helper function or to repeat the prompt creation steps in these tests.
6.  **Write Tests for Editing Prompts**:
    - Implement the "Edit a Prompt (and cancel)" and "Edit a Prompt (and save)" test cases.
7.  **Review and Refactor**:
    - Ensure all tests are independent and can run in any order.
    - Use helper functions to reduce code duplication (e.g., a function to create a prompt via the UI).
    - Check that all `data-testid` attributes follow the project's naming convention.
8.  **Run Tests**:
    - Execute the new test file to ensure all tests pass.

