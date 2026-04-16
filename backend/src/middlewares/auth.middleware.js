// Middleware Express qui vérifie le token JWT Bearer dans le header Authorization. Si absent ou invalide, renvoie 401. Si valide, ajoute req.user.
// Contenu type
// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]
//   if (!token) return res.status(401).json({ error: 'Non authentifié' })
//   // vérifie avec Keycloak...
//   req.user = decoded
//   next()
// }