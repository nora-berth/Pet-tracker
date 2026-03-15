import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('redirects unauthenticated users to login page', async ({ page }) => {
    await allure.severity('blocker');
    await allure.description('Verify that unauthenticated users are redirected to login page');

    await test.step('Navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'Login to Pet Tracker' })).toBeVisible();
    });
  });

  test('allows user to sign up with valid credentials', async ({ page }) => {
    await allure.severity('blocker');
    await allure.description('Test user registration with valid data');

    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `testuser_${timestamp}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
    };

    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup');
      await expect(page.getByRole('heading', { name: 'Sign Up for Pet Tracker' })).toBeVisible();
    });

    await test.step('Fill in signup form', async () => {
      await page.getByLabel(/username/i).fill(testUser.username);
      await page.getByLabel(/email/i).fill(testUser.email);
      await page.getByLabel('First Name').fill(testUser.firstName);
      await page.getByLabel('Last Name').fill(testUser.lastName);
      await page.getByLabel(/^password\s*\*?$/i).fill(testUser.password);
      await page.getByLabel(/confirm password/i).fill(testUser.password);
    });

    await test.step('Submit signup form', async () => {
      await page.getByRole('button', { name: /sign up/i }).click();
    });

    await test.step('Verify successful signup and auto-login', async () => {
      await expect(page).toHaveURL('/', { timeout: 5000 });

      await expect(page.getByText(`Welcome, ${testUser.username}`)).toBeVisible();
      
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });
  });

  test('shows validation errors for invalid signup data', async ({ page }) => {
    await allure.severity('normal');
    await allure.description('Test validation errors during registration');

    await test.step('Navigate to signup page', async () => {
      await page.goto('/signup');
    });

    await test.step('Submit form with mismatched passwords', async () => {
      await page.getByLabel(/username/i).fill('testuser');
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/^password\s*\*?$/i).fill('password123');
      await page.getByLabel(/confirm password/i).fill('different456');
      await page.getByRole('button', { name: /sign up/i }).click();
    });

    await test.step('Verify validation error is displayed', async () => {
      await expect(page.getByText(/password/i)).toBeVisible();
    });
  });

  test('allows user to login with valid credentials', async ({ page }) => {
    await allure.severity('blocker');
    await allure.description('Test user login with valid credentials');

    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login to Pet Tracker' })).toBeVisible();
    });

    await test.step('Fill in login form', async () => {
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass123');
    });

    await test.step('Submit login form', async () => {
      await page.getByRole('button', { name: /login/i }).click();
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL('/', { timeout: 5000 });

      await expect(page.getByText('Welcome, testuser')).toBeVisible();

      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });
  });

  test('shows error message for invalid login credentials', async ({ page }) => {
    await allure.severity('critical');
    await allure.description('Test error handling for invalid login credentials');

    await test.step('Navigate to login page', async () => {
      await page.goto('/login');
    });

    await test.step('Submit form with invalid credentials', async () => {
      await page.getByLabel('Username').fill('invaliduser');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: /login/i }).click();
    });

    await test.step('Verify error message is displayed', async () => {
      await expect(page.getByText(/invalid/i)).toBeVisible();
    });

    await test.step('Verify user remains on login page', async () => {
      await expect(page).toHaveURL('/login');
    });
  });

  test('allows user to logout', async ({ page }) => {
    await allure.severity('blocker');
    await allure.description('Test user logout functionality');

    await test.step('Login first', async () => {
      await page.goto('/login');
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass123');
      await page.getByRole('button', { name: /login/i }).click();
      await expect(page).toHaveURL('/');
    });

    await test.step('Click logout button', async () => {
      await page.getByRole('button', { name: /logout/i }).click();
    });

    await test.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL('/login', { timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Login to Pet Tracker' })).toBeVisible();
    });

    await test.step('Verify cannot access protected routes', async () => {
      await page.goto('/');
      await expect(page).toHaveURL('/login');
    });
  });

  test('persists authentication across page refreshes', async ({ page }) => {
    await allure.severity('critical');
    await allure.description('Test that authentication persists after page refresh');

    await test.step('Login', async () => {
      await page.goto('/login');
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass123');
      await page.getByRole('button', { name: /login/i }).click();
      await expect(page).toHaveURL('/');
    });

    await test.step('Refresh the page', async () => {
      await page.reload();
    });

    await test.step('Verify user is still authenticated', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByText('Welcome, testuser')).toBeVisible();
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    });
  });

  test('navigates between login and signup pages', async ({ page }) => {
    await allure.severity('normal');
    await allure.description('Test navigation between login and signup pages');

    await test.step('Start on login page', async () => {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Login to Pet Tracker' })).toBeVisible();
    });

    await test.step('Click signup link', async () => {
      await page.getByRole('link', { name: /sign up/i }).click();
    });

    await test.step('Verify navigation to signup page', async () => {
      await expect(page).toHaveURL('/signup');
      await expect(page.getByRole('heading', { name: 'Sign Up for Pet Tracker' })).toBeVisible();
    });

    await test.step('Click login link', async () => {
      await page.getByRole('link', { name: /login/i }).click();
    });

    await test.step('Verify navigation back to login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'Login to Pet Tracker' })).toBeVisible();
    });
  });
});

test.describe('Multi-Tenancy', () => {
  test('users can only see their own pets', async ({ page, context }) => {
    await allure.severity('blocker');
    await allure.description('Test that users can only see their own pets (multi-tenancy)');

    // Create unique usernames for this test
    const timestamp = Date.now();
    const user1 = {
      username: `user1_${timestamp}`,
      email: `user1_${timestamp}@example.com`,
      password: 'testpass123',
    };
    const user2 = {
      username: `user2_${timestamp}`,
      email: `user2_${timestamp}@example.com`,
      password: 'testpass123',
    };

    await test.step('Create and login as user 1', async () => {
      await page.goto('/signup');
      await page.getByLabel(/username/i).fill(user1.username);
      await page.getByLabel(/email/i).fill(user1.email);
      await page.getByLabel(/^password\s*\*?$/i).fill(user1.password);
      await page.getByLabel(/confirm password/i).fill(user1.password);
      await page.getByRole('button', { name: /sign up/i }).click();
      await expect(page).toHaveURL('/');
    });

    await test.step('Create pet as user 1', async () => {
      await page.getByRole('link', { name: /add new pet/i }).click();
      await page.getByLabel(/pet name/i).fill('User1 Pet');
      await page.getByLabel(/species/i).selectOption('dog');
      await page.getByRole('button', { name: /add pet/i }).click();
      await expect(page.getByText('User1 Pet')).toBeVisible();
    });

    await test.step('Logout user 1', async () => {
      await page.getByRole('button', { name: /logout/i }).click();
      await expect(page).toHaveURL('/login');
    });

    await test.step('Create and login as user 2', async () => {
      await page.goto('/signup');
      await page.getByLabel(/username/i).fill(user2.username);
      await page.getByLabel(/email/i).fill(user2.email);
      await page.getByLabel(/^password\s*\*?$/i).fill(user2.password);
      await page.getByLabel(/confirm password/i).fill(user2.password);
      await page.getByRole('button', { name: /sign up/i }).click();
      await expect(page).toHaveURL('/');
    });

    await test.step('Verify user 2 cannot see user 1 pet', async () => {
      // User 2 should see empty pet list
      await expect(page.getByText('User1 Pet')).not.toBeVisible();
      await expect(page.getByText(/no pets found/i)).toBeVisible();
    });

    await test.step('Create pet as user 2', async () => {
      await page.getByRole('link', { name: /add new pet/i }).click();
      await page.getByLabel(/pet name/i).fill('User2 Pet');
      await page.getByLabel(/species/i).selectOption('cat');
      await page.getByRole('button', { name: /add pet/i }).click();
      await expect(page.getByText('User2 Pet')).toBeVisible();
    });

    await test.step('Verify user 2 only sees their own pet', async () => {
      await expect(page.getByText('User2 Pet')).toBeVisible();
      await expect(page.getByText('User1 Pet')).not.toBeVisible();
    });
  });
});
