const portfolioService = require('../services/portfolio.service')
const themeService = require('../services/theme.service')
const exportService = require('../services/portfolioExport.service')

const getConnectedUserId = (req) => req.utilisateur?.id_utilisateur

exports.getPortfolio = async (req, res) => {
  try {
    const data = await portfolioService.getPortfolio(
      req.params.id_etudiant,
      getConnectedUserId(req)
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.getPortfolioPublic = async (req, res) => {
  try {
    const data = await portfolioService.getPortfolioByLien(req.params.lien)
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.getAllThemes = async (req, res) => {
  try {
    const data = await themeService.getAllThemes()
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.getThemeEtudiant = async (req, res) => {
  try {
    const data = await themeService.getThemeEtudiant(getConnectedUserId(req))
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.saveTheme = async (req, res) => {
  try {
    const data = await themeService.saveTheme(
      getConnectedUserId(req),
      req.body.id_modele
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.updateVisibilite = async (req, res) => {
  try {
    const data = await portfolioService.updateVisibilite(
      getConnectedUserId(req),
      req.body.est_public
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.getLienPartage = async (req, res) => {
  try {
    const lien = await portfolioService.getLienPartage(getConnectedUserId(req))
    res.status(200).json({ lien })
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.updatePortfolio = async (req, res) => {
  try {
    const data = await portfolioService.updatePortfolio(
      getConnectedUserId(req),
      req.body
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.exportPDF = async (req, res) => {
  try {
    await portfolioService.getPortfolio(
      req.params.id_etudiant,
      getConnectedUserId(req)
    )

    const buffer = await exportService.exportPDF(req.params.id_etudiant)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio.pdf"')
    res.send(buffer)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.exportHTML = async (req, res) => {
  try {
    await portfolioService.getPortfolio(
      req.params.id_etudiant,
      getConnectedUserId(req)
    )

    const html = await exportService.exportHTML(req.params.id_etudiant)
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}
