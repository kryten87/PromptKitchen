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



test.beforeEach(async ({ page }) => {
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ filename: dbPath });

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
  const db = new DatabaseConnector({ filename: dbPath });
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

test('Test Case 1: Test Case Panel UI and Basic Interaction', async ({ page }) => {
  // Navigate to the prompt details page first
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  
  // 1. Click the "Test Cases" button associated with Test Suite
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
  
  // 2. Assert: The "Test Cases" panel becomes visible
  const testCasesPanel = page.getByTestId('test-cases-panel');
  await expect(testCasesPanel).toBeVisible();
  
  // 3. Assert: The panel title is Test Cases for "Test Suite"
  await expect(testCasesPanel.getByTestId('test-cases-header')).toHaveText('Test Cases for "Test Suite"');
  
  // 4. Assert: An "Add Test Case" button is visible inside the panel
  await expect(testCasesPanel.getByTestId('add-test-case-button')).toBeVisible();
  
  // 5. Assert: A "Close" button is visible inside the panel
  await expect(testCasesPanel.getByTestId('close-test-cases-panel-button')).toBeVisible();
  
  // 6. Click the "Close" button
  await testCasesPanel.getByTestId('close-test-cases-panel-button').click();
  
  // 7. Assert: The "Test Cases" panel is no longer visible
  await expect(testCasesPanel).not.toBeVisible();
});

test('Test Case 2: "Create New Test Case" Panel Interaction', async ({ page }) => {
  // Navigate to the prompt details page first
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  
  // 1. Click the "Test Cases" button for Test Suite
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
  
  // 2. Click the "Add Test Case" button
  const testCasesPanel = page.getByTestId('test-cases-panel');
  await testCasesPanel.getByTestId('add-test-case-button').click();
  
  // 3. Assert: The "Create New Test Case" panel appears with the title Create New Test Case
  const createTestCasePanel = page.getByTestId('create-test-case-panel');
  await expect(createTestCasePanel).toBeVisible();
  await expect(createTestCasePanel.getByTestId('create-test-case-header')).toHaveText('Create New Test Case');
  
  // 4. Assert: The "Create" button is disabled
  const createButton = createTestCasePanel.getByTestId('create-test-case-submit-button');
  await expect(createButton).toBeDisabled();
  
  // 5. Click the "Cancel" button
  await createTestCasePanel.getByTestId('create-test-case-cancel-button').click();
  
  // 6. Assert: The "Create New Test Case" panel disappears
  await expect(createTestCasePanel).not.toBeVisible();
  
  // 7. Click the "Add Test Case" button again
  await testCasesPanel.getByTestId('add-test-case-button').click();
  
  // 8. Click the "Add Input" button
  await createTestCasePanel.getByTestId('add-input-button').click();
  
  // 9. Assert: A new input row appears containing a variable name input, a value input, and a "X" (delete) button
  const inputRow = createTestCasePanel.locator('[data-testid^="input-row-"]').first();
  await expect(inputRow).toBeVisible();
  await expect(inputRow.getByTestId('input-variable-input')).toBeVisible();
  await expect(inputRow.getByTestId('input-value-input')).toBeVisible();
  await expect(inputRow.getByTestId('remove-input-button')).toBeVisible();
  
  // 10. Click the "X" button
  await inputRow.getByTestId('remove-input-button').click();
  
  // 11. Assert: The input row is removed
  await expect(inputRow).not.toBeVisible();
});

test('Test Case 3: Create, Verify, and Cancel Creation of a Test Case', async ({ page }) => {
  // Navigate to the prompt details page first
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  
  // 1. Click the "Test Cases" button for Test Suite
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
  
  const testCasesPanel = page.getByTestId('test-cases-panel');
  
  // 2. Click the "Add Test Case" button
  await testCasesPanel.getByTestId('add-test-case-button').click();
  
  const createTestCasePanel = page.getByTestId('create-test-case-panel');
  
  // 3. Click "Add Input", and enter name for the variable and world for the value
  await createTestCasePanel.getByTestId('add-input-button').click();
  const inputRow = createTestCasePanel.locator('[data-testid^="input-row-"]').first();
  await inputRow.getByTestId('input-variable-input').fill('name');
  await inputRow.getByTestId('input-value-input').fill('world');
  
  // 4. Enter Hello, world! in the "Expected Output" field
  await createTestCasePanel.getByTestId('expected-output-input').fill('Hello, world!');
  
  // 5. Assert: The "Create" button is now enabled
  const createButton = createTestCasePanel.getByTestId('create-test-case-submit-button');
  await expect(createButton).toBeEnabled();
  
  // 6. Click the "Cancel" button
  await createTestCasePanel.getByTestId('create-test-case-cancel-button').click();
  
  // 7. Assert: The "Create New Test Case" panel disappears
  await expect(createTestCasePanel).not.toBeVisible();
  
  // 8. Assert: The message "No test cases found for this test suite" is displayed in the "Test Cases" panel
  await expect(testCasesPanel.getByTestId('no-test-cases-message')).toBeVisible();
  
  // 9. Repeat steps 2-4
  await testCasesPanel.getByTestId('add-test-case-button').click();
  await createTestCasePanel.getByTestId('add-input-button').click();
  const inputRow2 = createTestCasePanel.locator('[data-testid^="input-row-"]').first();
  await inputRow2.getByTestId('input-variable-input').fill('name');
  await inputRow2.getByTestId('input-value-input').fill('world');
  await createTestCasePanel.getByTestId('expected-output-input').fill('Hello, world!');
  
  // 10. Click the "Create" button
  await createButton.click();
  
  // 11. Assert: The "Create New Test Case" panel disappears
  await expect(createTestCasePanel).not.toBeVisible();
  
  // 12. Assert: A new test case appears in the list, showing a Test Case ID, an "Edit" button, and a "Delete" button
  const testCaseItem = testCasesPanel.locator('[data-testid^="test-case-item-"]').first();
  await expect(testCaseItem).toBeVisible();
  await expect(testCaseItem.getByTestId('edit-test-case-button')).toBeVisible();
  await expect(testCaseItem.getByTestId('delete-test-case-button')).toBeVisible();
});

