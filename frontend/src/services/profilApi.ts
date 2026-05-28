import api from './api'

// ─── Types ────────────────────────────────────
export interface ExploreFilters {
  search?:          string
  filiere?:         string
  ville?:           string
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

// ─── Appels API ───────────────────────────────

export const explorerProfils = async (
  filtres: ExploreFilters
): Promise<{ data: ProfilExplore[]; pagination: PaginationMeta }> => {
  const res = await api.get('/profil', { params: filtres })
  return res.data
}

export const sauvegarderProfil = async (id: string): Promise<void> => {
  await api.post(`/profil/${id}/save`)
}

export const supprimerSauvegarde = async (id: string): Promise<void> => {
  await api.delete(`/profil/${id}/save`)
}

export const getMesSauvegardes = async (): Promise<ProfilExplore[]> => {
  const res = await api.get('/profil/saved')
  return res.data.data
}