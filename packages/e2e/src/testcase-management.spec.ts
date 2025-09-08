import { expect, test } from '@playwright/test';
import { DatabaseConnector } from '@prompt-kitchen/shared/src/db/db';
import { Project } from '@prompt-kitchen/shared/src/dto/Project';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DB_PATH_FILE = path.join(os.tmpdir(), '.db-path');

const randomSuffix = () => Math.floor(Math.random() * 10000);

let project: Project;
let promptId: string;
let testSuiteId: string;

// Helper function to navigate to test cases panel
async function navigateToTestCasesPanel(page: any, promptId: string, testSuiteId: string) {
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
}

test.beforeEach(async ({ page }) => {
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });

  const userId = 'user-123';
  // Ensure user exists for foreign key constraint
  await db.knex('users').insert({
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  }).onConflict('id').ignore();

  const newProject: Omit<Project, 'createdAt' | 'updatedAt'> = {
    id: crypto.randomUUID(),
    name: `Test Project - ${Date.now()} - ${randomSuffix()}`,
    description: 'Test Description',
    userId: userId,
  };

  await db.knex('projects').insert({
    id: newProject.id,
    name: newProject.name,
    description: newProject.description,
    user_id: newProject.userId,
    created_at: new Date(),
    updated_at: new Date(),
  });

  project = {
    ...newProject,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create a prompt
  promptId = crypto.randomUUID();
  await db.knex('prompts').insert({
    id: promptId,
    name: 'Test Prompt',
    prompt: 'Hello, {{name}}!',
    project_id: project.id,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Create a test suite
  testSuiteId = crypto.randomUUID();
  await db.knex('test_suites').insert({
    id: testSuiteId,
    name: 'Test Suite',
    prompt_id: promptId,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const jwtService = new JwtService('dev-secret');
  const token = jwtService.generateJwt({
    id: userId,
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await page.addInitScript(token => {
    const userSession = {
      token,
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };
    localStorage.setItem('userSession', JSON.stringify(userSession));
    localStorage.setItem('sessionToken', token);
  }, token);

  await page.goto(`http://localhost:5173/projects/${project.id}`);
  await db.destroy();
});

test.afterEach(async () => {
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  if (project) {
    try {
      await db.knex('test_cases').where('test_suite_id', testSuiteId).del();
      await db.knex('test_suites').where('id', testSuiteId).del();
      await db.knex('prompts').where('id', promptId).del();
      await db.knex('projects').where('id', project.id).del();
    } catch (error) {
      // Ignore errors if project was already deleted
    }
  }
  try {
    await db.knex('users').where('id', 'user-123').del();
  } catch (error) {
    // Ignore errors if user was already deleted
  }
  await db.destroy();
});

// Test 1: Initial Test Cases Panel State
test('Test 1: Initial Test Cases Panel State', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  
  // Test cases panel is visible with data-testid="test-cases-panel"
  const testCasesPanel = page.getByTestId('test-cases-panel');
  await expect(testCasesPanel).toBeVisible();
  
  // Message "No test cases found for this test suite" is displayed
  await expect(page.getByText('No test cases found for this test suite')).toBeVisible();
  
  // "Add Test Case" button is visible and enabled
  const addTestCaseButton = page.getByTestId('add-test-case-button');
  await expect(addTestCaseButton).toBeVisible();
  await expect(addTestCaseButton).toBeEnabled();
});

// Test 2: Open Create Test Case Modal (Simple Mode)
test('Test 2: Open Create Test Case Modal (Simple Mode)', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  
  // Click "Add Test Case" button
  await page.getByTestId('add-test-case-button').click();
  
  // "Create New Test Case" modal appears with data-testid="create-test-case-modal"
  const createModal = page.getByTestId('create-test-case-modal');
  await expect(createModal).toBeVisible();
  
  // "Simple Test Case" tab is active/enabled
  const simpleTab = page.getByTestId('simple-tab');
  await expect(simpleTab).toBeVisible();
  
  // "Expected Output" input element is visible with data-testid="expected-output-input"
  const expectedOutputInput = page.getByTestId('expected-output-input');
  await expect(expectedOutputInput).toBeVisible();
  
  // "Create" button is disabled
  const createButton = page.getByTestId('create-test-case-submit-button');
  await expect(createButton).toBeDisabled();
});

// Test 3: Enable Create Button with Expected Output
test('Test 3: Enable Create Button with Expected Output', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Enter any value in "Expected Output" element
  await page.getByTestId('expected-output-input').fill('Test output');
  
  // "Create" button becomes enabled
  const createButton = page.getByTestId('create-test-case-submit-button');
  await expect(createButton).toBeEnabled();
});

// Test 4: Create Simple Test Case Successfully
test('Test 4: Create Simple Test Case Successfully', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Enter value in expected output
  await page.getByTestId('expected-output-input').fill('Test output');
  
  // Click "Create" button
  await page.getByTestId('create-test-case-submit-button').click();
  
  // Modal disappears (not visible)
  const createModal = page.getByTestId('create-test-case-modal');
  await expect(createModal).not.toBeVisible();
  
  // New test case appears in test case list
  const testCaseItem = page.locator('[data-testid^="test-case-item-"]').first();
  await expect(testCaseItem).toBeVisible();
  
  // Test case has "Edit" and "Delete" buttons
  await expect(testCaseItem.getByTestId('edit-test-case-button')).toBeVisible();
  await expect(testCaseItem.getByTestId('delete-test-case-button')).toBeVisible();
});

// Test 5: Add Input Variables Interface
test('Test 5: Add Input Variables Interface', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Click "Add Input" button
  await page.getByTestId('add-input-button').click();
  
  // Variable name input element appears
  const variableNameInput = page.getByTestId('input-variable-input').first();
  await expect(variableNameInput).toBeVisible();
  
  // Variable value input element appears
  const variableValueInput = page.getByTestId('input-value-input').first();
  await expect(variableValueInput).toBeVisible();
});

