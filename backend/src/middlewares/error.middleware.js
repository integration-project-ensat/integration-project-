// Handler global des erreurs Express (4 arguments). Intercepte toutes les erreurs non gérées et renvoie une réponse JSON cohérente avec le bon code HTTP.
// Contenu type
// module.exports = (err, req, res, next) => {
//   const status = err.status || 500
//   res.status(status).json({
//     error: err.message || 'Erreur interne'
//   })
// }