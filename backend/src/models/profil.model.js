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
      competences: { include: { competence: true } },
      badges: { include: { badge: true } },
      score_credibilite: true,
      recommandations: { include: { auteur: true } },
      etudiant: { include: { publications: true } },
    },
  })

module.exports = {
  upsertProfil,
  findProfil,
}
