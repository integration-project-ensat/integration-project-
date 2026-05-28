// SCRUM-139 — Connect profile data to API
// Appels API pour charger et mettre à jour les données du profil étudiant.
// Utilise l'instance Axios centrale avec token JWT injecté automatiquement.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Données simulées pour le développement (fallback si backend absent)
const MOCK_PROFILE = {
  id:          1,
  name:        'Aimad Eddine Slimani',
  email:       'aimad.slimani@etud.ensa.ma',
  apogee:      '21009876',
  field:       'Génie Informatique',
  year:        '3ème année',
  school:      'ENSA — École Nationale des Sciences Appliquées',
  city:        'Marrakech',
  avatar:      null,
  bannerColor: '#1a3c5e',
  bio:         'Étudiant passionné par le développement web et la qualité logicielle.',
  isVerified:  true,
  github:      'https://github.com/slimo777',
  linkedin:    null,
}

export const profileService = {
  async getProfile(userId) {
    try {
      const { data } = await api.get(`/students/${userId}/profile`)
      return data
    } catch {
      // Backend indisponible → on retourne les données mock
      return MOCK_PROFILE
    }
  },

  async updateProfile(userId, payload) {
    const { data } = await api.put(`/students/${userId}/profile`, payload)
    return data
  },

  async uploadAvatar(userId, file) {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await api.post(`/students/${userId}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.avatarUrl
  },
}
