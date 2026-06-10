import api from './api.js'

function updateStoredUser(account) {
  if (!account) return

  try {
    const current = JSON.parse(localStorage.getItem('user') || '{}')
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...current,
        ...account,
        id: account.id ?? account.id_utilisateur ?? current.id,
        name: account.name || [account.prenom, account.nom].filter(Boolean).join(' ').trim() || current.name,
      }),
    )
  } catch {
    localStorage.setItem('user', JSON.stringify(account))
  }
}

export const accountService = {
  async getMe() {
    const { data } = await api.get('/account/me')
    return data.data
  },

  async updateEmail(payload) {
    const { data } = await api.patch('/account/email', {
      newEmail: payload.newEmail,
      currentPassword: payload.currentPassword,
    })
    updateStoredUser(data.data)
    return data
  },

  async updatePassword(payload) {
    const { data } = await api.patch('/account/password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword,
    })
    return data
  },
}

export default accountService