// Test 6: Add Multiple Input Variables
test('Test 6: Add Multiple Input Variables', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Click "Add Input" button
  await page.getByTestId('add-input-button').click();
  
  // Enter name and value in first input pair
  await page.getByTestId('input-variable-input').first().fill('name1');
  await page.getByTestId('input-value-input').first().fill('value1');
  
  // Click "Add Input" again
  await page.getByTestId('add-input-button').click();
  
  // Second variable name input element appears
  const secondNameInput = page.getByTestId('input-variable-input').nth(1);
  await expect(secondNameInput).toBeVisible();
  
  // Second variable value input element appears
  const secondValueInput = page.getByTestId('input-value-input').nth(1);
  await expect(secondValueInput).toBeVisible();
  
  // First input pair remains visible
  await expect(page.getByTestId('input-variable-input').first()).toBeVisible();
  await expect(page.getByTestId('input-value-input').first()).toBeVisible();
});

// Test 7: Remove Input Variable
test('Test 7: Remove Input Variable', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Add two input pairs
  await page.getByTestId('add-input-button').click();
  await page.getByTestId('add-input-button').click();
  
  // Click "X" button next to second input pair
  await page.getByTestId('remove-input-button').nth(1).click();
  
  // Only one variable name input element remains visible
  await expect(page.getByTestId('input-variable-input')).toHaveCount(1);
  
  // Only one variable value input element remains visible
  await expect(page.getByTestId('input-value-input')).toHaveCount(1);
});

// Test 8: Switch to Advanced Test Case Mode
test('Test 8: Switch to Advanced Test Case Mode', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  
  // Click "Advanced Test Case" tab
  await page.getByTestId('advanced-tab').click();
  
  // "Expected Output" element disappears
  await expect(page.getByTestId('expected-output-input')).not.toBeVisible();
  
  // "No assertions defined" message is visible
  await expect(page.getByText('No assertions defined')).toBeVisible();
  
  // "Add assertion" button appears
  await expect(page.getByText('+ Add assertion')).toBeVisible();
  
  // "Import from last output" button appears
  await expect(page.getByText('Import from last output')).toBeVisible();
  
  // "Preview" button appears
  await expect(page.getByText('Preview')).toBeVisible();
});

