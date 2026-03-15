import { test as authTest } from './auth-fixtures.js';
import { createPetViaAPI, deletePetViaAPI } from '../helpers/api-helpers.js';

/**
 * Extends auth fixtures with testPet fixture
 * Provides: testUser, authenticatedPage, testPet
 */
export const test = authTest.extend({
  testPet: async ({ testUser }, use) => {
    // Setup: Create pet using testUser's token
    const pet = await createPetViaAPI({
      name: `TestPet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      species: 'dog',
      breed: 'Test Breed',
    }, testUser.token);

    await use(pet);

    // Teardown: Delete using same user's token
    try {
      await deletePetViaAPI(pet.id, testUser.token);
    } catch (error) {
      console.log(`Cleanup failed for pet ${pet.id}:`, error.message);
    }
  },
});

export { expect } from '@playwright/test';