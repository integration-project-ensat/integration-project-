const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const GITHUB_ID_FIELDS = ['id_integration', 'id_etudiant']

const upsertGithubIntegration = (id_utilisateur, data) =>
  prisma.githubIntegration.upsert({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    update: {
      ...normalizeBigIntFields(data, GITHUB_ID_FIELDS),
      date_synchronisation: new Date(),
    },
    create: {
      ...normalizeBigIntFields(data, GITHUB_ID_FIELDS),
      id_etudiant: toBigInt(id_utilisateur),
    },
  })

const findGithubIntegration = (id_utilisateur) =>
  prisma.githubIntegration.findUnique({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: { depots: true },
  })

module.exports = {
  upsertGithubIntegration,
  findGithubIntegration,
}
