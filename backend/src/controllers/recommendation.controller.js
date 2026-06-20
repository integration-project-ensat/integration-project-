const recommendationService = require('../services/recommendation.service')
const { ApiResponse } = require('../utils/apiResponse')

const recommendationController = {
  async create(req, res) {
    try {
      const recommendation = await recommendationService.create(req.body, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(recommendation, 'Recommandation ajoutee en attente de validation'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getAll(req, res) {
    try {
      const recommendations = await recommendationService.findAll(req.query)
      return res.json(ApiResponse.success(recommendations, 'Recommandations recuperees'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async valider(req, res) {
    try {
      const recommendation = await recommendationService.changerStatut(
        req.params.id,
        'VALIDE',
        req.utilisateur.id_utilisateur,
      )
      if (!recommendation) return res.status(404).json(ApiResponse.notFound('Recommandation'))
      return res.json(ApiResponse.success(recommendation, 'Recommandation validee'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async refuser(req, res) {
    try {
      const recommendation = await recommendationService.changerStatut(
        req.params.id,
        'REFUSE',
        req.utilisateur.id_utilisateur,
        req.body.motif_refus || null,
      )
      if (!recommendation) return res.status(404).json(ApiResponse.notFound('Recommandation'))
      return res.json(ApiResponse.success(recommendation, 'Recommandation refusee'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async ajouterAuPortfolio(req, res) {
    try {
      const result = await recommendationService.ajouterAuPortfolio(req.params.id, req.body)
      if (!result) return res.status(404).json(ApiResponse.notFound('Recommandation'))
      return res.json(ApiResponse.success(result, 'Recommandation ajoutee au portfolio'))
    } catch (e) {
      if (e.statusCode === 422) return res.status(422).json(ApiResponse.unprocessable(e.message))
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async compter(req, res) {
    try {
      const total = await recommendationService.compter(req.query)
      return res.json(ApiResponse.success({ total }, 'Compteur recommandations'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = recommendationController
