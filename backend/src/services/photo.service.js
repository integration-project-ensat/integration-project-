const { prisma, toBigInt } = require('../models/prisma');
const { deleteOldPhoto } = require('../utils/photoCleanup');

async function updateProfilePhoto(id_utilisateur, newPhotoUrl) {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur },
    select: { photo_profil: true },
  });

  if (profil?.photo_profil) {
    deleteOldPhoto(profil.photo_profil);
  }

  return prisma.profil.update({
    where: { id_utilisateur },
    data: { photo_profil: newPhotoUrl },
    select: {
      id_profil: true,
      photo_profil: true,
      id_utilisateur: true,
    },
  });
}

async function deleteProfilePhoto(id_utilisateur) {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur },
    select: { photo_profil: true },
  });

  if (profil?.photo_profil) {
    deleteOldPhoto(profil.photo_profil);
  }

  return prisma.profil.update({
    where: { id_utilisateur },
    data: { photo_profil: null },
  });
}

module.exports = { updateProfilePhoto, deleteProfilePhoto };