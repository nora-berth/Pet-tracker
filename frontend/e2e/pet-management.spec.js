import { test, expect } from './fixtures/pet-fixtures.js';
import { createPetViaAPI, deleteAllPetsViaAPI } from './helpers/api-helpers.js';

test.describe('Pet Management', () => {

  test.beforeEach(async () => {
    await deleteAllPetsViaAPI();
  });

  test('can view the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Pet Tracker')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Pets' })).toBeVisible();
  });

  test('can add a new pet via UI', async ({ page }) => {
    const petName = `UICreatedPet_${Date.now()}`;

    await page.goto('/');
    await page.getByRole('button', { name: 'Add Pet' }).click();

    await expect(page.getByRole('heading', { name: 'Add New Pet' })).toBeVisible();

    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Species').selectOption('dog');
    await page.getByLabel('Breed').fill('Golden Retriever');
    await page.getByLabel('Birth Date').fill('2020-01-15');

    await page.getByRole('button', { name: 'Add Pet', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'My Pets' })).toBeVisible();
    await expect(page.getByText(petName)).toBeVisible();
  });

  test('can view pet details', async ({ page, testPet }) => {
    await page.goto('/');
    await page.getByRole('heading', { name: testPet.name }).first().click();

    await expect(page.getByRole('heading', { name: testPet.name, level: 1 })).toBeVisible();
    await expect(page.getByText('Test Breed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Weight Records' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vaccinations' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
  });

  test('can add a weight record to pet', async ({ page, testPet }) => {
    const weightSection = page.getByRole('heading', { name: 'Weight Records' }).locator('..');

    await page.goto(`/pets/${testPet.id}`);
    await expect(page.getByRole('heading', { name: testPet.name, level: 1 })).toBeVisible();

    await weightSection.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('heading', { name: 'Add Weight Record' })).toBeVisible();

    await page.getByLabel('Date').fill('2025-01-10');
    await page.getByLabel('Weight').fill('25.5');
    await page.getByLabel('Unit').selectOption('kg');
    await page.getByLabel('Notes').fill('Test weight');

    await page.getByRole('button', { name: 'Add Weight Record' }).click();

    await expect(page.getByRole('heading', { name: testPet.name, level: 1 })).toBeVisible();
    await expect(page.getByText('25.50kg')).toBeVisible();
  });

  test('can delete a pet', async ({ page, testPet }) => {
    await page.goto(`/pets/${testPet.id}`);
    await expect(page.getByRole('heading', { name: testPet.name, level: 1 })).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete Pet' }).click();

    await expect(page.getByRole('heading', { name: 'My Pets' })).toBeVisible();
    await expect(page.getByText(testPet.name)).not.toBeVisible();
  });
});

