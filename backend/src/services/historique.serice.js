const prisma = require('../../prisma/client');

const log = async ({ utilisateurId = null, action, cibleType = null, cibleId = null }) => {
  try {
    await prisma.historiqueAction.create({
      data: {
        utilisateur_id: utilisateurId,
        action,
        cible_type: cibleType,
        cible_id: cibleId
      }
    });
  } catch (error) {
    console.error('[HistoriqueAction]', error);
  }
};

module.exports = {
  log
};