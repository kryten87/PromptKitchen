import { expect, test } from '@playwright/test';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';

test('authenticated user on / clicking "Log Out" clears local storage and redirects to /login', async ({ page }) => {
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
  }, token);

  // Navigate to the home page
  await page.goto('http://localhost:5173/');

  // Click the "Log Out" button
  await page.click('text=Log Out');

  // Assert that the user is redirected to the login page
  await expect(page).toHaveURL('http://localhost:5173/login');

  // Assert that local storage is cleared
  const localStorageContent = await page.evaluate(() => ({
    userSession: localStorage.getItem('userSession'),
    sessionToken: localStorage.getItem('sessionToken'),
  }));
  expect(localStorageContent.userSession).toBeNull();
  expect(localStorageContent.sessionToken).toBeNull();
});