// Test 9: Add First Assertion
test('Test 9: Add First Assertion', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  await page.getByTestId('advanced-tab').click();
  
  // Click "Add assertion" button
  await page.getByText('+ Add assertion').click();
  
  // "No assertions defined" message disappears
  await expect(page.getByText('No assertions defined')).not.toBeVisible();
  
  // Assertion elements appear (checking for the first assertion row)
  const firstAssertionRow = page.locator('li[role="listitem"]').first();
  await expect(firstAssertionRow).toBeVisible();
  
  // Path input appears
  const pathInput = firstAssertionRow.locator('input[placeholder*="Path"]');
  await expect(pathInput).toBeVisible();
  
  // Match type dropdown appears (Any match/All match)
  const pathMatchSelect = firstAssertionRow.locator('select').first();
  await expect(pathMatchSelect).toBeVisible();
  
  // Matcher dropdown appears
  const matcherSelect = firstAssertionRow.locator('select').nth(1);
  await expect(matcherSelect).toBeVisible();
  
  // "Not" checkbox appears
  const notCheckbox = firstAssertionRow.locator('input[type="checkbox"]');
  await expect(notCheckbox).toBeVisible();
  
  // "Remove" button appears
  await expect(firstAssertionRow.getByText('Remove')).toBeVisible();
});

// Test 10: Enable Create Button with Valid Assertion
test('Test 10: Enable Create Button with Valid Assertion', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  await page.getByTestId('advanced-tab').click();
  await page.getByText('+ Add assertion').click();
  
  const firstAssertionRow = page.locator('li[role="listitem"]').first();
  
  // Enter "$.value" in path input
  const pathInput = firstAssertionRow.locator('input[placeholder*="Path"]');
  await pathInput.fill('$.value');
  
  // Select a match type from dropdown (should already be set to "Any match" by default)
  
  // Select a match operator from dropdown (should already be set to "toEqual" by default)
  
  // "Create" button becomes enabled
  const createButton = page.getByTestId('create-test-case-submit-button');
  await expect(createButton).toBeEnabled();
});

// Test 11: Create Advanced Test Case Successfully
test('Test 11: Create Advanced Test Case Successfully', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  await page.getByTestId('advanced-tab').click();
  await page.getByText('+ Add assertion').click();
  
  const firstAssertionRow = page.locator('li[role="listitem"]').first();
  
  // Configure assertion
  const pathInput = firstAssertionRow.locator('input[placeholder*="Path"]');
  await pathInput.fill('$.value');
  
  // Click "Create" button
  await page.getByTestId('create-test-case-submit-button').click();
  
  // Modal disappears
  const createModal = page.getByTestId('create-test-case-modal');
  await expect(createModal).not.toBeVisible();
  
  // Test case appears in test case list
  const testCaseItem = page.locator('[data-testid^="test-case-item-"]').first();
  await expect(testCaseItem).toBeVisible();
  
  // Test case has "Edit" and "Delete" buttons
  await expect(testCaseItem.getByTestId('edit-test-case-button')).toBeVisible();
  await expect(testCaseItem.getByTestId('delete-test-case-button')).toBeVisible();
});

