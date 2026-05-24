const express = require('express');
const router = express.Router();

const connexionController = require('../controllers/connexion.controller');
const { ConnexionValidator } = require('../validators/connexion.validator');
const validate = require('../middlewares/validate');
const { authentifier } = require('../middlewares/auth.middleware');

router.use(authentifier);

router.post(
  '/:userId',
  validate(ConnexionValidator.userId),
  connexionController.envoyerDemande
);

router.patch(
  '/:id/accepter',
  validate(ConnexionValidator.id),
  connexionController.accepterDemande
);

router.patch(
  '/:id/refuser',
  validate(ConnexionValidator.id),
  connexionController.refuserDemande
);

router.get(
  '/mes-demandes',
  connexionController.getMesDemandes
);

router.get(
  '/recues',
  connexionController.getDemandesRecues
);

router.get(
  '/mes-connexions',
  connexionController.getMesConnexions
);

router.delete(
  '/:id',
  validate(ConnexionValidator.id),
  connexionController.supprimerConnexion
);

module.exports = router;