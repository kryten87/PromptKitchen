
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

