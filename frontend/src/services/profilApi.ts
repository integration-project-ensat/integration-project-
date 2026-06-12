import api from './api'

// ─── Types ────────────────────────────────────
export interface ExploreFilters {
  search?:          string
  filiere?:         string
  ville?:           string
  year?:            number
  school?:          string
  competences?:     string | string[]
  score?:           number
  recommandations?: boolean
  page?:            number
  limit?:           number
}

export interface ProfilExplore {
  id_utilisateur:    string
  nom:               string
  prenom:            string
  nb_recommandations: number
  profil: {
    photo_profil: string | null
    bio:          string | null
    adresse:      string | null
    linkedin_url: string | null
  } | null
  etudiant: {
    filiere:             string | null
    etablissement:       string | null
    annee_universitaire: string | null
    score_credibilite: {
      score_total: number | null
      niveau:      string | null
    } | null
    competences: Array<{
      competence:      { nom: string; categorie: string }
      niveau_maitrise: number | null
    }>
    diplomes: Array<{
      titre_diplome: string
      etablissement: string | null
      annee_fin:     number | null
    }>
    badges: Array<{
      badge: { nom: string; icone_url: string | null }
    }>
  } | null
}

export interface PaginationMeta {
  total: number
  page:  number
  limit: number
  pages: number
}

export interface ProfilSauvegarde {
  id: string
  date_sauvegarde: string
  etudiant: ProfilExplore
}

// ─── Appels API ───────────────────────────────

export const explorerProfils = async (
  filtres: ExploreFilters
): Promise<{ data: ProfilExplore[]; pagination: PaginationMeta }> => {
  const hasToken = Boolean(localStorage.getItem('token'))

  if (!hasToken) {
    const res = await api.get('/profil/public', { params: filtres })
    return res.data
  }

  try {
    const res = await api.get('/profil', { params: filtres })
    return res.data
  } catch (error: any) {
    const status = error?.response?.status
    if (status === 401 || status === 403 || status === 429) {
      const fallback = await api.get('/profil/public', { params: filtres })
      return fallback.data
    }
    throw error
  }
}

export const sauvegarderProfil = async (id: string): Promise<void> => {
  await api.post(`/profil/${id}/save`)
}

export const supprimerSauvegarde = async (id: string): Promise<void> => {
  await api.delete(`/profil/${id}/save`)
}

export const getMesSauvegardes = async (): Promise<ProfilSauvegarde[]> => {
  const res = await api.get('/profil/saved')
  return res.data.data
}
