import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const DIPLOME_ID_FIELDS = ['id_diplome', 'id_etudiant']

export const createDiplome = (data) =>
  prisma.diplome.create({
    data: normalizeBigIntFields(data, DIPLOME_ID_FIELDS),
  })

export const findDiplomesUser = (id_utilisateur) =>
  prisma.diplome.findMany({ where: { id_etudiant: toBigInt(id_utilisateur) } })

export const updateDiplome = (id_diplome, data) =>
  prisma.diplome.update({
    where: { id_diplome: toBigInt(id_diplome) },
    data: normalizeBigIntFields(data, DIPLOME_ID_FIELDS),
  })

export const deleteDiplome = (id_diplome) =>
  prisma.diplome.delete({ where: { id_diplome: toBigInt(id_diplome) } })
