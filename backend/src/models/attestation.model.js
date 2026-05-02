const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const ATTESTATION_ID_FIELDS = ['id_attestation', 'id_element']

const createAttestation = (data) =>
  prisma.attestation.create({
    data: normalizeBigIntFields(data, ATTESTATION_ID_FIELDS),
  })

const findAttestationsElement = (id_element) =>
  prisma.attestation.findMany({ where: { id_element: toBigInt(id_element) } })

const findAttestationsUser = (id_utilisateur) =>
  prisma.attestation.findMany({
    where: {
      element: {
        validateur_id: toBigInt(id_utilisateur),
      },
    },
    include: { element: true },
  })

const updateAttestation = (id_attestation, data) =>
  prisma.attestation.update({
    where: { id_attestation: toBigInt(id_attestation) },
    data: normalizeBigIntFields(data, ATTESTATION_ID_FIELDS),
  })

const deleteAttestation = (id_attestation) =>
  prisma.attestation.delete({ where: { id_attestation: toBigInt(id_attestation) } })

module.exports = {
  createAttestation,
  findAttestationsElement,
  findAttestationsUser,
  updateAttestation,
  deleteAttestation,
}
