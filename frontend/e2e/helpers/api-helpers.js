const API_BASE_URL = 'http://localhost:8000/api';

// Cache for auth token
let cachedToken = null;

/**
 * Login and get auth token
 * @param {string} username - Defaults to TEST_USER or 'testuser')
 * @param {string} password - Defaults to TEST_PASSWORD or 'testpass123')
 * @returns {Promise<string>} Auth token
 */
export async function loginViaAPI(
  username = process.env.TEST_USER || 'testuser',
  password = process.env.TEST_PASSWORD || 'testpass123'
) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const data = await response.json();
  cachedToken = data.token;
  return data.token;
}

/**
 * Get auth token (login if needed)
 * @returns {Promise<string>} Auth token
 */
async function getAuthToken() {
  if (!cachedToken) {
    await loginViaAPI();
  }
  return cachedToken;
}

/**
 * Get auth headers
 * @param {string} token - Optional token to use (falls back to cached token)
 * @returns {Promise<Object>} Headers with Authorization
 */
async function getAuthHeaders(token = null) {
  const authToken = token || await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${authToken}`,
  };
}

/**
 * Create a pet via API
 * @param {Object} petData - Name, species, etc.)
 * @param {string} token - Optional auth token (falls back to cached token)
 * @returns {Promise<Object>} Created pet object with id
 */
export async function createPetViaAPI(petData, token = null) {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/pets/`, {
    method: 'POST',
    headers,
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
 * @param {string} token - Optional auth token (falls back to cached token)
 */
export async function deletePetViaAPI(petId, token = null) {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/pets/${petId}/`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete pet: ${response.statusText}`);
  }
}

/**
 * Create a weight record via API
 * @param {Object} weightData - Weight record data
 * @param {string} token - Optional auth token (falls back to cached token)
 * @returns {Promise<Object>} Created weight record
 */
export async function createWeightRecordViaAPI(weightData, token = null) {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/weight-records/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(weightData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create weight record: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get all pets via API
 * @param {string} token - Optional auth token (falls back to cached token)
 * @returns {Promise<Array>} Array of pets
 */
export async function getAllPetsViaAPI(token = null) {
  const headers = await getAuthHeaders(token);
  const response = await fetch(`${API_BASE_URL}/pets/`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pets: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || data;
}

/**
 * Delete all pets via API
 * @param {string} token - Optional auth token (falls back to cached token)
 */
export async function deleteAllPetsViaAPI(token = null) {
  const pets = await getAllPetsViaAPI(token);

  for (const pet of pets) {
    await deletePetViaAPI(pet.id, token);
  }
}

/**
 * Clear cached auth token
 */
export function clearAuthToken() {
  cachedToken = null;
}