test.describe('Complete User Journey (Happy Path)', () => {

  test.beforeEach(async () => {
    await deleteAllPetsViaAPI();
  });

  test('complete pet management flow', async ({ page }) => {
    const petName = `FlowTestPet_${Date.now()}`;

    // 1. Add a pet
    await page.goto('/');
    await page.getByRole('button', { name: 'Add Pet' }).click();

    await expect(page.getByRole('heading', { name: 'Add New Pet' })).toBeVisible();

    await page.getByLabel('Name').fill(petName);
    await page.getByLabel('Species').selectOption('cat');
    await page.getByLabel('Breed').fill('Persian');
    await page.getByLabel('Birth Date').fill('2020-01-15');
    await page.getByLabel('Notes').fill('Complete flow test cat');

    await page.getByRole('button', { name: 'Add Pet', exact: true }).click();

    // 2. View pet details
    await expect(page.getByRole('heading', { name: 'My Pets' })).toBeVisible();
    await page.getByRole('heading', { name: petName }).click();

    await expect(page.getByRole('heading', { name: petName, level: 1 })).toBeVisible();
    await expect(page.getByText('Persian')).toBeVisible();
    await expect(page.getByText('Complete flow test cat')).toBeVisible();

    // 3. Add a weight record
    const weightSection = page.getByRole('heading', { name: 'Weight Records' }).locator('..');
    await weightSection.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('heading', { name: 'Add Weight Record' })).toBeVisible();

    await page.getByLabel('Date').fill('2025-01-10');
    await page.getByLabel('Weight').fill('4.5');
    await page.getByLabel('Unit').selectOption('kg');
    await page.getByLabel('Notes').fill('Initial weight check');

    await page.getByRole('button', { name: 'Add Weight Record' }).click();

    await expect(page.getByRole('heading', { name: petName, level: 1 })).toBeVisible();
    await expect(page.getByText('4.50kg')).toBeVisible();
    await expect(page.getByText('Initial weight check')).toBeVisible();

    // 4. Add a vaccination
    const vaccinationSection = page.getByRole('heading', { name: 'Vaccinations' }).locator('..');
    await vaccinationSection.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('heading', { name: 'Add Vaccination' })).toBeVisible();

    await page.getByLabel('Vaccine Name').fill('Rabies');
    await page.getByLabel('Date Administered').fill('2025-01-05');
    await page.getByLabel('Due Date').fill('2026-01-05');
    await page.getByLabel('Veterinarian').fill('Dr. Smith');
    await page.getByLabel('Notes').fill('Annual vaccination');

    await page.getByRole('button', { name: 'Add Vaccination' }).click();

    await expect(page.getByRole('heading', { name: petName, level: 1 })).toBeVisible();
    await expect(page.getByText('Rabies')).toBeVisible();
    await expect(page.getByText('Dr. Smith')).toBeVisible();

    // 5. Add a vet visit
    const vetVisitSection = page.getByRole('heading', { name: 'Vet Visits' }).locator('..');
    await vetVisitSection.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('heading', { name: 'Add Vet Visit' })).toBeVisible();

    await page.getByLabel('Visit Date').fill('2025-01-08');
    await page.getByLabel('Reason').fill('Annual checkup');
    await page.getByLabel('Veterinarian').fill('Dr. Johnson');
    await page.getByLabel('Cost').fill('125.00');
    await page.getByLabel('Notes').fill('All healthy, recommended diet change');

    await page.getByRole('button', { name: 'Add Vet Visit' }).click();

    await expect(page.getByRole('heading', { name: petName, level: 1 })).toBeVisible();
    await expect(page.getByText('Annual checkup')).toBeVisible();
    await expect(page.getByText('Dr. Johnson')).toBeVisible();
    await expect(page.getByText('$125.00')).toBeVisible();

    // 6. Edit pet
    await page.getByRole('button', { name: 'Edit Pet' }).click();

    await expect(page.getByRole('heading', { name: 'Edit Pet' })).toBeVisible();

    // Change breed
    await page.getByLabel('Breed').clear();
    await page.getByLabel('Breed').fill('Siamese');

    // Update notes
    await page.getByLabel('Notes').clear();
    await page.getByLabel('Notes').fill('Updated: Very friendly Siamese cat');

    await page.getByRole('button', { name: 'Update Pet' }).click();

    // Verify updates
    await expect(page.getByRole('heading', { name: petName, level: 1 })).toBeVisible();
    await expect(page.locator('p.breed')).toHaveText('Siamese');
    await expect(page.getByText('Updated: Very friendly Siamese cat')).toBeVisible();

    // Verify all records are still there after edit
    await expect(page.getByText('4.50kg')).toBeVisible();
    await expect(page.getByText('Rabies')).toBeVisible();
    await expect(page.getByText('Annual checkup')).toBeVisible();

    // 7. Delete pet
    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: 'Delete Pet' }).click();

    // Verify redirected to home and pet is gone
    await expect(page.getByRole('heading', { name: 'My Pets' })).toBeVisible();
    await expect(page.getByText(petName)).not.toBeVisible();
  });
});