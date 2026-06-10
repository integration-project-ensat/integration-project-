const { prisma, toBigInt } = require('../models/prisma')

const getAll = async () => {
  return prisma.modelePortfolio.findMany({
    orderBy: { nom: 'asc' }
  })
}

const create = async (data) => {
  return prisma.modelePortfolio.create({
    data: {
      nom: data.nom,
      theme: data.theme,
      sections: data.sections
    }
  })
}

const update = async (id, data) => {
  return prisma.modelePortfolio.update({
    where: {
      id_modele: toBigInt(id)
    },
    data: {
      nom: data.nom,
      theme: data.theme,
      sections: data.sections
    }
  })
}

const remove = async (id) => {
  return prisma.modelePortfolio.delete({
    where: {
      id_modele: toBigInt(id)
    }
  })
}

module.exports = {
  getAll,
  create,
  update,
  remove
}