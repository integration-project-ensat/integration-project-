const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const DEPOT_ID_FIELDS = ['id_depot', 'id_integration']

const createDepot = (data) =>
  prisma.depotGithub.create({
    data: normalizeBigIntFields(data, DEPOT_ID_FIELDS),
  })

const findDepotsIntegration = (id_integration) =>
  prisma.depotGithub.findMany({ where: { id_integration: toBigInt(id_integration) } })

const findDepotsUser = async (id_utilisateur) => {
  const integration = await prisma.githubIntegration.findUnique({
    where: { id_etudiant: toBigInt(id_utilisateur) },
  })

  if (!integration) return []

  return findDepotsIntegration(integration.id_integration)
}

const syncDepots = async (id_utilisateur, depots) => {
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

module.exports = {
  createDepot,
  findDepotsIntegration,
  findDepotsUser,
  syncDepots,
}
