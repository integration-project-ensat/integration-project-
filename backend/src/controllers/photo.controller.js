const { updateProfilePhoto, deleteProfilePhoto } = require('../services/photoService');

async function uploadPhoto(req, res) {
  try {
    const profil = await updateProfilePhoto(
      req.utilisateur.id_utilisateur,
      req.photoPath
    );

    res.status(200).json({
      message: 'Photo mise à jour avec succès.',
      photo_profil: profil.photo_profil,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function removePhoto(req, res) {
  try {
    await deleteProfilePhoto(req.utilisateur.id_utilisateur);
    res.status(200).json({ message: 'Photo supprimée.' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = { uploadPhoto, removePhoto };