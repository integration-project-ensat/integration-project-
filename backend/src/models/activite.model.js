import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const ACTIVITE_ID_FIELDS = ['id_activite', 'id_etudiant', 'id_validateur']

export const createActivite = (data) =>
  prisma.activiteParascolaire.create({
    data: normalizeBigIntFields(data, ACTIVITE_ID_FIELDS),
  })

export const findAllActivites = () =>
  prisma.activiteParascolaire.findMany({
    include: {
      etudiant: { include: { utilisateur: true } },
      validateur: { include: { utilisateur: true } },
    },
  })

export const findActiviteById = (id_activite) =>
  prisma.activiteParascolaire.findUnique({
    where: { id_activite: toBigInt(id_activite) },
    include: {
      etudiant: { include: { utilisateur: true } },
      validateur: { include: { utilisateur: true } },
    },
  })

export const updateActivite = (id_activite, data) =>
  prisma.activiteParascolaire.update({
    where: { id_activite: toBigInt(id_activite) },
    data: normalizeBigIntFields(data, ACTIVITE_ID_FIELDS),
  })

export const deleteActivite = (id_activite) =>
  prisma.activiteParascolaire.delete({ where: { id_activite: toBigInt(id_activite) } })

export const validerActivite = (id_activite, id_validateur) =>
  prisma.activiteParascolaire.update({
    where: { id_activite: toBigInt(id_activite) },
    data: {
      statut: 'ATTESTEE_INSTITUTION',
      ...(id_validateur ? { id_validateur: toBigInt(id_validateur) } : {}),
    },
  })
