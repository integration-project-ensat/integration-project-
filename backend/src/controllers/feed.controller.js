const feedService = require('../services/feed.service')
const { ApiResponse } = require('../utils/apiResponse')

const feedController = {
  async getFeed(req, res) {
    try {
      const feed = await feedService.getFeed(req.utilisateur.id_utilisateur, req.query)
      return res.json(ApiResponse.success(feed, 'Feed recupere'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = feedController
