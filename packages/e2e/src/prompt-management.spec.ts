import { expect, Page, test } from '@playwright/test';
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

async function createPrompt(page: Page, name: string, text: string) {
  await page.getByTestId('create-new-prompt-button').click();

  const createPromptPanel = page.getByTestId('create-prompt-panel');
  await expect(createPromptPanel).toBeVisible();

  await createPromptPanel.getByTestId('create-prompt-name-input').fill(name);
  await createPromptPanel.getByTestId('create-prompt-text-input').fill(text);

  await createPromptPanel.getByTestId('create-prompt-submit-button').click();

  await expect(createPromptPanel).not.toBeVisible();
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
      await db.knex('prompts').where('project_id', project.id).del();
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

test('Initial Page Load', async ({ page }) => {
  await expect(page.getByTestId('project-name')).toHaveText(project.name);
  await expect(page.getByTestId('project-description')).toHaveText(project.description!);
  await expect(page.getByTestId('prompts-header')).toBeVisible();
  await expect(page.getByTestId('create-new-prompt-button')).toBeVisible();
  await expect(page.getByTestId('no-prompts-message')).toBeVisible();
});

test('Create New Prompt Panel', async ({ page }) => {
  await page.getByTestId('create-new-prompt-button').click();

  const createPromptPanel = page.getByTestId('create-prompt-panel');
  await expect(createPromptPanel).toBeVisible();

  await expect(createPromptPanel.getByTestId('create-prompt-header')).toBeVisible();
  await expect(createPromptPanel.getByTestId('create-prompt-name-input')).toBeVisible();
  await expect(createPromptPanel.getByTestId('create-prompt-text-input')).toBeVisible();
  await expect(createPromptPanel.getByTestId('create-prompt-cancel-button')).toBeVisible();

  const createButton = createPromptPanel.getByTestId('create-prompt-submit-button');
  await expect(createButton).toBeVisible();
  await expect(createButton).toBeDisabled();
});

test('Enable Create Prompt Button', async ({ page }) => {
  await page.getByTestId('create-new-prompt-button').click();

  const createPromptPanel = page.getByTestId('create-prompt-panel');
  await expect(createPromptPanel).toBeVisible();

  await createPromptPanel.getByTestId('create-prompt-name-input').fill('Test Prompt Name');
  await createPromptPanel.getByTestId('create-prompt-text-input').fill('Test Prompt Text');

  const createButton = createPromptPanel.getByTestId('create-prompt-submit-button');
  await expect(createButton).toBeEnabled();
});

test('Cancel Creating a Prompt', async ({ page }) => {
  await page.getByTestId('create-new-prompt-button').click();

  const createPromptPanel = page.getByTestId('create-prompt-panel');
  await expect(createPromptPanel).toBeVisible();

  await createPromptPanel.getByTestId('create-prompt-cancel-button').click();

  await expect(createPromptPanel).not.toBeVisible();
  await expect(page.getByTestId('no-prompts-message')).toBeVisible();
});

test('Create a New Prompt', async ({ page }) => {
  const promptName = 'Test Prompt Name';
  const promptText = 'Test Prompt Text';
  await createPrompt(page, promptName, promptText);

  await expect(page.getByTestId('no-prompts-message')).not.toBeVisible();

  const editPromptPanel = page.getByTestId('edit-prompt-panel');
  await expect(editPromptPanel).not.toBeVisible();

  // Can't get by ID since we don't know it, so we'll check for the name
  const promptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  await expect(promptListItem).toBeVisible();
  await expect(promptListItem.getByText(promptName)).toBeVisible();

  const promptId = (await promptListItem.getAttribute('data-testid'))!.replace('prompt-list-item-', '');

  await expect(page.getByTestId(`view-prompt-button-${promptId}`)).toBeVisible();
  await expect(page.getByTestId(`edit-prompt-button-${promptId}`)).toBeVisible();
  await expect(page.getByTestId(`delete-prompt-button-${promptId}`)).toBeVisible();
});

test('Delete a Prompt (and cancel)', async ({ page }) => {
  const promptName = 'Test Prompt to Delete';
  const promptText = 'Test Prompt Text';
  await createPrompt(page, promptName, promptText);

  const promptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  const promptId = (await promptListItem.getAttribute('data-testid'))!.replace('prompt-list-item-', '');

  await page.getByTestId(`delete-prompt-button-${promptId}`).click();

  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();

  await confirmModal.getByTestId('confirm-no').click();

  await expect(confirmModal).not.toBeVisible();
  await expect(promptListItem).toBeVisible();
});

test('Delete a Prompt (and confirm)', async ({ page }) => {
  const promptName = 'Test Prompt to Delete';
  const promptText = 'Test Prompt Text';
  await createPrompt(page, promptName, promptText);

  const promptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  const promptId = (await promptListItem.getAttribute('data-testid'))!.replace('prompt-list-item-', '');

  await page.getByTestId(`delete-prompt-button-${promptId}`).click();

  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();

  await confirmModal.getByTestId('confirm-yes').click();

  await expect(confirmModal).not.toBeVisible();
  await expect(promptListItem).not.toBeVisible();
  await expect(page.getByTestId('no-prompts-message')).toBeVisible();
});

test('Edit a Prompt (and cancel)', async ({ page }) => {
  const promptName = 'Test Prompt to Edit';
  const promptText = 'Test Prompt Text';
  await createPrompt(page, promptName, promptText);

  const promptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  const promptId = (await promptListItem.getAttribute('data-testid'))!.replace('prompt-list-item-', '');

  await page.getByTestId(`edit-prompt-button-${promptId}`).click();

  const editPromptPanel = page.getByTestId('edit-prompt-panel');
  await expect(editPromptPanel).toBeVisible();

  await editPromptPanel.getByTestId('edit-prompt-cancel-button').click();

  await expect(editPromptPanel).not.toBeVisible();
  await expect(promptListItem.getByText(promptName)).toBeVisible();
});

test('Edit a Prompt (and save)', async ({ page }) => {
  const promptName = 'Test Prompt to Edit';
  const promptText = 'Test Prompt Text';
  await createPrompt(page, promptName, promptText);

  const promptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  const promptId = (await promptListItem.getAttribute('data-testid'))!.replace('prompt-list-item-', '');

  await page.getByTestId(`edit-prompt-button-${promptId}`).click();

  const editPromptPanel = page.getByTestId('edit-prompt-panel');
  await expect(editPromptPanel).toBeVisible();

  const newName = 'Updated Prompt Name';
  const newText = 'Updated Prompt Text';

  await editPromptPanel.locator('input[type="text"]').fill(newName);
  await editPromptPanel.locator('textarea').fill(newText);

  await editPromptPanel.getByText('Save').click();

  await expect(editPromptPanel).not.toBeVisible();

  const newPromptListItem = page.locator(`[data-testid^="prompt-list-item-"]`);
  await expect(newPromptListItem.getByText(newName)).toBeVisible();
});
