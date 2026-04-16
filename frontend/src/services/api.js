// Instance Axios centralisée. Configure la baseURL vers le backend et injecte automatiquement le token JWT Bearer dans chaque requête via un intercepteur.
// Contenu type
// const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })
// api.interceptors.request.use(config => {
//   config.headers.Authorization = 'Bearer ' + getToken()
//   return config
// })