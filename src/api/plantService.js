import { apiFetch } from './apiClient'

export async function getPlants() {
  return apiFetch('/api/plants')
}

export async function createPlant(plant) {
  return apiFetch('/api/plants', { method: 'POST', body: plant })
}

export async function updatePlant(id, plant) {
  return apiFetch(`/api/plants/${encodeURIComponent(id)}`, { method: 'PUT', body: plant })
}

export async function deletePlant(id) {
  return apiFetch(`/api/plants/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
