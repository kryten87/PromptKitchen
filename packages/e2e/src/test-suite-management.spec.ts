import { expect, test } from '@playwright/test';
import { DatabaseConnector } from '@prompt-kitchen/shared/src/db/db';
import { Project } from '@prompt-kitchen/shared/src/dto/Project';
import { Prompt } from '@prompt-kitchen/shared/src/dto/Prompt';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DB_PATH_FILE = path.join(os.tmpdir(), '.db-path');

const randomSuffix = () => Math.floor(Math.random() * 10000);

let project: Project;
let promptObj: Prompt;

async function createTestSuite(page: import('@playwright/test').Page, name: string) {
    await page.getByTestId('create-test-suite-button').click();
    const modal = page.getByTestId('create-test-suite-modal');
    await modal.getByTestId('create-test-suite-name-input').fill(name);
    await modal.getByTestId('create-test-suite-submit-button').click();
    await expect(modal).not.toBeVisible();
}

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

  const newPrompt: Omit<Prompt, 'createdAt' | 'updatedAt' | 'version'> = {
    id: crypto.randomUUID(),
    name: 'Test Prompt',
    prompt: 'This is a test prompt.',
    projectId: project.id,
  };

  await db.knex('prompts').insert({
    id: newPrompt.id,
    name: newPrompt.name,
    prompt: newPrompt.prompt,
    project_id: newPrompt.projectId,
    created_at: new Date(),
    updated_at: new Date(),
  });

  promptObj = {
    ...newPrompt,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
});

test.afterEach(async () => {
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ filename: dbPath });
  if (project) {
    try {
      await db.knex('test_suites').where('prompt_id', promptObj.id).del();
      await db.knex('prompts').where('project_id', project.id).del();
      await db.knex('projects').where('id', project.id).del();
    } catch (error) {
      // Ignore errors
    }
  }
  try {
    await db.knex('users').where('id', 'user-123').del();
  } catch (error) {
    // Ignore errors
  }
  await db.destroy();
});

test('Initial Page Load and Prompt Details', async ({ page }) => {
  await expect(page.getByTestId('project-name')).toHaveText(project.name);
  await expect(page.getByTestId('project-description')).toHaveText(project.description!);
  await expect(page.getByTestId('prompts-header')).toBeVisible();
  
  const promptCard = page.getByTestId(`prompt-list-item-${promptObj.id}`);
  await expect(promptCard).toBeVisible();
  await expect(promptCard.getByTestId(`prompt-name-${promptObj.id}`)).toBeVisible();

  await expect(page.getByTestId(`view-prompt-button-${promptObj.id}`)).toBeVisible();
  await expect(page.getByTestId(`edit-prompt-button-${promptObj.id}`)).toBeVisible();
  await expect(page.getByTestId(`delete-prompt-button-${promptObj.id}`)).toBeVisible();
});

test('View Prompt and Initial Test Suite State', async ({ page }) => {
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();

  await page.waitForSelector('[data-testid="selected-prompt-header"]');

  await expect(page.getByTestId('selected-prompt-header')).toBeVisible();
  await expect(page.getByTestId('test-suites-header')).toBeVisible();
  await expect(page.getByTestId('create-test-suite-button')).toBeVisible();
});

