const stageService = require('../services/stage.service')
const { ApiResponse } = require('../utils/apiResponse')

const stageController = {
  async getAll(req, res) {
    try {
      const { statut } = req.query
      const user = req.utilisateur
      const filters = {}
      if (user.role === 'ETUDIANT') filters.etudiantId = user.id_utilisateur
      if (user.role === 'PROFESSEUR') filters.encadrantId = user.id_utilisateur
      if (statut) filters.statut = statut

      const stages = await stageService.findAll(filters)
      return res.json(ApiResponse.success(stages, 'Stages récupérés'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getOne(req, res) {
    try {
      const stage = await stageService.findById(req.params.id)
      if (!stage) return res.status(404).json(ApiResponse.notFound('Stage'))
      return res.json(ApiResponse.success(stage))
    } catch (e) {
      if (e.statusCode === 400) return res.status(400).json(ApiResponse.validationError({ professionnel: [e.message] }))
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async create(req, res) {
    try {
      const stage = await stageService.create(req.body, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(stage, 'Stage créé avec succès'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async update(req, res) {
    try {
      const stage = await stageService.update(req.params.id, req.body, req.utilisateur.id_utilisateur)
      if (!stage) return res.status(404).json(ApiResponse.notFound('Stage'))
      return res.json(ApiResponse.success(stage, 'Stage mis à jour'))
    } catch (e) {
      if (e.statusCode === 400) return res.status(400).json(ApiResponse.validationError({ professionnel: [e.message] }))
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async delete(req, res) {
    try {
      const stage = await stageService.delete(req.params.id, req.utilisateur.id_utilisateur)
      if (!stage) return res.status(404).json(ApiResponse.notFound('Stage'))
      return res.json(ApiResponse.success(null, 'Stage supprimé'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async uploadRapport(req, res) {
    try {
      if (!req.file) return res.status(400).json(ApiResponse.validationError({ fichier: ['Rapport requis'] }))
      const rapportUrl = `/uploads/rapports/${req.file.filename}`
      const stage = await stageService.uploadRapport(req.params.id, rapportUrl, req.utilisateur.id_utilisateur)
      if (!stage) return res.status(404).json(ApiResponse.notFound('Stage'))
      return res.json(ApiResponse.success(stage, 'Rapport uploadé avec succès'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async changerStatut(req, res) {
    try {
      const { statut, commentaire_prof, motif_refus } = req.body
      const stage = await stageService.changerStatut(
        req.params.id, statut,
        req.utilisateur.id_utilisateur,
        { commentaire_prof, motif_refus }
      )
      if (!stage) return res.status(404).json(ApiResponse.notFound('Stage'))
      return res.json(ApiResponse.success(stage, `Stage ${statut.toLowerCase()}`))
    } catch (e) {
      if (e.statusCode === 403) {
        return res.status(403).json({ message: e.message || 'Acces refuse' })
      }
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getHistorique(req, res) {
    try {
      const historique = await stageService.getHistorique(req.params.id)
      return res.json(ApiResponse.success(historique, 'Historique récupéré'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  }
}

module.exports = stageController
