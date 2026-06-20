const profilePublicService = require('../services/profilePublic.service')
const { ApiResponse } = require('../utils/apiResponse')

const profilePublicController = {
  async getOne(req, res) {
    try {
      const profile = await profilePublicService.getProfile(req.params.id)
      if (!profile) return res.status(404).json(ApiResponse.notFound('Profil'))
      return res.json(ApiResponse.success(profile, 'Profil recupere'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = profilePublicController
