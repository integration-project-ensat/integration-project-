import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const SCORE_ID_FIELDS = ['id_score', 'id_profil']

const niveauFromScore = (score) => {
  if (score >= 75) return 'EXPERT'
  if (score >= 50) return 'AVANCE'
  if (score >= 25) return 'INTERMEDIAIRE'
  return 'DEBUTANT'
}

export const upsertScore = async (id_utilisateur, data) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) {
    throw new Error('Profil introuvable pour cet utilisateur')
  }

  return prisma.scoreCredibilite.upsert({
    where: { id_profil: profil.id_profil },
    update: normalizeBigIntFields(data, SCORE_ID_FIELDS),
    create: {
      ...normalizeBigIntFields(data, SCORE_ID_FIELDS),
      id_profil: profil.id_profil,
    },
  })
}

export const findScore = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return null

  return prisma.scoreCredibilite.findUnique({ where: { id_profil: profil.id_profil } })
}

export const calculerScoreTotal = async (id_utilisateur) => {
  const id = toBigInt(id_utilisateur)
  const profil = await prisma.profil.findUnique({ where: { id_utilisateur: id } })

  if (!profil) {
    throw new Error('Profil introuvable pour cet utilisateur')
  }

  const integration = await prisma.githubIntegration.findUnique({ where: { id_etudiant: id } })
  const projets = await prisma.projet.count({ where: { id_etudiant: id } })
  const stages = await prisma.stage.count({ where: { id_etudiant: id } })
  const recommandations = await prisma.recommandation.count({ where: { id_profil: profil.id_profil } })
  const depots = integration
    ? await prisma.depotGithub.count({ where: { id_integration: integration.id_integration } })
    : 0

  const score_projets = Math.min(projets * 10, 20)
  const score_stages = Math.min(stages * 15, 20)
  const score_github = Math.min(depots * 5, 15)
  const score_recommandations = Math.min(recommandations * 5, 15)
  const score_certifications = 0
  const score_completude = Math.min(
    Number(Boolean(profil.bio)) * 5 +
      Number(Boolean(profil.linkedin_url)) * 5 +
      Number(Boolean(profil.objectif_professionnel)) * 5,
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
