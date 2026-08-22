import { test, expect } from '../fixtures/auth-fixtures.js';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { LoginPage } from '../pages/login.page.js';
import { SignupPage } from '../pages/signup.page.js';
import { NavComponent } from '../pages/nav.component.js';
import { HomePage } from '../pages/home.page.js';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('redirects unauthenticated users to login page', async ({ page }) => {
    await allure.severity(Severity.BLOCKER);
    await allure.description('Verify that unauthenticated users are redirected to login page');

    const loginPage = new LoginPage(page);

    await test.step('Navigate to home page', async () => {
      await page.goto('/');
    });

    await test.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(loginPage.heading).toBeVisible();
    });
  });

  test('allows user to sign up with valid credentials', async ({ page }) => {
    await allure.severity(Severity.BLOCKER);
    await allure.description('Test user registration with valid data');

    const timestamp = Date.now();
    const testUser = {
      username: `testuser_${timestamp}`,
      email: `testuser_${timestamp}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
    };

    const signupPage = new SignupPage(page);
    const nav = new NavComponent(page);

    await test.step('Navigate to signup page', async () => {
      await signupPage.goto();
      await expect(signupPage.heading).toBeVisible();
    });

    await test.step('Fill in and submit signup form', async () => {
      await signupPage.signup(testUser);
    });

    await test.step('Verify successful signup and auto-login', async () => {
      await expect(page).toHaveURL('/', { timeout: 5000 });
      await expect(nav.welcomeText(testUser.username)).toBeVisible();
      await expect(nav.logoutButton).toBeVisible();
    });
  });

  test('shows validation errors for invalid signup data', async ({ page }) => {
    await allure.severity(Severity.NORMAL);
    await allure.description('Test validation errors during registration');

    const signupPage = new SignupPage(page);
    const timestamp = Date.now();

    await test.step('Navigate to signup page', async () => {
      await signupPage.goto();
    });

    await test.step('Submit form with mismatched passwords', async () => {
      await signupPage.username.fill(`testuser_mismatch_${timestamp}`);
      await signupPage.email.fill(`testuser_mismatch_${timestamp}@example.com`);
      await signupPage.password.fill('password123');
      await signupPage.confirmPassword.fill('different456');
      await signupPage.signupButton.click();
    });

    await test.step('Verify validation error is displayed', async () => {
      await expect(page.getByText('Passwords do not match.')).toBeVisible();
    });
  });

  test('allows user to login with valid credentials', async ({ page, testUser }) => {
    await allure.severity(Severity.BLOCKER);
    await allure.description('Test user login with valid credentials');

    const loginPage = new LoginPage(page);
    const nav = new NavComponent(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
      await expect(loginPage.heading).toBeVisible();
    });

    await test.step('Fill in and submit login form', async () => {
      await loginPage.login(testUser.username, testUser.password);
    });

    await test.step('Verify successful login', async () => {
      await expect(page).toHaveURL('/', { timeout: 5000 });
      await expect(nav.welcomeText(testUser.username)).toBeVisible();
      await expect(nav.logoutButton).toBeVisible();
    });
  });

  test('shows error message for invalid login credentials', async ({ page }) => {
    await allure.severity(Severity.CRITICAL);
    await allure.description('Test error handling for invalid login credentials');

    const loginPage = new LoginPage(page);

    await test.step('Navigate to login page', async () => {
      await loginPage.goto();
    });

    await test.step('Submit form with invalid credentials', async () => {
      await loginPage.login('invaliduser', 'wrongpassword');
    });

    await test.step('Verify error message is displayed', async () => {
      await expect(loginPage.errorMessage).toBeVisible();
    });

    await test.step('Verify user remains on login page', async () => {
      await expect(page).toHaveURL('/login');
    });
  });

  test('allows user to logout', async ({ page, testUser }) => {
    await allure.severity(Severity.BLOCKER);
    await allure.description('Test user logout functionality');

    const loginPage = new LoginPage(page);
    const nav = new NavComponent(page);

    await test.step('Login first', async () => {
      await loginPage.goto();
      await loginPage.login(testUser.username, testUser.password);
      await expect(page).toHaveURL('/');
    });

    await test.step('Click logout button', async () => {
      await nav.logout();
    });

    await test.step('Verify redirect to login page', async () => {
      await expect(page).toHaveURL('/login', { timeout: 5000 });
      await expect(loginPage.heading).toBeVisible();
    });

    await test.step('Verify cannot access protected routes', async () => {
      await page.goto('/');
      await expect(page).toHaveURL('/login');
    });
  });

  test('persists authentication across page refreshes', async ({ page, testUser }) => {
    await allure.severity(Severity.CRITICAL);
    await allure.description('Test that authentication persists after page refresh');

    const loginPage = new LoginPage(page);
    const nav = new NavComponent(page);

    await test.step('Login', async () => {
      await loginPage.goto();
      await loginPage.login(testUser.username, testUser.password);
      await expect(page).toHaveURL('/');
    });

    await test.step('Refresh the page', async () => {
      await page.reload();
    });

    await test.step('Verify user is still authenticated', async () => {
      await expect(page).toHaveURL('/');
      await expect(nav.welcomeText(testUser.username)).toBeVisible();
      await expect(nav.logoutButton).toBeVisible();
    });
  });

  test('navigates between login and signup pages', async ({ page }) => {
    await allure.severity(Severity.NORMAL);
    await allure.description('Test navigation between login and signup pages');

    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);

    await test.step('Start on login page', async () => {
      await loginPage.goto();
      await expect(loginPage.heading).toBeVisible();
    });

    await test.step('Click signup link', async () => {
      await loginPage.signupLink.click();
    });

    await test.step('Verify navigation to signup page', async () => {
      await expect(page).toHaveURL('/signup');
      await expect(signupPage.heading).toBeVisible();
    });

    await test.step('Click login link', async () => {
      await signupPage.loginLink.click();
    });

    await test.step('Verify navigation back to login page', async () => {
      await expect(page).toHaveURL('/login');
      await expect(loginPage.heading).toBeVisible();
    });
  });
});

test.describe('Multi-Tenancy', () => {
  test('users can only see their own pets', async ({ page, context }) => {
    await allure.severity(Severity.BLOCKER);
    await allure.description('Test that users can only see their own pets (multi-tenancy)');

    const signupPage = new SignupPage(page);
    const homePage = new HomePage(page);
    const nav = new NavComponent(page);

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
      await signupPage.goto();
      await signupPage.signupBasic(user1.username, user1.email, user1.password);
      await expect(page).toHaveURL('/');
    });

    await test.step('Create pet as user 1', async () => {
      await homePage.addPet({ name: 'User1 Pet', species: 'dog' });
      await expect(homePage.petText('User1 Pet')).toBeVisible();
    });

    await test.step('Logout user 1', async () => {
      await nav.logout();
      await expect(page).toHaveURL('/login');
    });

    await test.step('Create and login as user 2', async () => {
      await signupPage.goto();
      await signupPage.signupBasic(user2.username, user2.email, user2.password);
      await expect(page).toHaveURL('/');
    });

    await test.step('Verify user 2 cannot see user 1 pet', async () => {
      // User 2 should see empty pet list
      await expect(homePage.petText('User1 Pet')).not.toBeVisible();
      await expect(homePage.emptyStateText).toBeVisible();
    });

    await test.step('Create pet as user 2', async () => {
      await homePage.addPet({ name: 'User2 Pet', species: 'cat' });
      await expect(homePage.petText('User2 Pet')).toBeVisible();
    });

    await test.step('Verify user 2 only sees their own pet', async () => {
      await expect(homePage.petText('User2 Pet')).toBeVisible();
      await expect(homePage.petText('User1 Pet')).not.toBeVisible();
    });
  });
});
