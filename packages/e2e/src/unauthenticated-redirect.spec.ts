import { expect, test } from '@playwright/test';

test.describe('Unauthenticated Access', () => {
  test('should redirect to /login when visiting /', async ({ page }) => {
    // Navigate to the root route
    await page.goto('http://localhost:5173/');

    // Assert that the user is redirected to the login page
    await expect(page).toHaveURL('http://localhost:5173/login');
  });
});