test('Test Case 4: Delete a Test Case', async ({ page }) => {
  // Setup: Create a test case with one input (name: world) and an expected output (Hello, world!)
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ filename: dbPath });
  
  const testCaseId = crypto.randomUUID();
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({ name: 'world' }),
    expected_output: 'Hello, world!',
    output_type: 'string',
    assertions: JSON.stringify([]),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();
  
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
  const testCasesPanel = page.getByTestId('test-cases-panel');
  
  // 2. Click the "Delete" button for the created test case
  const testCaseItem = testCasesPanel.getByTestId(`test-case-item-${testCaseId}`);
  await testCaseItem.getByTestId('delete-test-case-button').click();
  
  // 3. Assert: A confirmation modal appears with the message "Are you sure you want to delete this test case?"
  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal).toContainText('Are you sure you want to delete this test case?');
  
  // 4. Click the "No" button
  await confirmModal.getByTestId('confirm-no').click();
  
  // 5. Assert: The modal disappears and the test case remains in the list
  await expect(confirmModal).not.toBeVisible();
  await expect(testCaseItem).toBeVisible();
  
  // 6. Click the "Delete" button again
  await testCaseItem.getByTestId('delete-test-case-button').click();
  
  // 7. Click the "Yes" button
  await confirmModal.getByTestId('confirm-yes').click();
  
  // 8. Assert: The test case is removed from the list
  await expect(testCaseItem).not.toBeVisible();
  
  // 9. Assert: The message "No test cases found for this test suite" is displayed
  await expect(testCasesPanel.getByTestId('no-test-cases-message')).toBeVisible();
});

test('Test Case 5: Edit a Test Case', async ({ page }) => {
  // Setup: Create a test case with one input (name: world) and an expected output (Hello, world!)
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ filename: dbPath });
  
  const testCaseId = crypto.randomUUID();
  await db.knex('test_cases').insert({
    id: testCaseId,
    test_suite_id: testSuiteId,
    inputs: JSON.stringify({ name: 'world' }),
    expected_output: 'Hello, world!',
    output_type: 'string',
    assertions: JSON.stringify([]),
    run_mode: 'DEFAULT',
    created_at: new Date(),
    updated_at: new Date(),
  });
  await db.destroy();
  
  await page.getByTestId(`view-prompt-button-${promptId}`).click();
  await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();
  const testCasesPanel = page.getByTestId('test-cases-panel');
  
  // 2. Click the "Edit" button for the created test case
  const testCaseItem = testCasesPanel.getByTestId(`test-case-item-${testCaseId}`);
  await testCaseItem.getByTestId('edit-test-case-button').click();
  
  // 3. Assert: The "Edit Test Case" panel appears
  const editTestCasePanel = page.getByTestId('edit-test-case-panel');
  await expect(editTestCasePanel).toBeVisible();
  
  // 4. Assert: The input variable is pre-filled with name and world
  const inputRow = editTestCasePanel.locator('[data-testid^="input-row-"]').first();
  await expect(inputRow.getByTestId('input-variable-input')).toHaveValue('name');
  await expect(inputRow.getByTestId('input-value-input')).toHaveValue('world');
  
  // 5. Assert: The expected output is pre-filled with Hello, world!
  await expect(editTestCasePanel.getByTestId('expected-output-input')).toHaveValue('Hello, world!');
  
  // 6. Click the "Cancel" button
  await editTestCasePanel.getByTestId('edit-test-case-cancel-button').click();
  
  // 7. Assert: The "Edit Test Case" panel disappears and the test case is unchanged
  await expect(editTestCasePanel).not.toBeVisible();
  await expect(testCaseItem).toBeVisible();
  
  // 8. Click the "Edit" button again
  await testCaseItem.getByTestId('edit-test-case-button').click();
  
  // 9. Change the input variable's value to galaxy
  await inputRow.getByTestId('input-value-input').fill('galaxy');
  
  // 10. Change the expected output to Hello, galaxy!
  await editTestCasePanel.getByTestId('expected-output-input').fill('Hello, galaxy!');
  
  // 11. Click the "Update" button
  await editTestCasePanel.getByTestId('edit-test-case-update-button').click();
  
  // 12. Assert: The "Edit Test Case" panel disappears
  await expect(editTestCasePanel).not.toBeVisible();
  
  // 13. Assert: The test case in the list now reflects the updated values
  // We can verify this by editing again to see the persisted values
  await testCaseItem.getByTestId('edit-test-case-button').click();
  await expect(inputRow.getByTestId('input-value-input')).toHaveValue('galaxy');
  await expect(editTestCasePanel.getByTestId('expected-output-input')).toHaveValue('Hello, galaxy!');
});