// Test 11.1: Create Advanced Test Case and Verify Assertions are Saved
test('Test 11.1: Create Advanced Test Case and Verify Assertions are Saved', async ({ page }) => {
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  await page.getByTestId('add-test-case-button').click();
  await page.getByTestId('advanced-tab').click();
  await page.getByText('+ Add assertion').click();
  
  const firstAssertionRow = page.locator('li[role="listitem"]').first();
  
  // Configure assertion with specific values
  const pathInput = firstAssertionRow.locator('input[placeholder*="Path"]');
  await pathInput.fill('$.result');
  
  // Select matcher
  const matcherSelect = firstAssertionRow.locator('select').nth(1);
  await matcherSelect.selectOption('toEqual');
  
  // Enter expected value if needed (depends on UI implementation)
  const expectedInput = firstAssertionRow.locator('input[placeholder*="Expected"]');
  if (await expectedInput.isVisible()) {
    await expectedInput.fill('success');
  }
  
  // Click "Create" button
  await page.getByTestId('create-test-case-submit-button').click();
  
  // Modal disappears
  const createModal = page.getByTestId('create-test-case-modal');
  await expect(createModal).not.toBeVisible();
  
  // Test case appears in test case list
  const testCaseItem = page.locator('[data-testid^="test-case-item-"]').first();
  await expect(testCaseItem).toBeVisible();
  
  // IMPORTANT: Verify that the assertions are actually displayed in the test case
  // This would fail before our bug fix since assertions weren't saved on POST
  await expect(testCaseItem).toContainText('Assertions:');
  await expect(testCaseItem).toContainText('$.result');
  
  // Click edit to verify assertions are persisted
  await testCaseItem.getByTestId('edit-test-case-button').click();
  
  // Edit modal should open with advanced tab active since assertions exist
  const editModal = page.getByTestId('edit-test-case-modal');
  await expect(editModal).toBeVisible();
  
  // Should be on advanced tab
  const advancedTab = page.getByTestId('advanced-tab');
  await expect(advancedTab).toHaveClass(/border-primary/);
  
  // Assertion should be present with correct values
  const editAssertionRow = page.locator('li[role="listitem"]').first();
  const editPathInput = editAssertionRow.locator('input[placeholder*="Path"]');
  await expect(editPathInput).toHaveValue('$.result');
  
  // Cancel the edit
  await page.getByTestId('edit-test-case-cancel-button').click();
  await expect(editModal).not.toBeVisible();
});

// Test 12: Delete Test Case (Cancel)
test('Test 12: Delete Test Case (Cancel)', async ({ page }) => {
  // Setup: Create a test case first
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  
  const testCaseId = crypto.randomUUID();
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({}),
    expected_output: 'Test output',
    output_type: 'string',
    assertions: JSON.stringify([]),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();
  
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  
  // Click "Delete" button on test case
  const testCaseItem = page.getByTestId(`test-case-item-${testCaseId}`);
  await testCaseItem.getByTestId('delete-test-case-button').click();
  
  // "Are you sure you want to delete this test case?" modal appears with "No" and "Yes" buttons
  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal).toContainText('Are you sure you want to delete this test case?');
  await expect(confirmModal.getByTestId('confirm-no')).toBeVisible();
  await expect(confirmModal.getByTestId('confirm-yes')).toBeVisible();
  
  // Click "No" in confirmation modal
  await confirmModal.getByTestId('confirm-no').click();
  
  // Confirmation modal disappears
  await expect(confirmModal).not.toBeVisible();
  
  // Test case remains in list
  await expect(testCaseItem).toBeVisible();
});

// Test 13: Delete Test Case (Confirm)
test('Test 13: Delete Test Case (Confirm)', async ({ page }) => {
  // Setup: Create a test case first
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  
  const testCaseId = crypto.randomUUID();
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({}),
    expected_output: 'Test output',
    output_type: 'string',
    assertions: JSON.stringify([]),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();
  
  await navigateToTestCasesPanel(page, promptId, testSuiteId);
  
  // Click "Delete" button on test case
  const testCaseItem = page.getByTestId(`test-case-item-${testCaseId}`);
  await testCaseItem.getByTestId('delete-test-case-button').click();
  
  // "Are you sure you want to delete this test case?" modal appears with "No" and "Yes" buttons
  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal).toContainText('Are you sure you want to delete this test case?');
  await expect(confirmModal.getByTestId('confirm-no')).toBeVisible();
  await expect(confirmModal.getByTestId('confirm-yes')).toBeVisible();
  
  // Click "Yes" in confirmation modal
  await confirmModal.getByTestId('confirm-yes').click();
  
  // Confirmation modal disappears
  await expect(confirmModal).not.toBeVisible();
  
  // Test case disappears from list
  await expect(testCaseItem).not.toBeVisible();
});

