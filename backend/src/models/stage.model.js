import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const STAGE_ID_FIELDS = ['id_stage', 'id_etudiant', 'id_encadrant']

export const createStage = (data) =>
  prisma.stage.create({
    data: normalizeBigIntFields(data, STAGE_ID_FIELDS),
  })

export const findStagesUser = (id_utilisateur) =>
  prisma.stage.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: { encadrant: { include: { utilisateur: true } } },
  })

export const findStageById = (id_stage) =>
  prisma.stage.findUnique({
    where: { id_stage: toBigInt(id_stage) },
    include: {
      etudiant: { include: { utilisateur: true } },
      encadrant: { include: { utilisateur: true } },
    },
  })

export const updateStage = (id_stage, data) =>
  prisma.stage.update({
    where: { id_stage: toBigInt(id_stage) },
    data: normalizeBigIntFields(data, STAGE_ID_FIELDS),
  })

export const deleteStage = (id_stage) =>
  prisma.stage.delete({ where: { id_stage: toBigInt(id_stage) } })
