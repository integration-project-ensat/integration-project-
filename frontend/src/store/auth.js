// Store Pinia pour l'authentification. Stocke l'utilisateur connecté, son token JWT et son rôle (étudiant, prof, admin). Utilisé partout dans l'app pour vérifier les droits.
// Contenu type
// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     user:  null,
//     token: null,
//     role:  null   ← 'student' | 'teacher' | 'admin'
//   })
// })