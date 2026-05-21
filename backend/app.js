require('dotenv').config()
BigInt.prototype.toJSON = function () { return this.toString() }
const path = require('path')
const express = require('express')
const securityHeaders = require('./src/middlewares/securityHeaders.middleware')
const corsMiddleware = require('./src/middlewares/cors.middleware')

const { apiLimiter, authLimiter, passwordLimiter } = require('./src/middlewares/rateLimiter.middleware')
const errorMiddleware = require('./src/middlewares/error.middleware')

const authRoutes = require('./src/routes/auth.routes')
const competenceRoutes = require('./src/routes/competence.routes')
<<<<<<< HEAD
const photoRoutes = require('./src/routes/photo.routes')
=======
const profileRoutes =require('./src/routes/profil.routes')
const diplomeRoutes = require('./src/routes/diplome.routes');
>>>>>>> f7844a2a1795ae15e7b77022fef2e8ab765a13c0

const app = express()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(securityHeaders)
app.use(corsMiddleware)

app.use(express.json({ limit: '10Kb' }))
app.use(express.urlencoded({ extended: true, limit: '10Kb' }))

app.use('/api', apiLimiter)
app.use('/api/auth/seconnecter', authLimiter)
app.use('/api/auth/sinscrire', authLimiter)
app.use('/api/auth/renvoyer-code', passwordLimiter)
app.use('/api/auth/verifier-code', passwordLimiter)
app.use('/api/auth/mot-de-passe-oublie', passwordLimiter)
app.use('/api/auth/reinitialiser-mot-de-passe', passwordLimiter)

<<<<<<< HEAD
=======



//health check
>>>>>>> f7844a2a1795ae15e7b77022fef2e8ab765a13c0
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/competences', competenceRoutes)
app.use('/api/profil/photo', photoRoutes)

<<<<<<< HEAD
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Fichier trop lourd. Maximum 5 MB.' });
  }
  if (err.message?.includes('Format non supporté')) {
    return res.status(415).json({ message: err.message });
  }
  next(err);
});

app.use((req, res) => {
=======
// Auth routes
app.use('/api/auth', authRoutes) 
// Competence routes
app.use('/api/competences', competenceRoutes)
app.use('/api/profil',profileRoutes)
app.use('/api/diplomes',diplomeRoutes)
//404 not found handler (doit être après toutes les routes)
app.use((req,res) => {
>>>>>>> f7844a2a1795ae15e7b77022fef2e8ab765a13c0
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

app.use(errorMiddleware)

module.exports = app