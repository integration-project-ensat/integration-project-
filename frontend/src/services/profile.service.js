// SCRUM-139 — Connect profile data to API
// Appels API pour charger et mettre à jour les données du profil étudiant.
// Utilise l'instance Axios centrale avec token JWT injecté automatiquement.

import api from './api'

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
  const id = (userId == null || isNaN(Number(userId))) ? null : userId
  const url = id != null ? `/profil/${id}` : '/profil/me'
    try {
      const { data } = await api.get(url)
      return data.data
    } catch {
      // Backend indisponible / route absente → on retourne les données mock
      return MOCK_PROFILE
    }
  },

  async updateProfile(userId, payload) {
    const { data } = await api.put(`/profil/${userId}`, payload)
    return data.data
  },

  async uploadAvatar(userId, file) {
    const form = new FormData()
    form.append('photo', file)
    const { data } = await api.post('/profil/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.photo_profil
  },
}
