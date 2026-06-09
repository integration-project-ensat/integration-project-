import api from './api'

export const themeService = {
  getThemes() {
    return api.get('/portfolio/themes')
  },

  getCurrentTheme() {
    return api.get('/portfolio/theme')
  },

  saveTheme(id_modele) {
    return api.patch('/portfolio/theme', {
      id_modele
    })
  }
}