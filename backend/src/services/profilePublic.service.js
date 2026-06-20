const { prisma, toBigInt } = require('../models/prisma')

const fullName = (user) => [user?.prenom, user?.nom].filter(Boolean).join(' ')

const toFrontendRecommendation = (recommendation) => ({
  id: Number(recommendation.id_recommandation),
  author: fullName(recommendation.auteur) || 'Auteur inconnu',
  role:
    recommendation.role_auteur === 'PROFESSIONNEL'
      ? 'professional'
      : recommendation.role_auteur === 'ETUDIANT'
        ? 'student'
        : 'teacher',
  avatar: recommendation.auteur?.profil?.photo_profil || '',
  message: recommendation.message || '',
  date: recommendation.id_recommandation.toString(),
})

const toFrontendPost = (post) => {
  const collaborators = post.collaborateurs || []
  const collaboratorNames = collaborators
    .map((collaborateur) => fullName(collaborateur.utilisateur))
    .filter(Boolean)

  return {
    id: Number(post.id_poste),
    author: [fullName(post.auteur), ...collaboratorNames].filter(Boolean).join(' & ') || 'Auteur inconnu',
    subtitle: post.visibilite || 'Post portfolio',
    description: post.contenu,
    avatar: post.auteur?.profil?.photo_profil || '',
    images: post.image_url ? [post.image_url] : [],
    compteurs_reactions: post.compteurs_reactions || {},
    reposts: post._count?.reposts || 0,
    commentaires: post.commentaires || [],
  }
}

const profilePublicService = {
  async getProfile(idUtilisateur) {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: BigInt(idUtilisateur) },
      include: {
        profil: true,
        etudiant: {
          include: {
            competences: { include: { competence: true } },
            diplomes: true,
            projets: {
              where: { statut: 'VALIDE' },
              include: { technologies: { include: { technologie: true } } },
            },
            stages: { where: { statut: 'VALIDE' } },
            activites: true,
            badges: { include: { badge: true } },
            score_credibilite: true,
            portfolio: true,
          },
        },
      },
    })

    if (!utilisateur || utilisateur.role !== 'ETUDIANT') return null

    const [recommendations, recommendationCount, posts] = await Promise.all([
      prisma.recommandation.findMany({
        where: { id_etudiant_cible: utilisateur.id_utilisateur, statut: 'VALIDE' },
        include: {
          auteur: { include: { profil: true } },
        },
        orderBy: { id_recommandation: 'desc' },
      }),
      prisma.recommandation.count({
        where: { id_etudiant_cible: utilisateur.id_utilisateur, statut: 'VALIDE' },
      }),
      prisma.poste.findMany({
        where: { id_auteur: utilisateur.id_utilisateur },
        include: {
          auteur: { include: { profil: true } },
          collaborateurs: {
            include: {
              utilisateur: { include: { profil: true } },
            },
          },
          commentaires: {
            where: { statut: 'VALIDE' },
            include: { auteur: true },
            orderBy: { date: 'desc' },
          },
          reactions: true,
          _count: { select: { reposts: true } },
        },
        orderBy: { date_creation: 'desc' },
      }),
    ])

    return {
      id: Number(utilisateur.id_utilisateur),
      name: fullName(utilisateur),
      score: Number(utilisateur.etudiant?.score_credibilite?.score_total || 0),
      title: utilisateur.etudiant?.filiere || 'Etudiant',
      school: utilisateur.etudiant?.annee_universitaire || '',
      location: utilisateur.profil?.adresse || '',
      recos: `${recommendationCount}+`,
      avatar: utilisateur.profil?.photo_profil || '',
      bio: utilisateur.profil?.bio || '',
      email: utilisateur.email,
      website: utilisateur.etudiant?.portfolio?.url_public || '',
      linkedin: utilisateur.profil?.linkedin_url || '',
      raw: utilisateur,
      posts: posts.map(toFrontendPost),
      recommendations: recommendations.map(toFrontendRecommendation),
    }
  },
}

module.exports = profilePublicService
