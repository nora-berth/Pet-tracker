// Template for a new spec file.
// Copy into e2e/tests/<feature>.spec.js and fill in the real steps/assertions.
//
// Rules (see SKILL.md for the why):
// - Import test/expect from the fixtures file that provides the data you need (pet-fixtures.js
//   extends auth-fixtures.js, so it gives you testUser + authenticatedPage + testPet together).
//   If no existing fixture covers your data, add one in e2e/fixtures/ instead of creating and
//   cleaning up data by hand in the test body.
// - Every test sets allure.feature/story/severity; every describe block sets allure.epic once,
//   usually in beforeEach.
// - Wrap each logical phase in test.step(...).
// - All assertions live here, not in the page object.

import { test, expect } from '../fixtures/pet-fixtures.js';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
// import { HomePage } from '../pages/home.page.js';

test.describe('Example Feature', () => {
  test.beforeEach(async () => {
    await allure.epic('Pet Tracker');
  });

  test('describes the user-visible behavior being verified', async ({ authenticatedPage: page }) => {
    await allure.feature('Example Feature');
    await allure.story('Example Scenario');
    // BLOCKER: complete critical journey. CRITICAL: single core flow.
    // NORMAL: secondary feature. Don't default everything to the top severity.
    await allure.severity(Severity.NORMAL);

    // const examplePage = new HomePage(page);

    await test.step('Navigate to the page', async () => {
      // await examplePage.goto();
    });

    await test.step('Perform the action', async () => {
      // await examplePage.submitForm({ name: 'Example' });
    });

    await test.step('Verify the result', async () => {
      // await expect(examplePage.heading).toBeVisible();
    });
  });
});
