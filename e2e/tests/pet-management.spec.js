import path from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../fixtures/pet-fixtures.js';
import { createPetViaAPI, deleteAllPetsViaAPI } from '../helpers/api-helpers.js';
import * as allure from 'allure-js-commons';
import { Severity } from 'allure-js-commons';
import { HomePage } from '../pages/home.page.js';
import { PetDetailPage } from '../pages/pet-detail.page.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_PHOTO_PATH = path.resolve(__dirname, '..', 'fixtures', 'test-photo.png');

test.describe('Pet Management', () => {
  test.beforeEach(async ({ testUser }) => {
    await allure.epic('Pet Tracker');
    await deleteAllPetsViaAPI(testUser.token);
  });

  test('can view the home page', async ({ authenticatedPage: page }) => {
    await allure.feature('Pet Management');
    await allure.story('View Home Page');
    await allure.severity(Severity.CRITICAL);

    const homePage = new HomePage(page);

    await test.step('Navigate to home page', async () => {
      await homePage.goto();
    });

    await expect(homePage.appTitle).toBeVisible();
    await expect(homePage.myPetsHeading).toBeVisible();
  });

  test('can add a new pet via UI', async ({ authenticatedPage: page }) => {
    await allure.feature('Pet Management');
    await allure.story('Add Pet via UI');
    await allure.severity(Severity.CRITICAL);

    const homePage = new HomePage(page);
    const petName = `UICreatedPet_${Date.now()}`;

    await test.step('Navigate to home page', async () => {
      await homePage.goto();
    });

    await test.step('Fill in pet details and submit', async () => {
      await homePage.addPet({
        name: petName,
        species: 'dog',
        breed: 'Golden Retriever',
        birthDate: '2020-01-15',
      });
    });

    await test.step('Verify pet is added', async () => {
      await expect(homePage.myPetsHeading).toBeVisible();
      await expect(homePage.petText(petName)).toBeVisible();
    });
  });

  test('can view pet details', async ({ authenticatedPage: page, testPet }) => {
    await allure.feature('Pet Management');
    await allure.story('View Pet Details');
    await allure.severity(Severity.CRITICAL);

    const homePage = new HomePage(page);
    const petDetailPage = new PetDetailPage(page);

    await test.step('Navigate to home page', async () => {
      await homePage.goto();
    });

    await test.step('Click on pet to view details', async () => {
      await homePage.clickPet(testPet.name);
    });

    await test.step('Verify pet details are displayed', async () => {
      await expect(petDetailPage.petNameHeading(testPet.name)).toBeVisible();
      await expect(page.getByText('Test Breed')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Weight Records' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Vaccinations' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Vet Visits' })).toBeVisible();
    });
  });

  test('can add a weight record to pet', async ({ authenticatedPage: page, testPet }) => {
    await allure.feature('Health Records');
    await allure.story('Add Weight Record');
    await allure.severity(Severity.NORMAL);

    const petDetailPage = new PetDetailPage(page);

    await test.step('Navigate to pet details page', async () => {
      await petDetailPage.goto(testPet.id);
      await expect(petDetailPage.petNameHeading(testPet.name)).toBeVisible();
    });

    await test.step('Add weight record', async () => {
      await petDetailPage.addWeightRecord({
        date: '2025-01-10',
        weight: '25.5',
        unit: 'kg',
        notes: 'Test weight',
      });
    });

    await test.step('Verify weight record is added', async () => {
      await expect(petDetailPage.petNameHeading(testPet.name)).toBeVisible();
      await expect(page.getByText('25.50kg')).toBeVisible();
    });
  });

  test('can delete a pet', async ({ authenticatedPage: page, testPet }) => {
    await allure.feature('Pet Management');
    await allure.story('Delete Pet');
    await allure.severity(Severity.CRITICAL);

    const petDetailPage = new PetDetailPage(page);
    const homePage = new HomePage(page);

    await test.step('Navigate to pet details page', async () => {
      await petDetailPage.goto(testPet.id);
      await expect(petDetailPage.petNameHeading(testPet.name)).toBeVisible();
    });

    await test.step('Delete pet and accept confirmation', async () => {
      await petDetailPage.deletePet();
    });

    await test.step('Verify pet is deleted', async () => {
      await expect(homePage.myPetsHeading).toBeVisible();
      await expect(homePage.petText(testPet.name)).not.toBeVisible();
    });
  });

  test('can add a pet with photo', async ({ authenticatedPage: page }) => {
    await allure.feature('Pet Management');
    await allure.story('Add Pet with Photo');
    await allure.severity(Severity.NORMAL);

    const homePage = new HomePage(page);
    const petDetailPage = new PetDetailPage(page);
    const petName = `PhotoPet_${Date.now()}`;

    await test.step('Navigate to home page', async () => {
      await homePage.goto();
    });

    await test.step('Fill in pet details with photo and submit', async () => {
      await homePage.addPet({
        name: petName,
        species: 'cat',
        photoPath: TEST_PHOTO_PATH,
      });
    });

    await test.step('Verify pet is added and navigate to details', async () => {
      await expect(homePage.myPetsHeading).toBeVisible();
      await expect(homePage.petText(petName)).toBeVisible();
      await homePage.clickPet(petName);
    });

    await test.step('Verify photo is displayed on pet detail page', async () => {
      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(petDetailPage.petPhoto(petName)).toBeVisible();
    });
  });
});

test.describe('Complete User Journey (Happy Path)', () => {
  test.beforeEach(async ({ testUser }) => {
    await allure.epic('Pet Tracker');
    await deleteAllPetsViaAPI(testUser.token);
  });

  test('complete pet management flow', async ({ authenticatedPage: page }) => {
    await allure.feature('End-to-End User Journey');
    await allure.story('Complete Pet Management Flow');
    await allure.severity(Severity.BLOCKER);

    const homePage = new HomePage(page);
    const petDetailPage = new PetDetailPage(page);
    const petName = `FlowTestPet_${Date.now()}`;

    await test.step('Add a new pet', async () => {
      await homePage.goto();
      await homePage.addPet({
        name: petName,
        species: 'cat',
        breed: 'Persian',
        birthDate: '2020-01-15',
        notes: 'Complete flow test cat',
      });
    });

    await test.step('View pet details', async () => {
      await expect(homePage.myPetsHeading).toBeVisible();
      await homePage.clickPet(petName);

      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(page.getByText('Persian')).toBeVisible();
      await expect(page.getByText('Complete flow test cat')).toBeVisible();
    });

    await test.step('Add a weight record', async () => {
      await petDetailPage.addWeightRecord({
        date: '2025-01-10',
        weight: '4.5',
        unit: 'kg',
        notes: 'Initial weight check',
      });

      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(page.getByText('4.50kg')).toBeVisible();
      await expect(page.getByText('Initial weight check')).toBeVisible();
    });

    await test.step('Add a vaccination', async () => {
      await petDetailPage.addVaccination({
        vaccineName: 'Rabies',
        dateAdministered: '2025-01-05',
        dueDate: '2026-01-05',
        veterinarian: 'Dr. Smith',
        notes: 'Annual vaccination',
      });

      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(page.getByText('Rabies')).toBeVisible();
      await expect(page.getByText('Dr. Smith')).toBeVisible();
    });

    await test.step('Add a vet visit', async () => {
      await petDetailPage.addVetVisit({
        visitDate: '2025-01-08',
        reason: 'Annual checkup',
        veterinarian: 'Dr. Johnson',
        cost: '125.00',
        notes: 'All healthy, recommended diet change',
      });

      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(page.getByText('Annual checkup')).toBeVisible();
      await expect(page.getByText('Dr. Johnson')).toBeVisible();
      await expect(page.getByText('$125.00')).toBeVisible();
    });

    await test.step('Edit pet details', async () => {
      await petDetailPage.clickEdit();
      await petDetailPage.submitEdit({
        breed: 'Siamese',
        notes: 'Updated: Very friendly Siamese cat',
      });

      // Verify updates
      await expect(petDetailPage.petNameHeading(petName)).toBeVisible();
      await expect(page.locator('p.breed')).toHaveText('Siamese');
      await expect(page.getByText('Updated: Very friendly Siamese cat')).toBeVisible();

      // Verify all records are still there after edit
      await expect(page.getByText('4.50kg')).toBeVisible();
      await expect(page.getByText('Rabies')).toBeVisible();
      await expect(page.getByText('Annual checkup')).toBeVisible();
    });

    await test.step('Delete pet', async () => {
      await petDetailPage.deletePet();

      // Verify redirected to home and pet is gone
      await expect(homePage.myPetsHeading).toBeVisible();
      await expect(homePage.petText(petName)).not.toBeVisible();
    });
  });
});
