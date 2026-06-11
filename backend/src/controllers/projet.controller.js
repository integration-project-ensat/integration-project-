const projetService = require('../services/projet.service')
const { ApiResponse } = require('../utils/apiResponse')

const projetController = {
  async getAll(req, res) {
    try {
      const { statut } = req.query
      const user = req.utilisateur

      const filters = {}
      if (user.role === 'ETUDIANT') filters.etudiantId = user.id_utilisateur
      if (user.role === 'PROFESSEUR') filters.professeurId = user.id_utilisateur
      if (statut) filters.statut = statut

      const projets = await projetService.findAll(filters)
      return res.json(ApiResponse.success(projets, 'Projets récupérés'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getOne(req, res) {
    try {
      const projet = await projetService.findById(req.params.id)
      if (!projet) return res.status(404).json(ApiResponse.notFound('Projet'))
      return res.json(ApiResponse.success(projet))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async create(req, res) {
    try {
      const projet = await projetService.create(req.body, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(projet, 'Projet créé avec succès'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async update(req, res) {
    try {
      const projet = await projetService.update(req.params.id, req.body, req.utilisateur.id_utilisateur)
      if (!projet) return res.status(404).json(ApiResponse.notFound('Projet'))
      return res.json(ApiResponse.success(projet, 'Projet mis à jour'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async delete(req, res) {
    try {
      const projet = await projetService.delete(req.params.id, req.utilisateur.id_utilisateur)
      if (!projet) return res.status(404).json(ApiResponse.notFound('Projet'))
      return res.json(ApiResponse.success(null, 'Projet supprimé'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async soumettre(req, res) {
    try {
      const projet = await projetService.soumettre(req.params.id, req.utilisateur.id_utilisateur)
      if (!projet) return res.status(404).json(ApiResponse.notFound('Projet'))
      return res.json(ApiResponse.success(projet, 'Projet soumis pour validation'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async changerStatut(req, res) {
    try {
      const { statut, motif_refus, appreciation_professeur } = req.body
      const projet = await projetService.changerStatut(
        req.params.id, statut,
        req.utilisateur.id_utilisateur,
        { motif_refus, appreciation_professeur }
      )
      if (!projet) return res.status(404).json(ApiResponse.notFound('Projet'))
      return res.json(ApiResponse.success(projet, `Projet ${statut.toLowerCase()}`))
    } catch (e) {
      if (e.statusCode === 403) {
        return res.status(403).json({ message: e.message || 'Acces refuse' })
      }
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getHistorique(req, res) {
    try {
      const historique = await projetService.getHistorique(req.params.id)
      return res.json(ApiResponse.success(historique, 'Historique récupéré'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  }
}

module.exports = projetController
