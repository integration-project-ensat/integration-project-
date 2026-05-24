const lettreService = require('../services/lettre.service')
const exportService = require('../services/lettreExport.service')

const getConnectedUserId = (req) => req.utilisateur?.id_utilisateur

exports.getLettres = async (req, res) => {
  try {
    const data = await lettreService.getLettres(req.params.id_etudiant, getConnectedUserId(req))
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.getLettresPublic = async (req, res) => {
  try {
    const data = await lettreService.getLettres(req.params.id_etudiant, null)
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.updateVisibilite = async (req, res) => {
  try {
    const data = await lettreService.updateVisibilite(req.params.id_lettre, req.body.visibilite)
    res.status(200).json(data)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.exportPDF = async (req, res) => {
  try {
    const lettre = await lettreService.getLettreById(req.params.id_lettre)

    // If letter is not public and requester is not owner, forbid
    const requester = getConnectedUserId(req)
    if (lettre.visibilite !== 'PUBLIC' && String(requester) !== String(lettre.id_etudiant)) {
      // allow download only for owner; further rules can be added
      return res.status(403).json({ message: 'Acces refuse' })
    }

    const buffer = await exportService.exportPDF(req.params.id_lettre)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="lettre-${req.params.id_lettre}.pdf"`)
    res.send(buffer)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}

exports.exportHTML = async (req, res) => {
  try {
    const lettre = await lettreService.getLettreById(req.params.id_lettre)
    const requester = getConnectedUserId(req)
    if (lettre.visibilite !== 'PUBLIC' && String(requester) !== String(lettre.id_etudiant)) {
      return res.status(403).json({ message: 'Acces refuse' })
    }

    const html = await exportService.exportHTML(req.params.id_lettre)
    res.setHeader('Content-Type', 'text/html')
    res.send(html)
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message })
  }
}
