import { test as base } from '@playwright/test';
import { createPetViaAPI, deletePetViaAPI } from '../helpers/api-helpers.js';

/**
 * Automatically creates and cleans up a test pet
 */
export const test = base.extend({
  testPet: async ({}, use) => {
    // Setup
    const pet = await createPetViaAPI({
      name: `TestPet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, // Unique name
      species: 'dog',
      breed: 'Test Breed',
    });

    // Provide pet to test
    await use(pet);

    // Teardown
    try {
      await deletePetViaAPI(pet.id);
    } catch (error) {
      console.log(`Cleanup failed for pet ${pet.id}:`, error.message);
    }
  },
});

export { expect } from '@playwright/test';