test('Create New Test Suite Modal', async ({ page }) => {
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
  await page.waitForSelector('[data-testid="create-test-suite-button"]');
  await page.getByTestId('create-test-suite-button').click();

  const modal = page.getByTestId('create-test-suite-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByTestId('create-test-suite-name-input')).toBeVisible();
  await expect(modal.getByTestId('create-test-suite-cancel-button')).toBeVisible();
  await expect(modal.getByTestId('create-test-suite-submit-button')).toBeDisabled();
});

test('Cancel Creating a Test Suite', async ({ page }) => {
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
  await page.waitForSelector('[data-testid="create-test-suite-button"]');
  await page.getByTestId('create-test-suite-button').click();

  const modal = page.getByTestId('create-test-suite-modal');
  await modal.getByTestId('create-test-suite-cancel-button').click();

  await expect(modal).not.toBeVisible();
  await expect(page.getByTestId('no-test-suites-message')).toBeVisible();
});

test('Enable Create Button', async ({ page }) => {
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
  await page.waitForSelector('[data-testid="create-test-suite-button"]');
  await page.getByTestId('create-test-suite-button').click();

  const modal = page.getByTestId('create-test-suite-modal');
  await modal.getByTestId('create-test-suite-name-input').fill('Test Suite Name');

  await expect(modal.getByTestId('create-test-suite-submit-button')).toBeEnabled();
});

test('Create a New Test Suite', async ({ page }) => {
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
  await page.waitForSelector('[data-testid="create-test-suite-button"]');
  await createTestSuite(page, 'My New Test Suite');
  
  const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
  await expect(testSuiteListItem).toBeVisible();
  await expect(testSuiteListItem.getByText('My New Test Suite')).toBeVisible();

  const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

  await expect(page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`)).toBeVisible();
  await expect(page.getByTestId(`edit-test-suite-button-${testSuiteId}`)).toBeVisible();
  await expect(page.getByTestId(`delete-test-suite-button-${testSuiteId}`)).toBeVisible();
  await expect(page.getByTestId(`run-test-suite-button-${testSuiteId}`)).toBeVisible();
});

test('Delete a Test Suite (and cancel)', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite to Delete');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`delete-test-suite-button-${testSuiteId}`).click();

    const confirmModal = page.getByTestId('confirm-modal');
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByTestId('confirm-no').click();

    await expect(confirmModal).not.toBeVisible();
    await expect(testSuiteListItem).toBeVisible();
});

test('Delete a Test Suite (and confirm)', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite to Delete');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`delete-test-suite-button-${testSuiteId}`).click();

    const confirmModal = page.getByTestId('confirm-modal');
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByTestId('confirm-yes').click();

    await expect(confirmModal).not.toBeVisible();
    await expect(testSuiteListItem).not.toBeVisible();
    await expect(page.getByTestId('no-test-suites-message')).toBeVisible();
});

test('Edit a Test Suite (and cancel)', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite to Edit');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`edit-test-suite-button-${testSuiteId}`).click();

    const editModal = page.getByTestId('edit-test-suite-modal');
    await expect(editModal).toBeVisible();

    await editModal.getByTestId('edit-test-suite-cancel-button').click();

    await expect(editModal).not.toBeVisible();
    await expect(testSuiteListItem.getByText('Test Suite to Edit')).toBeVisible();
});

test('Edit a Test Suite (and save)', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite to Edit');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`edit-test-suite-button-${testSuiteId}`).click();

    const editModal = page.getByTestId('edit-test-suite-modal');
    await expect(editModal).toBeVisible();

    const newName = 'Updated Test Suite Name';
    await editModal.getByTestId('edit-test-suite-name-input').fill(newName);
    await editModal.getByTestId('edit-test-suite-submit-button').click();

    await expect(editModal).not.toBeVisible();
    
    const newTestSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    await expect(newTestSuiteListItem.getByText(newName)).toBeVisible();
});

test('View Test Cases Panel', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite For Test Cases');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();

    const testCasesPanel = page.getByTestId('test-cases-panel');
    await expect(testCasesPanel).toBeVisible();
    await expect(testCasesPanel.getByTestId('add-test-case-button')).toBeVisible();
    await expect(testCasesPanel.getByTestId('close-test-cases-panel-button')).toBeVisible();
});

test('Close Test Cases Panel', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite For Test Cases');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();

    const testCasesPanel = page.getByTestId('test-cases-panel');
    await expect(testCasesPanel).toBeVisible();

    await testCasesPanel.getByTestId('close-test-cases-panel-button').click();
    await expect(testCasesPanel).not.toBeVisible();
});

test('Add Test Case Panel (Future)', async ({ page }) => {
    await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
    await page.waitForSelector('[data-testid="create-test-suite-button"]');
    await createTestSuite(page, 'Test Suite For Test Cases');

    const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
    const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

    await page.getByTestId(`test-cases-test-suite-button-${testSuiteId}`).click();

    const testCasesPanel = page.getByTestId('test-cases-panel');
    await testCasesPanel.getByTestId('add-test-case-button').click();

    await expect(page.getByTestId('create-test-case-panel')).toBeVisible();
});

test('Test Suite Results Modal Shows Test Case Assertions', async ({ page }) => {
  // Create a test suite first
  await page.getByTestId(`view-prompt-button-${promptObj.id}`).click();
  await page.waitForSelector('[data-testid="create-test-suite-button"]');
  await createTestSuite(page, 'Test Suite For Results');

  const testSuiteListItem = page.locator(`[data-testid^="test-suite-list-item-"]`);
  const testSuiteId = (await testSuiteListItem.getAttribute('data-testid'))!.replace('test-suite-list-item-', '');

  // Setup: Create an advanced test case with assertions in the database
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ filename: dbPath });
  
  const testCaseId = crypto.randomUUID();
  const assertions = [
    {
      assertionId: 'assertion-1',
      path: '$.value',
      matcher: 'toEqual',
      expected: 'hello, world',
      pathMatch: 'ANY',
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

  // Run the test suite to trigger the results modal
  await page.getByTestId(`run-test-suite-button-${testSuiteId}`).click();

  // Wait for the results modal to appear (it should appear immediately)
  const resultsModal = page.locator('.fixed.inset-0.z-50');
  await expect(resultsModal).toBeVisible();
  await expect(resultsModal.getByText('Test Suite Results')).toBeVisible();

  // Check that the Assertions column shows the test case assertions
  // We should see "Test Case Assertions:" label and the formatted assertion
  await expect(resultsModal.getByText('Test Case Assertions:')).toBeVisible();
  await expect(resultsModal.getByText('$.value toEqual "hello, world"')).toBeVisible();
});
