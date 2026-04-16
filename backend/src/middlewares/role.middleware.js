// Middleware de contrôle de rôle. S'utilise après auth.middleware. Vérifie que req.user.role correspond au rôle requis, sinon renvoie 403 Forbidden.
// Contenu type
// const checkRole = (role) => (req, res, next) => {
//   if (req.user.role !== role)
//     return res.status(403).json({ error: 'Accès refusé' })
//   next()
// }