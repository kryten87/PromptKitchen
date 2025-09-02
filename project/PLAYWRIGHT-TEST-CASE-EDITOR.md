I. authenticate, add a new project, add a new prompt, add a new test suite, click "Test Cases" --> see "No test cases found for this test suite"
A. click "Add Test Case" --> see "Create New Test Case" modal, "Simple Test Case" tab should be enabled, "Expected Output" element should be visible, "Create" button should be disabled 1. enter value in "Expected Output" element --> "Create" button should be enabled
a. click "Create" --> modal disappears, new test case appears on dashboard 2. click "Add Input" --> see variable name input element, value input element
a. enter name, value, click "Add Input" again --> see second variable name input element, second value input element
b. click "X" button next to second input --> see only one variable name input element, value input element 3. click "Advanced Test Case" --> "Expected Output" element disappears, "No assertions defined" should be visible, "Add Assertion", "Import from last output", and "Preview" buttons should appear
a. click "Add Assertion" --> "No assertions defined" disappears; "Path" input element, match type dropdown, match operator (eg. toEqual) dropdown, "Not" checkbox, and "Remove" buttons all appear
i. enter "$.value" in path input, select a match type, select a match operator --> "Create" button should be enabled \* click "Create" --> Test case should be added in Test Case list with "Edit" and "Delete" buttons - click "Delete" --> "Are you sure you want to delete this test case?" modal appears with "No" and "Yes" buttons
. click "No" --> "Are you sure" modal disappears; test case remains in list
. click "Yes" --> "Are you sure" modal disappears; test case disappears from list

---

## Playwright Test Case Instructions

### Initial Setup (All Tests)

**Test Context:** Testing the test case editor functionality within a test suite
**Setup Steps:**

1. Authenticate user with JWT token using `JwtService`
2. Create test database records:
   - Insert user into `users` table
   - Insert project into `projects` table
   - Insert prompt into `prompts` table
   - Insert test suite into `test_suites` table
3. Navigate to project page: `http://localhost:5173/projects/${projectId}`
4. Click on the prompt's "View" button to access prompt details
5. Click "Test Cases" button for the test suite to open the test cases panel

### Test Cases

#### Test 1: Initial Test Cases Panel State

**Preconditions:** Complete initial setup through step 5
**Actions:** None (verify initial state)
**Expected Results:**

- Test cases panel is visible with `data-testid="test-cases-panel"`
- Message "No test cases found for this test suite" is displayed
- "Add Test Case" button is visible and enabled

#### Test 2: Open Create Test Case Modal (Simple Mode)

**Preconditions:** Complete initial setup + Test 1 state
**Actions:** Click "Add Test Case" button
**Expected Results:**

- "Create New Test Case" modal appears with `data-testid="create-test-case-modal"`
- "Simple Test Case" tab is active/enabled
- "Expected Output" input element is visible with `data-testid="expected-output-input"`
- "Create" button is disabled

#### Test 3: Enable Create Button with Expected Output

**Preconditions:** Complete Test 2 steps
**Actions:** Enter any value in "Expected Output" element
**Expected Results:**

- "Create" button becomes enabled

#### Test 4: Create Simple Test Case Successfully

**Preconditions:** Complete Test 3 steps
**Actions:** Click "Create" button
**Expected Results:**

- Modal disappears (not visible)
- New test case appears in test case list
- Test case has "Edit" and "Delete" buttons

#### Test 5: Add Input Variables Interface

**Preconditions:** Complete Test 2 steps (modal open, simple mode)
**Actions:** Click "Add Input" button
**Expected Results:**

- Variable name input element appears
- Variable value input element appears

#### Test 6: Add Multiple Input Variables

**Preconditions:** Complete Test 5 steps
**Actions:**

1. Enter name and value in first input pair
2. Click "Add Input" again
   **Expected Results:**

- Second variable name input element appears
- Second variable value input element appears
- First input pair remains visible

#### Test 7: Remove Input Variable

**Preconditions:** Complete Test 6 steps (two input pairs visible)
**Actions:** Click "X" button next to second input pair
**Expected Results:**

- Only one variable name input element remains visible
- Only one variable value input element remains visible

#### Test 8: Switch to Advanced Test Case Mode

**Preconditions:** Complete Test 2 steps (modal open, simple mode)
**Actions:** Click "Advanced Test Case" tab
**Expected Results:**

- "Expected Output" element disappears
- "No assertions defined" message is visible
- "Add Assertion" button appears
- "Import from last output" button appears
- "Preview" button appears

#### Test 9: Add First Assertion

**Preconditions:** Complete Test 8 steps
**Actions:** Click "Add Assertion" button
**Expected Results:**

- "No assertions defined" message disappears
- "Path" input element appears
- Match type dropdown appears
- Match operator dropdown (e.g., toEqual) appears
- "Not" checkbox appears
- "Remove" button appears

#### Test 10: Enable Create Button with Valid Assertion

**Preconditions:** Complete Test 9 steps
**Actions:**

1. Enter "$.value" in path input
2. Select a match type from dropdown
3. Select a match operator from dropdown
   **Expected Results:**

- "Create" button becomes enabled

#### Test 11: Create Advanced Test Case Successfully

**Preconditions:** Complete Test 10 steps
**Actions:** Click "Create" button
**Expected Results:**

- Modal disappears
- Test case appears in test case list
- Test case has "Edit" and "Delete" buttons

#### Test 12: Delete Test Case (Cancel)

**Preconditions:** Complete Test 11 steps (test case exists in list)
**Actions:**

1. Click "Delete" button on test case
2. Click "No" in confirmation modal
   **Expected Results:**

- "Are you sure you want to delete this test case?" modal appears with "No" and "Yes" buttons
- After clicking "No": confirmation modal disappears
- Test case remains in list

#### Test 13: Delete Test Case (Confirm)

**Preconditions:** Complete Test 11 steps (test case exists in list)
**Actions:**

1. Click "Delete" button on test case
2. Click "Yes" in confirmation modal
   **Expected Results:**

- "Are you sure you want to delete this test case?" modal appears with "No" and "Yes" buttons
- After clicking "Yes": confirmation modal disappears
- Test case disappears from list

### Implementation Checklist

- [ ] Set up test file following pattern from `test-suite-management.spec.ts`
- [ ] Create beforeEach setup with authentication and database seeding
- [ ] Create afterEach cleanup to remove test data
- [ ] Implement helper function to navigate to test cases panel
- [ ] Write Test 1: Verify initial test cases panel state
- [ ] Write Test 2: Open create test case modal in simple mode
- [ ] Write Test 3: Enable create button with expected output
- [ ] Write Test 4: Create simple test case successfully
- [ ] Write Test 5: Add input variables interface
- [ ] Write Test 6: Add multiple input variables
- [ ] Write Test 7: Remove input variable
- [ ] Write Test 8: Switch to advanced test case mode
- [ ] Write Test 9: Add first assertion
- [ ] Write Test 10: Enable create button with valid assertion
- [ ] Write Test 11: Create advanced test case successfully
- [ ] Write Test 12: Delete test case (cancel)
- [ ] Write Test 13: Delete test case (confirm)
- [ ] Verify all tests use proper `data-testid` selectors
- [ ] Run tests to ensure they pass: `npm --workspace=packages/e2e test`
