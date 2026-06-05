const postService = require('../services/post.service')
const { ApiResponse } = require('../utils/apiResponse')

const postController = {
  async getAll(req, res) {
    try {
      const posts = await postService.findAll(req.query)
      return res.json(ApiResponse.success(posts, 'Posts recuperes'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async getOne(req, res) {
    try {
      const post = await postService.findById(req.params.id)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async create(req, res) {
    try {
      const post = await postService.create(req.body, req.file, req.utilisateur.id_utilisateur)
      return res.status(201).json(ApiResponse.created(post, 'Post cree avec succes'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async addComment(req, res) {
    try {
      const post = await postService.addComment(req.params.id, req.utilisateur.id_utilisateur, req.body.contenu)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.status(201).json(ApiResponse.created(post, 'Commentaire ajoute'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async update(req, res) {
    try {
      const post = await postService.update(req.params.id, req.body, req.file, req.utilisateur)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post, 'Post mis a jour'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async delete(req, res) {
    try {
      const post = await postService.delete(req.params.id, req.utilisateur)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(null, 'Post supprime'))
    } catch (e) {
      if (e.statusCode === 403) return res.status(403).json(ApiResponse.forbidden())
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async reagir(req, res) {
    try {
      const post = await postService.reagir(req.params.id, req.utilisateur.id_utilisateur, req.body.type || 'JAIME')
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post, 'Reaction enregistree'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async supprimerReaction(req, res) {
    try {
      const post = await postService.supprimerReaction(req.params.id, req.utilisateur.id_utilisateur)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post, 'Reaction supprimee'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async repost(req, res) {
    try {
      const post = await postService.repost(req.params.id, req.utilisateur.id_utilisateur)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post, 'Post republie'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },

  async supprimerRepost(req, res) {
    try {
      const post = await postService.supprimerRepost(req.params.id, req.utilisateur.id_utilisateur)
      if (!post) return res.status(404).json(ApiResponse.notFound('Post'))
      return res.json(ApiResponse.success(post, 'Republication supprimee'))
    } catch (e) {
      return res.status(500).json(ApiResponse.serverError())
    }
  },
}

module.exports = postController
