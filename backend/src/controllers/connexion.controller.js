const connexionService = require('../services/connexion.service')
const { ApiResponse } = require('../utils/apiResponse')

const connexionController = {
  async create(req, res) {
    try {
      const connexion = await connexionService.create(req.utilisateur.id_utilisateur, req.body)
      return res.status(201).json(ApiResponse.created(connexion, 'Demande de connexion envoyee'))
    } catch (e) {
      if (e.statusCode === 422) return res.status(422).json(ApiResponse.unprocessable(e.message))
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getMine(req, res) {
    try {
      const connexions = await connexionService.findMine(req.utilisateur.id_utilisateur)
      return res.json(ApiResponse.success(connexions, 'Connexions recuperees'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async accepter(req, res) {
    try {
      const connexion = await connexionService.changerStatut(
        req.params.id,
        req.utilisateur.id_utilisateur,
        'ACCEPTEE',
      )
      if (!connexion) return res.status(404).json(ApiResponse.notFound('Connexion'))
      return res.json(ApiResponse.success(connexion, 'Connexion acceptee'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async refuser(req, res) {
    try {
      const connexion = await connexionService.changerStatut(
        req.params.id,
        req.utilisateur.id_utilisateur,
        'REFUSEE',
      )
      if (!connexion) return res.status(404).json(ApiResponse.notFound('Connexion'))
      return res.json(ApiResponse.success(connexion, 'Connexion refusee'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = connexionController
