/**
 * app.js
 * Configuration de l'application Express
 * 
 * Responsabilités :
 * - Configurer les middlewares globaux (CORS, JSON parsing)
 * - Monter les routes de l'API
 * - Exporter l'instance app pour les tests et le démarrage
 * 
 * Ne démarre PAS le serveur (voir server.js pour le démarrage)
 */
require('dotenv').config()
BigInt.prototype.toJSON = function () { return this.toString() }
const path = require('path')
const express = require('express')
const securityHeaders = require('./src/middlewares/securityHeaders.middleware')
const corsMiddleware = require('./src/middlewares/cors.middleware')

const{apiLimiter,authLimiter,passwordLimiter} = require('./src/middlewares/rateLimiter.middleware')
const errorMiddleware = require('./src/middlewares/error.middleware')

const authRoutes = require('./src/routes/auth.routes')
const competenceRoutes = require('./src/routes/competence.routes')
const photoRoutes = require('./src/routes/photo.routes')
const app = express()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//securite(headers, CORS, rate )
app.use(securityHeaders)
app.use(corsMiddleware)

//body parser
app.use(express.json({limit:'10Kb'}))
app.use(express.urlencoded({extended:true, limit:'10Kb'}))

app.use('/api', apiLimiter)
app.use('/api/auth/seconnecter', authLimiter)
app.use('/api/auth/sinscrire', authLimiter)
app.use('/api/auth/renvoyer-code', passwordLimiter)
app.use('/api/auth/verifier-code', passwordLimiter)
app.use('/api/auth/mot-de-passe-oublie', passwordLimiter)
app.use('/api/auth/reinitialiser-mot-de-passe', passwordLimiter)


//health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  })
})


// Auth routes
app.use('/api/auth', authRoutes)
// Competence routes
app.use('/api/competences', competenceRoutes)
// Photo upload routes
app.use('/api/profil/photo', photoRoutes)
//404 not found handler (doit être après toutes les routes)
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Fichier trop lourd. Maximum 5 MB.' });
  }
  if (err.message?.includes('Format non supporté')) {
    return res.status(415).json({ message: err.message });
  }
  next(err);
});

app.use((req,res) => {
  res.status(404).json({
    success:false,
    statusCode:404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

app.use(errorMiddleware)

module.exports = app