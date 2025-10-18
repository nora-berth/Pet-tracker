import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pet API
export const petAPI = {
  getAll: () => api.get('/pets/'),
  getOne: (id) => api.get(`/pets/${id}/`),
  create: (data) => api.post('/pets/', data),
  update: (id, data) => api.put(`/pets/${id}/`, data),
  delete: (id) => api.delete(`/pets/${id}/`),
};

// Weight Record API
export const weightAPI = {
  getAll: (petId = null) => {
    const url = petId ? `/weight-records/?pet=${petId}` : '/weight-records/';
    return api.get(url);
  },
  create: (data) => api.post('/weight-records/', data),
  update: (id, data) => api.put(`/weight-records/${id}/`, data),
  delete: (id) => api.delete(`/weight-records/${id}/`),
};

// Vaccination API
export const vaccinationAPI = {
  getAll: (petId = null) => {
    const url = petId ? `/vaccinations/?pet=${petId}` : '/vaccinations/';
    return api.get(url);
  },
  create: (data) => api.post('/vaccinations/', data),
  update: (id, data) => api.put(`/vaccinations/${id}/`, data),
  delete: (id) => api.delete(`/vaccinations/${id}/`),
};

// Vet Visit API
export const vetVisitAPI = {
  getAll: (petId = null) => {
    const url = petId ? `/vet-visits/?pet=${petId}` : '/vet-visits/';
    return api.get(url);
  },
  create: (data) => api.post('/vet-visits/', data),
  update: (id, data) => api.put(`/vet-visits/${id}/`, data),
  delete: (id) => api.delete(`/vet-visits/${id}/`),
};

export default api;