const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Create a pet via API
 * @param {Object} petData - Pet data (name, species, etc.)
 * @returns {Promise<Object>} Created pet object with id
 */
export async function createPetViaAPI(petData) {
  const response = await fetch(`${API_BASE_URL}/pets/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create pet: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete a pet via API
 * @param {number} petId - ID of pet to delete
 */
export async function deletePetViaAPI(petId) {
  const response = await fetch(`${API_BASE_URL}/pets/${petId}/`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete pet: ${response.statusText}`);
  }
}

/**
 * Create a weight record via API
 * @param {Object} weightData - Weight record data
 * @returns {Promise<Object>} Created weight record
 */
export async function createWeightRecordViaAPI(weightData) {
  const response = await fetch(`${API_BASE_URL}/weight-records/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(weightData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create weight record: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all pets via API
 * @returns {Promise<Array>} Array of pets
 */
export async function getAllPetsViaAPI() {
  const response = await fetch(`${API_BASE_URL}/pets/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch pets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || data;
}

/**
 * Delete all pets via API
 */
export async function deleteAllPetsViaAPI() {
  const pets = await getAllPetsViaAPI();
  
  for (const pet of pets) {
    await deletePetViaAPI(pet.id);
  }
}