const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const SCORE_ID_FIELDS = ['id_score', 'id_etudiant']

const niveauFromScore = (score) => {
  if (score >= 75) return 'EXPERT'
  if (score >= 50) return 'AVANCE'
  if (score >= 25) return 'INTERMEDIAIRE'
  return 'DEBUTANT'
}

const getEtudiantWithProfil = async (id_utilisateur) =>
  prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: { utilisateur: { include: { profil: true } }, portfolio: true },
  })

const upsertScore = async (id_utilisateur, data) => {
  const etudiant = await getEtudiantWithProfil(id_utilisateur)

  if (!etudiant) {
    throw new Error('Etudiant introuvable pour cet utilisateur')
  }

  return prisma.scoreCredibilite.upsert({
    where: { id_etudiant: etudiant.id_utilisateur },
    update: normalizeBigIntFields(data, SCORE_ID_FIELDS),
    create: {
      ...normalizeBigIntFields(data, SCORE_ID_FIELDS),
      id_etudiant: etudiant.id_utilisateur,
    },
  })
}

const findScore = async (id_utilisateur) => {
  const etudiant = await getEtudiantWithProfil(id_utilisateur)

  if (!etudiant) return null

  return prisma.scoreCredibilite.findUnique({ where: { id_etudiant: etudiant.id_utilisateur } })
}

const calculerScoreTotal = async (id_utilisateur) => {
  const etudiant = await getEtudiantWithProfil(id_utilisateur)

  if (!etudiant) {
    throw new Error('Etudiant introuvable pour cet utilisateur')
  }

  const id = etudiant.id_utilisateur
  const profil = etudiant.utilisateur.profil
  const integration = await prisma.githubIntegration.findUnique({ where: { id_etudiant: id } })
  const projets = await prisma.projet.count({ where: { id_etudiant: id } })
  const stages = await prisma.stage.count({ where: { id_etudiant: id } })
  const recommandations = await prisma.recommandation.count({ where: { id_etudiant_cible: id } })
  const depots = integration
    ? await prisma.depotGithub.count({ where: { id_integration: integration.id_integration } })
    : 0

  const score_projets = Math.min(projets * 10, 20)
  const score_stages = Math.min(stages * 15, 20)
  const score_github = Math.min(depots * 5, 15)
  const score_recommandations = Math.min(recommandations * 5, 15)
  const score_certifications = 0
  const score_completude = Math.min(
    Number(Boolean(profil?.bio)) * 5 +
      Number(Boolean(profil?.linkedin_url)) * 5 +
      Number(Boolean(profil?.telephone)) * 3 +
      Number(Boolean(etudiant.portfolio?.objectif_pro)) * 2,
    15,
  )
  const score_total =
    score_projets +
    score_stages +
    score_github +
    score_recommandations +
    score_certifications +
    score_completude

  return upsertScore(id, {
    score_total,
    score_projets,
    score_github,
    score_stages,
    score_recommandations,
    score_certifications,
    score_completude,
    niveau: niveauFromScore(score_total),
  })
}

module.exports = {
  upsertScore,
  findScore,
  calculerScoreTotal,
}
