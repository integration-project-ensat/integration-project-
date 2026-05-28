import api from './api'

export const postService = {
  getPosts(params = {}) {
    return api.get('/posts', { params })
  },

  getPost(id) {
    return api.get(`/posts/${id}`)
  },

  createPost(formData) {
    return api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  updatePost(id, formData) {
    return api.patch(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deletePost(id) {
    return api.delete(`/posts/${id}`)
  },

  reactToPost(id, type = 'JAIME') {
    return api.post(`/posts/${id}/reactions`, { type })
  },

  removeReaction(id) {
    return api.delete(`/posts/${id}/reactions`)
  },

  repost(id) {
    return api.post(`/posts/${id}/reposts`)
  },

  removeRepost(id) {
    return api.delete(`/posts/${id}/reposts`)
  },
}
