require('dotenv').config()
BigInt.prototype.toJSON = function () { return this.toString() }

const path = require('path')
const express = require('express')

const securityHeaders = require('./src/middlewares/securityHeaders.middleware')
const corsMiddleware = require('./src/middlewares/cors.middleware')
const errorMiddleware = require('./src/middlewares/error.middleware')
const { apiLimiter, authLimiter, passwordLimiter } = require('./src/middlewares/rateLimiter.middleware')

// Routes existantes
const authRoutes = require('./src/routes/auth.routes')
const competenceRoutes = require('./src/routes/competence.routes')
const profileRoutes = require('./src/routes/profil.routes')
const diplomeRoutes = require('./src/routes/diplome.routes')
const photoRoutes = require('./src/routes/photo.routes')

// Routes à venir (décommenter au fur et à mesure)
// const projetRoutes = require('./src/routes/projet.routes')
// const stageRoutes = require('./src/routes/stage.routes')
// const activiteRoutes = require('./src/routes/activite.routes')
// const attestationRoutes = require('./src/routes/attestation.routes')

const app = express()
const projetRoutes = require('./src/routes/projet.routes')
const stageRoutes = require('./src/routes/stage.routes')

const activiteRoutes = require('./src/routes/activite.routes')
const attestationRoutes = require('./src/routes/attestation.routes')

// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Sécurité & CORS
app.use(securityHeaders)
app.use(corsMiddleware)

// Body parser
app.use(express.json({ limit: '10Kb' }))
app.use(express.urlencoded({ extended: true, limit: '10Kb' }))

// Rate limiting
app.use('/api', apiLimiter)
app.use('/api/auth/seconnecter', authLimiter)
app.use('/api/auth/sinscrire', authLimiter)
app.use('/api/auth/renvoyer-code', passwordLimiter)
app.use('/api/auth/verifier-code', passwordLimiter)
app.use('/api/auth/mot-de-passe-oublie', passwordLimiter)
app.use('/api/auth/reinitialiser-mot-de-passe', passwordLimiter)

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/competences', competenceRoutes)
app.use('/api/profil', profileRoutes)
app.use('/api/profil/photo', photoRoutes)
app.use('/api/diplomes', diplomeRoutes)

// Gestion erreurs Multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Fichier trop lourd. Maximum 5 MB.' })
  }
  if (err.message?.includes('Format non supporté')) {
    return res.status(415).json({ success: false, message: err.message })
  }
  next(err)
})

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// Erreurs globales
app.use(errorMiddleware)

app.use('/api/projets', projetRoutes)
app.use('/api/stages', stageRoutes)
app.use('/api/activites', activiteRoutes)
app.use('/api/attestations', attestationRoutes)


module.exports = app