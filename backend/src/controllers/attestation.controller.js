const attestationService = require('../services/attestation.service')
const { ApiResponse } = require('../utils/apiResponse')

const attestationController = {
  async getAll(req, res) {
    try {
      const { statut, etudiantId } = req.query
      const user = req.utilisateur
      const filters = {}
      if (user.role === 'ETUDIANT') {
        filters.etudiantId = user.id_utilisateur
      } else if (etudiantId) {
        filters.etudiantId = etudiantId
      }
      if (user.role === 'PROFESSEUR' && !filters.etudiantId) {
        filters.validateurId = user.id_utilisateur
      }
      if (statut) filters.statut = statut

      const attestations = await attestationService.findAll(filters)
      return res.json(ApiResponse.success(attestations, 'Attestations récupérées'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getOne(req, res) {
    try {
      const attestation = await attestationService.findById(req.params.id)
      if (!attestation) return res.status(404).json(ApiResponse.notFound('Attestation'))
      return res.json(ApiResponse.success(attestation))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async create(req, res) {
    try {
      const fichierUrl = req.file ? `/uploads/attestations/${req.file.filename}` : null
      const attestation = await attestationService.create(req.body, req.utilisateur.id_utilisateur, fichierUrl)
      return res.status(201).json(ApiResponse.created(attestation, 'Attestation créée avec succès'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async update(req, res) {
    try {
      const attestation = await attestationService.update(req.params.id, req.body, req.utilisateur.id_utilisateur)
      if (!attestation) return res.status(404).json(ApiResponse.notFound('Attestation'))
      return res.json(ApiResponse.success(attestation, 'Attestation mise à jour'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async delete(req, res) {
    try {
      const attestation = await attestationService.delete(req.params.id)
      if (!attestation) return res.status(404).json(ApiResponse.notFound('Attestation'))
      return res.json(ApiResponse.success(null, 'Attestation supprimée'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async changerStatut(req, res) {
    try {
      const { statut, motif_refus } = req.body
      const attestation = await attestationService.changerStatut(
        req.params.id, statut,
        req.utilisateur.id_utilisateur,
        motif_refus
      )
      if (!attestation) return res.status(404).json(ApiResponse.notFound('Attestation'))
      return res.json(ApiResponse.success(attestation, `Attestation ${statut.toLowerCase()}`))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getHistorique(req, res) {
    try {
      const historique = await attestationService.getHistorique(req.params.id)
      if (!historique) return res.status(404).json(ApiResponse.notFound('Attestation'))
      return res.json(ApiResponse.success(historique, 'Historique récupéré'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  }
}

module.exports = attestationController
