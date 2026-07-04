import { test as base } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Create a user via API
 */
async function createUserViaAPI(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    ...userData,
    token: data.token,
    id: data.user.id,
  };
}

/**
 * Delete a user via token
 */
async function deleteUserViaAPI(token) {
  // Logout (deletes token)
  await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });
}

/**
 * Fixture: Creates and cleans up a test user
 */
export const test = base.extend({
  testUser: async ({}, use) => {
    const timestamp = Date.now();
    const user = await createUserViaAPI({
      username: `e2e_user_${timestamp}`,
      email: `e2e_${timestamp}@test.com`,
      password: 'testpass123',
      password_confirm: 'testpass123',
    });

    await use(user);

    // Teardown: Delete user token
    try {
      await deleteUserViaAPI(user.token);
    } catch (error) {
      console.log(`Cleanup warning: ${error.message}`);
    }
  },

  /**
   * Fixture: Provides an authenticated page (already logged in)
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    // Login via UI
    await page.goto('/login');
    await page.getByLabel('Username').fill(testUser.username);
    await page.getByLabel('Password').fill(testUser.password);
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('/', { timeout: 5000 });

    await use(page);

    // Cleanup handled by testUser fixture
  },
});

export { expect } from '@playwright/test';
