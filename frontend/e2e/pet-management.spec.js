import { test, expect } from '@playwright/test';

test.describe('Pet Management', () => {
  test('can view the home page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Pet Tracker')).toBeVisible();
    await expect(page.locator('text=My Pets')).toBeVisible();
  });
});