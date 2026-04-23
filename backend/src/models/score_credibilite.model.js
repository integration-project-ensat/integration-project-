import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const upsertScore = (id_utilisateur, data) =>
  prisma.scoreCredibilite.upsert({
    where: { id_utilisateur },
    update: data,
    create: { id_utilisateur, ...data }
  })

export const findScore = (id_utilisateur) =>
  prisma.scoreCredibilite.findUnique({ where: { id_utilisateur } })

export const calculerScoreTotal = async (id_utilisateur) => {
  const projets = await prisma.projet.count({ where: { id_utilisateur } })
  const stages = await prisma.stage.count({ where: { id_utilisateur } })
  const depots = await prisma.depotGithub.count({ where: { id_utilisateur } })
  const attestations = await prisma.attestation.count({ where: { id_utilisateur } })
  const recommendations = await prisma.recommendation.count({ where: { id_utilisateur } })

  const score_projet = Math.min(projets * 10, 30)
  const score_stage = Math.min(stages * 15, 30)
  const score_github = Math.min(depots * 5, 20)
  const score_certification = Math.min(attestations * 5, 20)
  const score_recommendation = Math.min(recommendations * 5, 20)
  const score_totale =
    score_projet +
    score_stage +
    score_github +
    score_certification +
    score_recommendation

  return upsertScore(id_utilisateur, {
    score_projet,
    score_stage,
    score_github,
    score_certification,
    score_recommendation,
    score_totale,
    niveau: score_totale / 10
  })
}
