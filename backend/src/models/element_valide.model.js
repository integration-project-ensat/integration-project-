import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const ELEMENT_ID_FIELDS = ['id_element', 'reference_id', 'validateur_id']

export const soumettreElement = (data) =>
  prisma.elementValidable.create({
    data: {
      ...normalizeBigIntFields(data, ELEMENT_ID_FIELDS),
      statut: 'EN_ATTENTE',
      date_soumission: new Date(),
    },
  })

export const validerElement = (id_element, validateur_id) =>
  prisma.elementValidable.update({
    where: { id_element: toBigInt(id_element) },
    data: {
      statut: 'VALIDE',
      date_validation: new Date(),
      validateur_id: toBigInt(validateur_id),
    },
  })

export const rejeterElement = (id_element, validateur_id, motif_refus) =>
  prisma.elementValidable.update({
    where: { id_element: toBigInt(id_element) },
    data: {
      statut: 'REFUSE',
      date_validation: new Date(),
      validateur_id: toBigInt(validateur_id),
      motif_refus,
    },
  })

export const demanderCorrectionElement = (id_element, validateur_id, motif_refus) =>
  prisma.elementValidable.update({
    where: { id_element: toBigInt(id_element) },
    data: {
      statut: 'CORRECTION_DEMANDEE',
      date_validation: new Date(),
      validateur_id: toBigInt(validateur_id),
      motif_refus,
    },
  })

export const findElementsEnAttente = () =>
  prisma.elementValidable.findMany({
    where: { statut: 'EN_ATTENTE' },
    include: { validateur: true, attestation: true },
  })
