const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createEtudiant = (data) =>
  prisma.etudiant.create({
    data: normalizeBigIntFields(data, ['id_utilisateur']),
  })

const findEtudiantByUser = (id_utilisateur) =>
  prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    include: {
      utilisateur: true,
      profil: true,
      portfolio: true,
      github_integration: true,
      publications: true,
    },
  })

const updateEtudiant = (id_utilisateur, data) =>
  prisma.etudiant.update({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
    data,
  })

module.exports = {
  createEtudiant,
  findEtudiantByUser,
  updateEtudiant,
}
