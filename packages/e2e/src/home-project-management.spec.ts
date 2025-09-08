import { expect, test } from '@playwright/test';
import { DatabaseConnector } from '@prompt-kitchen/shared/src/db/db';
import { Project } from '@prompt-kitchen/shared/src/dto/Project';
import { toKebabCase } from '@prompt-kitchen/shared/src/helpers/toKebabCase';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

const DB_PATH_FILE = path.join(os.tmpdir(), '.db-path');

const randomSuffix = () => Math.floor(Math.random() * 10000);

let project: Project;

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

  await page.goto('http://localhost:5173/');

});

test.afterEach(async () => {
  const dbPath = fs.readFileSync(DB_PATH_FILE, 'utf-8');
  const db = new DatabaseConnector({ dbFile: dbPath });
  if (project) {
    try {
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

test('hovers over project card to show edit and delete buttons', async ({
  page,
}) => {
  const projectCard = page.getByTestId(
    `project-list-item-${toKebabCase(project.name)}`,
  );
  await projectCard.hover();

  await expect(
    projectCard.getByTestId(`project-list-item-edit-button-${toKebabCase(project.name)}`),
  ).toBeVisible();
  await expect(
    projectCard.getByTestId(`project-list-item-delete-button-${toKebabCase(project.name)}`),
  ).toBeVisible();
});

test('shows delete confirmation modal and cancels', async ({ page }) => {
  const projectCard = page.getByTestId(
    `project-list-item-${toKebabCase(project.name)}`,
  );
  await projectCard.hover();
  await projectCard.getByTestId(
    `project-list-item-delete-button-${toKebabCase(project.name)}`,
  ).click();

  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();
  await expect(confirmModal).toContainText(
    'Are you sure you want to delete this project?',
  );

  await confirmModal.getByTestId('confirm-no').click();
  await expect(confirmModal).not.toBeVisible();
  await expect(projectCard).toBeVisible();
});

test('deletes a project from the dashboard', async ({ page }) => {
  const projectCard = page.getByTestId(
    `project-list-item-${toKebabCase(project.name)}`,
  );
  await projectCard.hover();
  await projectCard.getByTestId(
    `project-list-item-delete-button-${toKebabCase(project.name)}`,
  ).click();

  const confirmModal = page.getByTestId('confirm-modal');
  await expect(confirmModal).toBeVisible();

  await confirmModal.getByTestId('confirm-yes').click();
  await expect(confirmModal).not.toBeVisible();
  await expect(projectCard).not.toBeVisible();
});

test('shows edit project modal and cancels', async ({ page }) => {
  const projectCard = page.getByTestId(
    `project-list-item-${toKebabCase(project.name)}`,
  );
  await projectCard.hover();
  await projectCard.getByTestId(
    `project-list-item-edit-button-${toKebabCase(project.name)}`,
  ).click();

  const editModal = page.getByTestId('edit-project-modal');
  await expect(editModal).toBeVisible();
  await expect(editModal).toContainText('Edit Project');

  await expect(
    editModal.getByTestId('edit-project-modal-name-input'),
  ).toHaveValue(project.name);
  await expect(
    editModal.getByTestId('edit-project-modal-description-input'),
  ).toHaveValue(project.description!);

  await editModal.getByTestId('edit-project-modal-cancel-button').click();
  await expect(editModal).not.toBeVisible();
  await expect(projectCard).toBeVisible();
});

test('edits a project from the dashboard', async ({ page }) => {
  const projectCard = page.getByTestId(
    `project-list-item-${toKebabCase(project.name)}`,
  );
  await projectCard.hover();
  await projectCard.getByTestId(
    `project-list-item-edit-button-${toKebabCase(project.name)}`,
  ).click();

  const editModal = page.getByTestId('edit-project-modal');
  await expect(editModal).toBeVisible();

  const newName = `Updated Project Name - ${randomSuffix()}`;
  const newDescription = 'Updated Description';

  await editModal.getByTestId('edit-project-modal-name-input').fill(newName);
  await editModal
    .getByTestId('edit-project-modal-description-input')
    .fill(newDescription);

  await editModal.getByTestId('edit-project-modal-submit-button').click();
  await expect(editModal).not.toBeVisible();

  const updatedCard = page.getByTestId(`project-list-item-${toKebabCase(newName)}`);
  await expect(updatedCard).toBeVisible();
  await expect(updatedCard).toContainText(newName);
});