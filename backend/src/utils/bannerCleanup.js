const fs = require('fs')
const path = require('path')

const UPLOAD_DIR = path.join(__dirname, '../../uploads/banners')

function deleteOldBanner(oldBannerUrl) {
  if (!oldBannerUrl) return

  const filename = path.basename(oldBannerUrl)
  const filepath = path.join(UPLOAD_DIR, filename)

  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) console.error('Erreur suppression banniere:', err.message)
    })
  }
}

module.exports = { deleteOldBanner }
