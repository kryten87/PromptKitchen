import { expect, test } from '@playwright/test';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';

test.beforeEach(async ({ page }) => {
  // Initialize JwtService with a dummy secret
  const jwtService = new JwtService('dummy-secret');

  // Generate a token for a mock user
  const token = jwtService.generateJwt({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Set the token and user session in local storage to simulate an authenticated session
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

  // Navigate to the home page
  await page.goto('http://localhost:5173/');
});

test.afterEach(async ({ page }) => {
  // Clean up: Remove the token and user session from local storage
  await page.evaluate(() => {
    localStorage.removeItem('userSession');
    localStorage.removeItem('sessionToken');
  });
});

test('home page - clicking "New Project" opens the Create New Project modal', async ({
  page,
}) => {
  // Click the "New Project" button using data-testid
  await page.getByTestId('dashboard-new-project-button').click();

  // Assert that the modal is displayed using data-testid
  await expect(page.getByTestId('create-project-modal')).toBeVisible();

  // Assert that the modal contains the required elements using data-testid attributes
  await expect(
    page.getByTestId('create-project-modal-name-input'),
  ).toBeVisible();
  await expect(
    page.getByTestId('create-project-modal-description-input'),
  ).toBeVisible();
  await expect(
    page.getByTestId('create-project-modal-submit-button'),
  ).toBeVisible();
  await expect(
    page.getByTestId('create-project-modal-cancel-button'),
  ).toBeVisible();
});

test('home page - creating a new project and cancelling', async ({ page }) => {
  // Click the "New Project" button using data-testid
  await page.getByTestId('dashboard-new-project-button').click();

  // Assert that the modal is displayed using data-testid
  await expect(page.getByTestId('create-project-modal')).toBeVisible();

  // Fill in the project name and description
  await page
    .getByTestId('create-project-modal-name-input')
    .fill('Test Project');
  await page
    .getByTestId('create-project-modal-description-input')
    .fill('Test Description');

  // Click the "Cancel" button
  await page.getByTestId('create-project-modal-cancel-button').click();

  // Assert that the modal is no longer visible
  await expect(page.getByTestId('create-project-modal')).not.toBeVisible();

  // Assert that the project card was not created
  await expect(
    page.getByTestId('project-card-Test Project'),
  ).not.toBeVisible();
});

test('home page - creating a new project and submitting', async ({ page }) => {
  // Click the "New Project" button using data-testid
  await page.getByTestId('dashboard-new-project-button').click();

  // Assert that the modal is displayed using data-testid
  await expect(page.getByTestId('create-project-modal')).toBeVisible();

  // Fill in the project name and description
  await page
    .getByTestId('create-project-modal-name-input')
    .fill('Test Project');
  await page
    .getByTestId('create-project-modal-description-input')
    .fill('Test Description');

  // Click the "Create" button
  await page.getByTestId('create-project-modal-submit-button').click();

  // Assert that the modal is no longer visible
  await expect(page.getByTestId('create-project-modal')).not.toBeVisible();

  // Assert that the project card was created
  await expect(page.getByTestId('project-card-Test Project')).toBeVisible();
});