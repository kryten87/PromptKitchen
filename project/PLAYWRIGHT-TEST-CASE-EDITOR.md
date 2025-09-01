I. authenticate, add a new project, add a new prompt, add a new test suite, click "Test Cases" --> see "No test cases found for this test suite"
  A. click "Add Test Case" --> see "Create New Test Case" modal, "Simple Test Case" tab should be enabled, "Expected Output" element should be visible, "Create" button should be disabled
    1. enter value in "Expected Output" element --> "Create" button should be enabled
      a. click "Create" --> modal disappears, new test case appears on dashboard
    2. click "Add Input" --> see variable name input element, value input element
      a. enter name, value, click "Add Input" again --> see second variable name input element, second value input element
      b. click "X" button next to second input --> see only one variable name input element, value input element
    3. click "Advanced Test Case" --> "Expected Output" element disappears, "No assertions defined" should be visible, "Add Assertion", "Import from last output", and "Preview" buttons should appear
      a. click "Add Assertion" --> "No assertions defined" disappears; "Path" input element, match type dropdown, match operator (eg. toEqual) dropdown, "Not" checkbox, and "Remove" buttons all appear
        i. enter "$.value" in path input, select a match type, select a match operator -->
