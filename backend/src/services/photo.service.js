const { PrismaClient } = require('@prisma/client');
const { deleteOldPhoto } = require('../utils/photoCleanup');

const prisma = new PrismaClient();

/**
 * Met à jour la photo de profil dans la table `profils`
 * Supprime l'ancienne photo du disque
 */
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

/**
 * Supprime la photo de profil (reset à null)
 */
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