// Test 14: Display Advanced Test Case Details
test('Test 14: Display Advanced Test Case Details', async ({ page }) => {
  // Setup: Create an advanced test case with assertions
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  
  const testCaseId = crypto.randomUUID();
  const assertions = [
    {
      assertionId: 'assertion-1',
      path: '$.value',
      matcher: 'toEqual',
      expected: 'hello, world',
      pathMatch: 'ANY',
    },
    {
      assertionId: 'assertion-2',
      path: '$.status',
      matcher: 'toContain',
      expected: 'success',
      pathMatch: 'ALL',
    },
  ];
  
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({ name: 'John' }),
    expected_output: 'default output',
    output_type: 'string',
    assertions: JSON.stringify(assertions),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();

  await navigateToTestCasesPanel(page, promptId, testSuiteId);

  // Test case appears in list
  const testCaseItem = page.getByTestId(`test-case-item-${testCaseId}`);
  await expect(testCaseItem).toBeVisible();

  // Test case shows "Assertions:" label instead of "Expected:"
  await expect(testCaseItem).toContainText('Assertions:');
  await expect(testCaseItem).not.toContainText('Expected:');

  // Test case displays formatted assertions
  await expect(testCaseItem).toContainText('$.value toEqual "hello, world"');
  await expect(testCaseItem).toContainText('$.status toContain "success" (ALL match)');

  // Test case shows inputs as usual
  await expect(testCaseItem).toContainText('Inputs:');
  await expect(testCaseItem).toContainText('{"name":"John"}');
});

// Test 15: Create Advanced Test Case with toMatch and Regex Flags
test('Test 15: Create Advanced Test Case with toMatch and Regex Flags', async ({ page }) => {
  // Setup: Create an advanced test case with toMatch and regex flags directly in database
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  
  const testCaseId = crypto.randomUUID();
  const assertions = [
    {
      assertionId: 'assertion-1',
      path: '$.message',
      matcher: 'toMatch',
      expected: { source: '[Hh]ello.*world', flags: 'im' },
      pathMatch: 'ANY',
    },
  ];
  
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({ greeting: 'Hello beautiful world' }),
    expected_output: 'default output',
    output_type: 'string',
    assertions: JSON.stringify(assertions),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();

  await navigateToTestCasesPanel(page, promptId, testSuiteId);

  // Test case appears in list
  const testCaseItem = page.getByTestId(`test-case-item-${testCaseId}`);
  await expect(testCaseItem).toBeVisible();

  // Test case shows "Assertions:" label
  await expect(testCaseItem).toContainText('Assertions:');

  // Test case displays formatted assertion with regex pattern and flags
  await expect(testCaseItem).toContainText('$.message toMatch {"source":"[Hh]ello.*world","flags":"im"}');

  // Test case shows inputs
  await expect(testCaseItem).toContainText('Inputs:');
  await expect(testCaseItem).toContainText('{"greeting":"Hello beautiful world"}');
});

// Test 16: Test Case with toMatch Pattern Without Flags
test('Test 16: Test Case with toMatch Pattern Without Flags', async ({ page }) => {
  // Setup: Create an advanced test case with toMatch without flags directly in database
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  
  const testCaseId = crypto.randomUUID();
  const assertions = [
    {
      assertionId: 'assertion-1',
      path: '$.status',
      matcher: 'toMatch',
      expected: 'success|completed',
      pathMatch: 'ANY',
    },
  ];
  
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({ taskResult: 'Task completed successfully' }),
    expected_output: 'default output',
    output_type: 'string',
    assertions: JSON.stringify(assertions),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();

  await navigateToTestCasesPanel(page, promptId, testSuiteId);

  // Test case appears in list
  const testCaseItem = page.getByTestId(`test-case-item-${testCaseId}`);
  await expect(testCaseItem).toBeVisible();

  // Test case shows "Assertions:" label
  await expect(testCaseItem).toContainText('Assertions:');

  // Test case displays formatted assertion with regex pattern (no flags shown when using string)
  await expect(testCaseItem).toContainText('$.status toMatch "success|completed"');

  // Test case shows inputs
  await expect(testCaseItem).toContainText('Inputs:');
  await expect(testCaseItem).toContainText('{"taskResult":"Task completed successfully"}');
});