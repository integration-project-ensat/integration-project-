const commentaireService = require('../services/commentaire.service')
const { ApiResponse } = require('../utils/apiResponse')

const commentaireController = {
  async create(req, res) {
    try {
      const commentaire = await commentaireService.create(req.body, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(commentaire, 'Commentaire ajoute en attente de validation'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getAll(req, res) {
    try {
      const commentaires = await commentaireService.findAll(req.query)
      return res.json(ApiResponse.success(commentaires, 'Commentaires recuperes'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async valider(req, res) {
    try {
      const commentaire = await commentaireService.changerStatut(
        req.params.id,
        'VALIDE',
        req.utilisateur.id_utilisateur,
      )
      if (!commentaire) return res.status(404).json(ApiResponse.notFound('Commentaire'))
      return res.json(ApiResponse.success(commentaire, 'Commentaire valide'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async refuser(req, res) {
    try {
      const commentaire = await commentaireService.changerStatut(
        req.params.id,
        'REFUSE',
        req.utilisateur.id_utilisateur,
        req.body.motif_refus || null,
      )
      if (!commentaire) return res.status(404).json(ApiResponse.notFound('Commentaire'))
      return res.json(ApiResponse.success(commentaire, 'Commentaire refuse'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getHistorique(req, res) {
    try {
      const historique = await commentaireService.getHistorique(req.params.id)
      return res.json(ApiResponse.success(historique, 'Historique recupere'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = commentaireController
