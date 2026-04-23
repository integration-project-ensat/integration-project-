import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createNote = (data) =>
  prisma.note.create({ data })

export const findNoteProjet = (id_projet, id_utilisateur) =>
  prisma.note.findFirst({ where: { id_projet, id_utilisateur } })

export const updateNote = (id_note, data) =>
  prisma.note.update({ where: { id_note }, data })
