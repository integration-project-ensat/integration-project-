// Service dédié aux APIs de profils (sauvegardes PRO)
// Utilise l'instance Axios centralisée.

import api from './api'

export async function explorerProfils(filtres) {
  const res = await api.get('/profil', { params: filtres })
  return res.data
}

export async function getMesSauvegardes() {
  const res = await api.get('/profil/saved')
  return res.data.data
}

export function sauvegarderProfil(id) {
  return api.post(`/profil/${id}/save`)
}

export function supprimerSauvegarde(id) {
  return api.delete(`/profil/${id}/save`)
}

