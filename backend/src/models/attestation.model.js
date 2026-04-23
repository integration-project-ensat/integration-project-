import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createAttestation = (data) =>
  prisma.attestation.create({ data })

export const findAttestationsUser = (id_utilisateur) =>
  prisma.attestation.findMany({ where: { id_utilisateur } })

export const updateAttestation = (id_element, data) =>
  prisma.attestation.update({ where: { id_element }, data })

export const deleteAttestation = (id_element) =>
  prisma.attestation.delete({ where: { id_element } })
