const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../uploads/photos');

/**
 * Supprime l'ancienne photo si elle existe et n'est pas la photo par défaut
 * @param {string|null} oldPhotoUrl ex: "/uploads/photos/abc.webp"
 */
function deleteOldPhoto(oldPhotoUrl) {
  if (!oldPhotoUrl) return;

  const filename = path.basename(oldPhotoUrl);
  const filepath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) console.error('Erreur suppression photo:', err.message);
    });
  }
}

module.exports = { deleteOldPhoto };
