import { expect, test } from '@playwright/test';
import { JwtService } from '@prompt-kitchen/shared/src/services/JwtService';

test('login page - authenticated user should redirect to /', async ({ page }) => {
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

  // Navigate to the login page
  await page.goto('http://localhost:5173/login');

  // Assert that the user is redirected to the home page
  await expect(page).toHaveURL('http://localhost:5173/');

  // Clean up: Remove the token and user session from local storage
  await page.evaluate(() => {
    localStorage.removeItem('userSession');
    localStorage.removeItem('sessionToken');
  });
});
