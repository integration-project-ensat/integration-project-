const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const DIPLOME_ID_FIELDS = ['id_diplome', 'id_etudiant']

const createDiplome = (data) =>
  prisma.diplome.create({
    data: normalizeBigIntFields(data, DIPLOME_ID_FIELDS),
  })

const findDiplomesUser = (id_utilisateur) =>
  prisma.diplome.findMany({ where: { id_etudiant: toBigInt(id_utilisateur) } })

const updateDiplome = (id_diplome, data) =>
  prisma.diplome.update({
    where: { id_diplome: toBigInt(id_diplome) },
    data: normalizeBigIntFields(data, DIPLOME_ID_FIELDS),
  })

const deleteDiplome = (id_diplome) =>
  prisma.diplome.delete({ where: { id_diplome: toBigInt(id_diplome) } })

module.exports = {
  createDiplome,
  findDiplomesUser,
  updateDiplome,
  deleteDiplome,
}
