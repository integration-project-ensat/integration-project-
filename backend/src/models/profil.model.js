const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const upsertProfil = (id_utilisateur, data) =>
  prisma.profil.upsert({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    update: data,
    create: {
      ...normalizeBigIntFields(data, ['id_utilisateur']),
      id_utilisateur: toBigInt(id_utilisateur),
    },
  })

const findProfil = (id_utilisateur) =>
  prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: {
      utilisateur: {
        include: {
          etudiant: {
            include: {
              activites: true,
              badges: { include: { badge: true } },
              competences: { include: { competence: true } },
              diplomes: true,
              portfolio: true,
              recommandations_recues: { include: { auteur: true } },
              score_credibilite: true,
              stages: true,
            },
          },
          professeur: true,
          professionnel: true,
          administrateur: true,
          postes: true,
        },
      },
    },
  })

module.exports = {
  upsertProfil,
  findProfil,
}
