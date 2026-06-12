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
  const statusResponse = await api.get(`/connexions/status/${userId}`)
  const status = statusResponse.data?.data || statusResponse.data

  if (status?.isConnected) {
    const error = new Error('Users are already connected') as Error & { response?: any }
    error.response = { data: { message: 'Users are already connected' } }
    throw error
  }

  if (status?.requestSent || status?.requestReceived) {
    const error = new Error('Request already exists') as Error & { response?: any }
    error.response = { data: { message: 'Request already exists' } }
    throw error
  }

  const res = await api.post(`/connexions/${userId}`)
  return res.data.data
}
