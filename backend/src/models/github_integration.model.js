import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const GITHUB_ID_FIELDS = ['id_integration', 'id_etudiant']

export const upsertGithubIntegration = (id_utilisateur, data) =>
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

export const findGithubIntegration = (id_utilisateur) =>
  prisma.githubIntegration.findUnique({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: { depots: true },
  })
