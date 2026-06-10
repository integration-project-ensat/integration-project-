const express = require('express')
const router = express.Router()

const { authentifier } = require('../middlewares/auth.middleware')
const portfolioCtrl = require('../controllers/portfolio.controller')

router.get('/portfolio/public/:lien', portfolioCtrl.getPortfolioPublic)
router.get('/portfolio/themes', authentifier, portfolioCtrl.getAllThemes)
router.get('/portfolio/theme', authentifier, portfolioCtrl.getThemeEtudiant)
router.patch('/portfolio/theme', authentifier, portfolioCtrl.saveTheme)
router.get('/portfolio/lien-partage', authentifier, portfolioCtrl.getLienPartage)
router.get('/portfolio/:id_etudiant/export/pdf', authentifier, portfolioCtrl.exportPDF)
router.get('/portfolio/:id_etudiant/export/html', authentifier, portfolioCtrl.exportHTML)
router.get('/portfolio/:id_etudiant', authentifier, portfolioCtrl.getPortfolio)
router.patch('/portfolio/visibilite', authentifier, portfolioCtrl.updateVisibilite)
router.patch('/portfolio', authentifier, portfolioCtrl.updatePortfolio)
router.get(
    '/templates',
    authentifier,
    portfolioCtrl.getTemplates
)
router.patch(
    '/template',
    authentifier,
    portfolioCtrl.changeTemplate
)
module.exports = router
