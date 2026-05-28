const express = require('express')
const router = express.Router()

const postController = require('../controllers/post.controller')
const { authentifier, autoriserRoles } = require('../middlewares/auth.middleware')
const { multerMiddleware } = require('../middlewares/multer.middleware')
const validate = require('../middlewares/validate')
const postValidator = require('../validators/post.validator')

router.use(authentifier)

router.get('/', postController.getAll)
router.get('/:id', validate(postValidator.idParamRules), postController.getOne)

router.post(
  '/',
  autoriserRoles('ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL'),
  multerMiddleware('image', 'posts'),
  validate(postValidator.creerRules),
  postController.create,
)

router.patch(
  '/:id',
  autoriserRoles('ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR'),
  multerMiddleware('image', 'posts'),
  validate(postValidator.modifierRules),
  postController.update,
)

router.delete(
  '/:id',
  autoriserRoles('ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR'),
  validate(postValidator.idParamRules),
  postController.delete,
)

router.post(
  '/:id/reactions',
  validate(postValidator.reactionRules),
  postController.reagir,
)

router.delete(
  '/:id/reactions',
  validate(postValidator.idParamRules),
  postController.supprimerReaction,
)

router.post(
  '/:id/reposts',
  validate(postValidator.idParamRules),
  postController.repost,
)

router.delete(
  '/:id/reposts',
  validate(postValidator.idParamRules),
  postController.supprimerRepost,
)

module.exports = router
