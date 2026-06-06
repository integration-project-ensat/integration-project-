import api from './api'

const fullName = (user) =>
  [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()

const recommendationRole = (role) => {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'PROFESSIONNEL' || normalized === 'PROFESSIONAL') return 'professional'
  if (normalized === 'ETUDIANT' || normalized === 'STUDENT') return 'student'
  return 'teacher'
}

const mapRecommendation = (item) => ({
  id: Number(item?.id_recommandation ?? item?.id ?? Date.now()),
  author: fullName(item?.auteur) || item?.author || 'Auteur inconnu',
  role: recommendationRole(item?.role_auteur ?? item?.auteur?.role ?? item?.role),
  avatar: item?.auteur?.profil?.photo_profil || item?.avatar || '',
  message: item?.message || '',
  date: item?.date_recommandation || item?.date || '',
})

const mapPost = (item) => ({
  id: Number(item?.id_poste ?? item?.id ?? Date.now()),
  author: item?.author || fullName(item?.auteur) || 'Auteur inconnu',
  subtitle: item?.subtitle || item?.visibilite || 'Post portfolio',
  description: item?.description || item?.contenu || '',
  avatar: item?.avatar || item?.auteur?.profil?.photo_profil || '',
  images: item?.images || (item?.image_url ? [item.image_url] : []),
  media: item?.media || [],
  compteurs_reactions: item?.compteurs_reactions || {},
  reposts: item?.reposts || item?._count?.reposts || 0,
  commentaires: item?.commentaires || [],
})

const normalizeProfile = (payload) => {
  const profile = payload?.profil || {}
  const student = payload?.etudiant || {}
  const professional = payload?.professionnel || {}
  const professor = payload?.professeur || {}
  const score =
    Number(
      payload?.score ??
      student?.score_credibilite?.score_total ??
      professional?.score_credibilite?.score_total ??
      0,
    ) || 0

  const recommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations.map(mapRecommendation)
    : []

  return {
    id: Number(payload?.id ?? payload?.id_utilisateur ?? 0),
    name: payload?.name || fullName(payload) || 'Nom Prenom',
    score,
    title:
      payload?.title ||
      student?.filiere ||
      professor?.specialite ||
      professional?.poste ||
      payload?.role ||
      'Profil',
    school:
      payload?.school ||
      student?.etablissement ||
      student?.annee_universitaire ||
      professor?.etablissement ||
      professional?.entreprise ||
      '',
    location: payload?.location || profile?.adresse || '',
    recos: payload?.recos || `${recommendations.length}+`,
    avatar: payload?.avatar || profile?.photo_profil || '',
    banner: profile?.banniere_profil || '',
    bio: payload?.bio || profile?.bio || '',
    email: payload?.email || profile?.email_professionnel || '',
    website: payload?.website || student?.portfolio?.url_public || '',
    linkedin: payload?.linkedin || profile?.linkedin_url || '',
    apogee: student?.numero_etudiant || '',
    raw: payload,
    posts: Array.isArray(payload?.posts) ? payload.posts.map(mapPost) : [],
    recommendations,
  }
}

export const profileService = {
  async getProfile(userId) {
    const id = userId == null || Number.isNaN(Number(userId)) ? null : Number(userId)
    const url = id != null ? `/profil/${id}` : '/profil/me'
    const { data } = await api.get(url)
    return normalizeProfile(data?.data ?? data)
  },

  async updateProfile(userId, payload) {
    const { data } = await api.put(`/profil/${userId}`, payload)
    return data.data
  },

  async uploadAvatar(userId, file) {
    const form = new FormData()
    form.append('photo', file)
    const { data } = await api.post('/profil/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.photo_profil
  },
}
