import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createCommentaire = (data) =>
  prisma.commentaire.create({ data })

export const findCommentairesProjet = (id_projet) =>
  prisma.commentaire.findMany({
    where: { id_projet },
    include: { utilisateur: { select: { nom: true, prenom: true } } },
    orderBy: { createdAt: 'desc' }
  })

export const deleteCommentaire = (id_commentaire) =>
  prisma.commentaire.delete({ where: { id_commentaire } })
