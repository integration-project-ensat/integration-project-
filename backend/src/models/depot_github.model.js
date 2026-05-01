import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const DEPOT_ID_FIELDS = ['id_depot', 'id_integration']

export const createDepot = (data) =>
  prisma.depotGithub.create({
    data: normalizeBigIntFields(data, DEPOT_ID_FIELDS),
  })

export const findDepotsIntegration = (id_integration) =>
  prisma.depotGithub.findMany({ where: { id_integration: toBigInt(id_integration) } })

export const findDepotsUser = async (id_utilisateur) => {
  const integration = await prisma.githubIntegration.findUnique({
    where: { id_etudiant: toBigInt(id_utilisateur) },
  })

  if (!integration) return []

  return findDepotsIntegration(integration.id_integration)
}

export const syncDepots = async (id_utilisateur, depots) => {
  const integration = await prisma.githubIntegration.findUnique({
    where: { id_etudiant: toBigInt(id_utilisateur) },
  })

  if (!integration) {
    throw new Error('Integration GitHub introuvable pour cet utilisateur')
  }

  await prisma.depotGithub.deleteMany({
    where: { id_integration: integration.id_integration },
  })

  return prisma.depotGithub.createMany({
    data: depots.map((depot) => ({
      ...normalizeBigIntFields(depot, DEPOT_ID_FIELDS),
      id_integration: integration.id_integration,
    })),
  })
}
