const { normalizeBigIntFields, prisma } = require('./prisma')

const createTechnologie = (data) =>
  prisma.technologie.create({
    data: normalizeBigIntFields(data, ['id_technologie']),
  })

const findAllTechnologies = () =>
  prisma.technologie.findMany({ where: { est_validee: true } })

module.exports = {
  createTechnologie,
  findAllTechnologies,
}
