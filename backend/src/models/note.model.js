import { prisma, toBigInt } from './prisma.js'

export const createNote = (data) =>
  prisma.commentaire.create({
    data: {
      id_auteur: toBigInt(data.id_utilisateur ?? data.id_auteur),
      id_portfolio: toBigInt(data.id_portfolio),
      contenu: data.description ?? data.contenu ?? '',
      statut: data.statut ?? 'EN_ATTENTE',
      date: data.date_publication ?? new Date(),
    },
  })

export const findNoteProjet = (id_projet, id_utilisateur) =>
  prisma.commentaire.findFirst({
    where: {
      id_auteur: toBigInt(id_utilisateur),
      id_portfolio: toBigInt(id_projet),
    },
  })

export const updateNote = (id_note, data) =>
  prisma.commentaire.update({
    where: { id_commentaire: toBigInt(id_note) },
    data: {
      contenu: data.description ?? data.contenu,
      statut: data.statut,
      date: data.date_publication,
    },
  })
