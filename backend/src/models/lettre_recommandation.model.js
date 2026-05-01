import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const LETTRE_ID_FIELDS = ['id_lettre', 'id_etudiant', 'id_professeur']

export const createLettreRecommandation = (data) =>
  prisma.lettreRecommandation.create({
    data: normalizeBigIntFields(data, LETTRE_ID_FIELDS),
  })

export const findLettresUser = (id_utilisateur) =>
  prisma.lettreRecommandation.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: { professeur: { include: { utilisateur: true } } },
  })

export const deleteLettreRecommandation = (id_lettre) =>
  prisma.lettreRecommandation.delete({ where: { id_lettre: toBigInt(id_lettre) } })
