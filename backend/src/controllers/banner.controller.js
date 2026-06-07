const { updateProfileBanner, deleteProfileBanner } = require('../services/banner.service')

async function uploadBanner(req, res) {
  try {
    const profil = await updateProfileBanner(
      req.utilisateur.id_utilisateur,
      req.bannerPath
    )

    res.status(200).json({
      message: 'Banniere mise a jour avec succes.',
      banniere_profil: profil.banniere_profil,
    })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

async function removeBanner(req, res) {
  try {
    await deleteProfileBanner(req.utilisateur.id_utilisateur)
    res.status(200).json({ message: 'Banniere supprimee.' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

module.exports = { uploadBanner, removeBanner }
