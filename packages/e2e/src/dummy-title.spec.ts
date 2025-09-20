import { expect, test } from '@playwright/test';

test('dummy test - check page title', async ({ page }) => {
  // Navigate to the application page
  await page.goto('http://localhost:5173');

  // Retrieve the page title
  const title = await page.title();

  // Assert that the title matches the expected value
  expect(title).toBe('Prompt Kitchen');
});
