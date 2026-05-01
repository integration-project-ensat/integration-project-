import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const COMMENTAIRE_ID_FIELDS = ['id_commentaire', 'id_auteur', 'id_portfolio']

export const createCommentaire = (data) =>
  prisma.commentaire.create({
    data: normalizeBigIntFields(data, COMMENTAIRE_ID_FIELDS),
  })

export const findCommentairesPortfolio = (id_portfolio) =>
  prisma.commentaire.findMany({
    where: { id_portfolio: toBigInt(id_portfolio) },
    include: { auteur: { select: { nom: true, prenom: true } } },
    orderBy: { date: 'desc' },
  })

export const findCommentairesProjet = findCommentairesPortfolio

export const deleteCommentaire = (id_commentaire) =>
  prisma.commentaire.delete({ where: { id_commentaire: toBigInt(id_commentaire) } })
