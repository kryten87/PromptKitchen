setup: create project, create prompt, create test suite; authenticate

- click "Test Cases" button --> "Test Cases" panel appears; title = 'Test Cases for "<name>"', "Add Test Case" button, "Close" button
  - click "Close" button --> "Test Cases" panel disappears
  - click "Add Test Case" button --> "Create New Test Case" panel appears; "Create New Test Case" title; "Cancel" button; "Create" button (disabled); "Add Input" button; "Expected Output" text input; "JSON Output" checkbox; "Add Assertion" button; "Import from last output" button; "Preview" button; "DEFAULT/SKIP/ONLY" radio buttons
    - click "Cancel" --> "Create New Test Case" panel disappears
    - click "Add Input" --> variable input element appears; value input element appears; "X" button appears
      - click "X" button --> input elements disappear
      - enter variable, value in input elements, value in expected output --> "Create" button is enabled
        - click "Cancel" --> "Create New Test Case" panel disappears; "No test cases found for this test suite" message displayed
        - click "Create" --> Test case appears in list with Test Case ID, "Edit" button, "Delete" button
          - click "Delete" --> "Are you sure you want to delete this test case?" modal appears; "No" button; "Yes" button
            - click "No" --> modal disappears, test case still appears in list
            - click "Yes" --> test case disappears, "No test cases found for this test suite" message displayed
          - click "Edit" --> "Edit Test Case" panel appears; input variables are populated with values from test case; expected output is populated with values from test case; "Cancel" button; "Update" button
            - click "Cancel" --> "Edit Test Case" panel disappears; test case still appears in list
            - change input variable name, value, click "Update" --> "Edit Test Case" panel disappears; test case is updated in list

## Playwright Test Case Checklist

This checklist provides a structured set of test cases for Playwright implementation based on the requirements above.

### Test Setup

For each test case, perform the following initial setup:

1. Authenticate as a test user.
2. Create a new project named `Test Project`.
3. Inside `Test Project`, create a new prompt named `Test Prompt`.
4. Inside `Test Prompt`, create a new test suite named `Test Suite`.
5. Navigate to the `Test Prompt` editor page.

---

### Test Case 1: Test Case Panel UI and Basic Interaction

**Objective**: Verify that the "Test Cases" panel can be opened and closed, and that its initial state is correct.

**Steps**:

1.  Click the "Test Cases" button associated with `Test Suite`.
2.  **Assert**: The "Test Cases" panel becomes visible.
3.  **Assert**: The panel title is `Test Cases for "Test Suite"`.
4.  **Assert**: An "Add Test Case" button is visible inside the panel.
5.  **Assert**: A "Close" button is visible inside the panel.
6.  Click the "Close" button.
7.  **Assert**: The "Test Cases" panel is no longer visible.

---

### Test Case 2: "Create New Test Case" Panel Interaction

**Objective**: Verify the functionality of the "Create New Test Case" panel, including cancellation and input management.

**Steps**:

1.  Click the "Test Cases" button for `Test Suite`.
2.  Click the "Add Test Case" button.
3.  **Assert**: The "Create New Test Case" panel appears with the title `Create New Test Case`.
4.  **Assert**: The "Create" button is disabled.
5.  Click the "Cancel" button.
6.  **Assert**: The "Create New Test Case" panel disappears.
7.  Click the "Add Test Case" button again.
8.  Click the "Add Input" button.
9.  **Assert**: A new input row appears containing a variable name input, a value input, and a "X" (delete) button.
10. Click the "X" button.
11. **Assert**: The input row is removed.

---

### Test Case 3: Create, Verify, and Cancel Creation of a Test Case

**Objective**: Verify that a test case can be created and that the creation process can be cancelled.

**Steps**:

1.  Click the "Test Cases" button for `Test Suite`.
2.  Click the "Add Test Case" button.
3.  Click "Add Input", and enter `name` for the variable and `world` for the value.
4.  Enter `Hello, world!` in the "Expected Output" field.
5.  **Assert**: The "Create" button is now enabled.
6.  Click the "Cancel" button.
7.  **Assert**: The "Create New Test Case" panel disappears.
8.  **Assert**: The message "No test cases found for this test suite" is displayed in the "Test Cases" panel.
9.  Repeat steps 2-4.
10. Click the "Create" button.
11. **Assert**: The "Create New Test Case" panel disappears.
12. **Assert**: A new test case appears in the list, showing a Test Case ID, an "Edit" button, and a "Delete" button.

---

### Test Case 4: Delete a Test Case

**Objective**: Verify that a test case can be deleted after confirming the action.

**Steps**:

1.  **Setup**: Create a test case with one input (`name`: `world`) and an expected output (`Hello, world!`).
2.  Click the "Delete" button for the created test case.
3.  **Assert**: A confirmation modal appears with the message "Are you sure you want to delete this test case?".
4.  Click the "No" button.
5.  **Assert**: The modal disappears and the test case remains in the list.
6.  Click the "Delete" button again.
7.  Click the "Yes" button.
8.  **Assert**: The test case is removed from the list.
9.  **Assert**: The message "No test cases found for this test suite" is displayed.

---

### Test Case 5: Edit a Test Case

**Objective**: Verify that a test case can be edited and updated.

**Steps**:

1.  **Setup**: Create a test case with one input (`name`: `world`) and an expected output (`Hello, world!`).
2.  Click the "Edit" button for the created test case.
3.  **Assert**: The "Edit Test Case" panel appears.
4.  **Assert**: The input variable is pre-filled with `name` and `world`.
5.  **Assert**: The expected output is pre-filled with `Hello, world!`.
6.  Click the "Cancel" button.
7.  **Assert**: The "Edit Test Case" panel disappears and the test case is unchanged.
8.  Click the "Edit" button again.
9.  Change the input variable's value to `galaxy`.
10. Change the expected output to `Hello, galaxy!`.
11. Click the "Update" button.
12. **Assert**: The "Edit Test Case" panel disappears.
13. **Assert**: The test case in the list now reflects the updated values (you may need to re-open the edit panel to confirm the change was persisted).
