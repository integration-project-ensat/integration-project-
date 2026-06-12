const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const LETTRE_ID_FIELDS = ['id_lettre', 'id_etudiant', 'id_professeur']

const createLettreRecommandation = (data) =>
  prisma.lettreRecommandation.create({
    data: normalizeBigIntFields(data, LETTRE_ID_FIELDS),
  })

const findLettresUser = (id_utilisateur) =>
  prisma.lettreRecommandation.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: { professeur: { include: { utilisateur: true } } },
  })

const deleteLettreRecommandation = (id_lettre) =>
  prisma.lettreRecommandation.delete({ where: { id_lettre: toBigInt(id_lettre) } })

module.exports = {
  createLettreRecommandation,
  findLettresUser,
  deleteLettreRecommandation,
}
