import api from './api'

export const getFeed = async (params = {}) => {
  const res = await api.get('/feed', { params })
  return res.data.data
}

export const addFeedComment = async (postId: string, contenu: string) => {
  const res = await api.post(`/posts/${postId}/comments`, { contenu })
  return res.data.data
}

export const likeFeedPost = async (postId: string) => {
  const res = await api.post(`/posts/${postId}/reactions`, { type: 'JAIME' })
  return res.data.data
}

export const unlikeFeedPost = async (postId: string) => {
  const res = await api.delete(`/posts/${postId}/reactions`)
  return res.data.data
}

export const repostFeedPost = async (postId: string) => {
  const res = await api.post(`/posts/${postId}/reposts`)
  return res.data.data
}

export const removeFeedRepost = async (postId: string) => {
  const res = await api.delete(`/posts/${postId}/reposts`)
  return res.data.data
}

export const sendConnectionRequest = async (userId: string) => {
  const res = await api.post(`/connexions/${userId}`)
  return res.data.data
}
