const { prisma } = require('../models/prisma')
const { deleteOldBanner } = require('../utils/bannerCleanup')

async function updateProfileBanner(id_utilisateur, newBannerUrl) {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur },
    select: { banniere_profil: true },
  })

  if (profil?.banniere_profil) {
    deleteOldBanner(profil.banniere_profil)
  }

  return prisma.profil.update({
    where: { id_utilisateur },
    data: { banniere_profil: newBannerUrl },
    select: {
      id_profil: true,
      id_utilisateur: true,
      banniere_profil: true,
    },
  })
}

async function deleteProfileBanner(id_utilisateur) {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur },
    select: { banniere_profil: true },
  })

  if (profil?.banniere_profil) {
    deleteOldBanner(profil.banniere_profil)
  }

  return prisma.profil.update({
    where: { id_utilisateur },
    data: { banniere_profil: null },
  })
}

module.exports = { updateProfileBanner, deleteProfileBanner }
