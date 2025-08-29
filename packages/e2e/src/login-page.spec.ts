import { expect, test } from '@playwright/test';

test('login page - should have "Login with Google" button', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:5173/login');

  // Check for the presence of the "Login with Google" button
  const loginButton = await page.locator('button:has-text("Login with Google")');

  // Assert that the button is visible
  await expect(loginButton).toBeVisible();
});
