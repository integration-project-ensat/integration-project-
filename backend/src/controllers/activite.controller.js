const activiteService = require('../services/activite.service')
const { ApiResponse } = require('../utils/apiResponse')

const activiteController = {
  async getAll(req, res) {
    try {
      const { statut } = req.query
      const user = req.utilisateur
      const filters = {}
      if (user.role === 'ETUDIANT') filters.etudiantId = user.id_utilisateur
      if (user.role === 'PROFESSEUR') filters.validateurId = user.id_utilisateur
      if (statut) filters.statut = statut

      const activites = await activiteService.findAll(filters)
      return res.json(ApiResponse.success(activites, 'Activités récupérées'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getOne(req, res) {
    try {
      const activite = await activiteService.findById(req.params.id)
      if (!activite) return res.status(404).json(ApiResponse.notFound('Activité'))
      return res.json(ApiResponse.success(activite))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async create(req, res) {
    try {
      const activite = await activiteService.create(req.body, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(activite, 'Activité créée avec succès'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async update(req, res) {
    try {
      const activite = await activiteService.update(req.params.id, req.body, req.utilisateur.id_utilisateur)
      if (!activite) return res.status(404).json(ApiResponse.notFound('Activité'))
      return res.json(ApiResponse.success(activite, 'Activité mise à jour'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async delete(req, res) {
    try {
      const activite = await activiteService.delete(req.params.id, req.utilisateur.id_utilisateur)
      if (!activite) return res.status(404).json(ApiResponse.notFound('Activité'))
      return res.json(ApiResponse.success(null, 'Activité supprimée'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async uploadJustificatif(req, res) {
    try {
      if (!req.file) return res.status(400).json(ApiResponse.validationError({ fichier: ['Justificatif requis'] }))
      const justificatifUrl = `/uploads/justificatifs/${req.file.filename}`
      const activite = await activiteService.uploadJustificatif(req.params.id, justificatifUrl, req.utilisateur.id_utilisateur)
      if (!activite) return res.status(404).json(ApiResponse.notFound('Activité'))
      return res.json(ApiResponse.success(activite, 'Justificatif uploadé avec succès'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async valider(req, res) {
    try {
      const { statut } = req.body
      const activite = await activiteService.valider(req.params.id, req.utilisateur.id_utilisateur, statut)
      if (!activite) return res.status(404).json(ApiResponse.notFound('Activité'))
      return res.json(ApiResponse.success(activite, `Activité ${statut.toLowerCase()}`))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  }
}

module.exports = activiteController