import api from './api'

const resolveBackendAsset = (path) => {
  if (!path || /^https?:\/\//.test(path) || String(path).startsWith('data:')) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendBase = apiBase.replace(/\/api\/?$/, '')
  return `${backendBase}${path}`
}

const fullName = (user) =>
  [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const FILIERES = [
  { label: 'Informatique', variants: ['Informatique', 'Genie Informatique', 'Génie Informatique', 'GINF', 'INFO'] },
  { label: 'Reseaux et Telecoms', variants: ['Reseaux et Telecoms', 'Réseaux et Télécoms', 'Reseaux', 'Réseaux', 'GSTR', 'GTR'] },
  { label: 'Data Science', variants: ['Data Science', 'Data', 'Big Data'] },
  { label: 'Cybersecurite', variants: ['Cybersecurite', 'Cybersécurité', 'Cybersecurity', 'Securite', 'Sécurité'] },
  { label: 'IA', variants: ['IA', 'Intelligence Artificielle', 'IID'] },
  { label: 'Developpement', variants: ['Developpement', 'Développement', 'Web', 'Mobile'] },
  { label: 'DevOps', variants: ['DevOps'] },
  { label: 'Cloud', variants: ['Cloud'] },
  { label: 'Marketing', variants: ['Marketing'] },
  { label: 'Design', variants: ['Design'] },
]

const VILLES = [
  'Tanger',
  'Rabat',
  'Fès',
  'Casablanca',
  'Marrakech',
  'Agadir',
  'Oujda',
  'Tetouan',
  'Kenitra',
  'Meknes',
  'El Jadida',
  'Safi',
  'Beni Mellal',
  'Nador',
  'Settat',
  'Taza',
  'Khouribga',
  'Mohammedia',
  'Laayoune',
  'Dakhla',
]

const normalizeFiliere = (value) => {
  const normalized = normalizeText(value)
  const match = FILIERES.find((item) =>
    item.variants.some((variant) => normalizeText(variant) === normalized),
  )

  return match?.label || String(value || '').trim()
}

const pickSchool = (student) =>
  student?.etablissement ||
  student?.diplomes?.[0]?.etablissement ||
  'École Nationale des Sciences Appliquées'

const pickLocation = (profile, student, payload) => {
  const explicitLocation = String(payload?.location || profile?.adresse || '').trim()
  if (explicitLocation) return explicitLocation

  const source = normalizeText([
    student?.etablissement,
    student?.diplomes?.[0]?.etablissement,
  ].filter(Boolean).join(' '))
  const city = VILLES.find((item) => source.includes(normalizeText(item)))

  return city ? `${city}, Maroc` : ''
}

const recommendationRole = (role) => {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'PROFESSIONNEL' || normalized === 'PROFESSIONAL') return 'professional'
  if (normalized === 'ETUDIANT' || normalized === 'STUDENT') return 'student'
  return 'teacher'
}

const profileRole = (role) => {
  const normalized = String(role || '').toUpperCase()
  if (normalized === 'PROFESSIONNEL' || normalized === 'PROFESSIONAL') return 'professional'
  if (normalized === 'ETUDIANT' || normalized === 'STUDENT') return 'student'
  if (normalized === 'PROFESSEUR' || normalized === 'TEACHER') return 'teacher'
  return 'student'
}

const mapRecommendation = (item) => ({
  id: Number(item?.id_recommandation ?? item?.id ?? Date.now()),
  author: fullName(item?.auteur) || item?.author || 'Auteur inconnu',
  role: recommendationRole(item?.role_auteur ?? item?.auteur?.role ?? item?.role),
  avatar: resolveBackendAsset(item?.auteur?.profil?.photo_profil || item?.avatar || ''),
  message: item?.message || '',
  date: item?.date_recommandation || item?.date || '',
})

const mapGithubRepo = (item) => ({
  id: Number(item?.id_depot ?? item?.id ?? Date.now()),
  name: item?.nom_depot || 'Depot',
  url: item?.url_depot || '',
  commits: Number(item?.nb_commits ?? 0),
  languages:
    item?.langages && typeof item.langages === 'object'
      ? Object.keys(item.langages)
      : [],
  isPublic: item?.est_public !== false,
  createdAt: item?.date_creation || '',
})

const mapPost = (item) => ({
  id: Number(item?.id_poste ?? item?.id ?? Date.now()),
  author: item?.author || fullName(item?.auteur) || 'Auteur inconnu',
  subtitle: item?.subtitle || item?.visibilite || 'Post portfolio',
  description: item?.description || item?.contenu || '',
  avatar: resolveBackendAsset(item?.avatar || item?.auteur?.profil?.photo_profil || ''),
  images: item?.images || (item?.image_url ? [item.image_url] : []),
  media: item?.media || [],
  compteurs_reactions: item?.compteurs_reactions || {},
  reposts: item?.reposts || item?._count?.reposts || 0,
  likeCount: Number(item?.compteurs_reactions?.JAIME ?? item?.reactions?.length ?? 0),
  commentCount: Array.isArray(item?.commentaires) ? item.commentaires.length : 0,
  repostCount: Number(item?.compteur_reposts ?? item?._count?.reposts ?? item?.reposts?.length ?? 0),
  commentaires: Array.isArray(item?.commentaires)
    ? item.commentaires.map((comment) => ({
        ...comment,
        avatar: resolveBackendAsset(comment?.avatar || comment?.auteur?.profil?.photo_profil || ''),
      }))
    : [],
})

const normalizeProfile = (payload) => {
  const profile = payload?.profil || payload?.profile || (payload?.id_profil ? payload : {})
  const student = payload?.etudiant || {}
  const professional = payload?.professionnel || {}
  const professor = payload?.professeur || {}
  const normalizedRole = profileRole(payload?.role)
  const score = normalizedRole === 'student'
    ? (
        Number(
          payload?.score ??
          student?.score_credibilite?.score_total ??
          professional?.score_credibilite?.score_total ??
          0,
        ) || 0
      )
    : 0

  const recommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations.map(mapRecommendation)
    : Array.isArray(student?.recommandations_recues)
      ? student.recommandations_recues.map(mapRecommendation)
      : []

  const githubIntegration = student?.github_integration || {}
  const githubUsername = githubIntegration?.github_username || ''
  const githubRepos = Array.isArray(githubIntegration?.depots)
    ? githubIntegration.depots.map(mapGithubRepo)
    : []

  return {
    id: Number(payload?.id ?? payload?.id_utilisateur ?? 0),
    name: payload?.name || fullName(payload) || 'Nom Prenom',
    score,
    title:
      payload?.title ||
      normalizeFiliere(student?.filiere) ||
      professor?.specialite ||
      professional?.poste ||
      payload?.role ||
      'Profil',
    school:
      payload?.school ||
      pickSchool(student) ||
      professor?.etablissement ||
      professional?.entreprise ||
      '',
    location: pickLocation(profile, student, payload),
    recos: payload?.recos || `${recommendations.length}+`,
    avatar: resolveBackendAsset(payload?.avatar || profile?.photo_profil || ''),
    banner: resolveBackendAsset(profile?.banniere_profil || ''),
    bio: payload?.bio || profile?.bio || '',
    email: payload?.email || profile?.email_professionnel || '',
    phone: payload?.phone || profile?.telephone || '',
    website: payload?.website || student?.portfolio?.url_public || '',
    linkedin: payload?.linkedin || profile?.linkedin_url || '',
    github:
      payload?.github ||
      (githubUsername ? `https://github.com/${githubUsername}` : ''),
    githubUsername,
    githubRepos,
    apogee: student?.numero_etudiant || '',
    portfolioId: Number(student?.portfolio?.id_portfolio ?? 0) || null,
    competences: Array.isArray(student?.competences)
      ? student.competences.map((item) => item?.competence?.nom).filter(Boolean)
      : [],
    projectsData: Array.isArray(student?.projets) ? student.projets : [],
    stagesData: Array.isArray(student?.stages) ? student.stages : [],
    badgesData: Array.isArray(student?.badges) ? student.badges : [],
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

  async getCurrentUser() {
  const { data } = await api.get('/profil/me')
  return normalizeProfile(data?.data ?? data)
},
  async updateProfile(userId, payload) {
    const id = userId == null || Number.isNaN(Number(userId)) ? null : Number(userId)
    const url = id != null ? `/profil/${id}` : '/profil/me'
    const { data } = await api.put(url, payload)
    return normalizeProfile(data?.data ?? data)
  },
  

  async uploadAvatar(userId, file) {
    const form = new FormData()
    form.append('photo', file)
    const { data } = await api.post('/profil/photo', form)
    return resolveBackendAsset(data?.data?.photo_profil || data?.photo_profil || '')
  },

  async uploadBanner(userId, file) {
    const form = new FormData()
    form.append('banner', file)
    const { data } = await api.post('/profil/banner', form)
    return resolveBackendAsset(data?.data?.banniere_profil || data?.banniere_profil || '')
  },
}
