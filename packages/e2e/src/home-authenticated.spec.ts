import { expect, test } from '@playwright/test';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';

test.describe('Authenticated Home Page Tests', () => {
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
    await page.addInitScript((token) => {
      const userSession = {
        token,
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      localStorage.setItem('userSession', JSON.stringify(userSession));
      localStorage.setItem('sessionToken', token);
      localStorage.setItem('E2E_TEST_MODE', 'true');
    }, token);

    // Navigate to the home page
    await page.goto('http://localhost:5173/');
    
    // Set E2E test mode flag
    await page.evaluate(() => {
      localStorage.setItem('E2E_TEST_MODE', 'true');
    });
  });

  test('should have "Prompt Kitchen" title in the upper left corner', async ({ page }) => {
    const title = await page.getByTestId('sidebar-title');
    await expect(title).toBeVisible();
  });

  test('should have "Home" link in the sidebar', async ({ page }) => {
    const homeLink = await page.getByTestId('sidebar-home-link');
    await expect(homeLink).toBeVisible();
  });

  test('should have "Log Out" button in the sidebar', async ({ page }) => {
    const logoutButton = await page.getByTestId('sidebar-logout-button');
    await expect(logoutButton).toBeVisible();
  });

  test('should have "New Project" button in the body of the page', async ({ page }) => {
    const newProjectButton = await page.getByTestId('dashboard-new-project-button');
    await expect(newProjectButton).toBeVisible();
  });

  test('should have "Dashboard" title in the body of the page', async ({ page }) => {
    const dashboardTitle = await page.getByTestId('dashboard-title');
    await expect(dashboardTitle).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Clean up: Remove the token and user session from local storage
    await page.evaluate(() => {
      localStorage.removeItem('userSession');
      localStorage.removeItem('sessionToken');
    });
  });
});
