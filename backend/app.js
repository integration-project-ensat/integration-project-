require('dotenv').config()
BigInt.prototype.toJSON = function () { return this.toString() }
const passport = require('./src/config/passport');
const path = require('path')
const express = require('express')

const securityHeaders = require('./src/middlewares/securityHeaders.middleware')
const corsMiddleware = require('./src/middlewares/cors.middleware')

const { apiLimiter, authLimiter, passwordLimiter,profilLimiter,diplomeLimiter } = require('./src/middlewares/rateLimiter.middleware')
const errorMiddleware = require('./src/middlewares/error.middleware')

// Routes existantes
const authRoutes = require('./src/routes/auth.routes')
const adminRoutes      = require('./src/routes/admin.routes')
const studentRoutes    = require('./src/routes/student.routes')
const competenceRoutes = require('./src/routes/competence.routes')
const profileRoutes = require('./src/routes/profil.routes')
const diplomeRoutes = require('./src/routes/diplome.routes')
const photoRoutes = require('./src/routes/photo.routes')
const bannerRoutes = require('./src/routes/banner.routes')
const portfolioRoutes = require('./src/routes/portfolio.routes')
const lettreRoutes = require('./src/routes/lettre.routes')
const commentaireRoutes = require('./src/routes/commentaire.routes')
const recommendationRoutes = require('./src/routes/recommendation.routes')
const postRoutes = require('./src/routes/post.routes')
const exploreRoutes = require('./src/routes/explore.routes')
const profilePublicRoutes = require('./src/routes/profilePublic.routes')
const connexionRoutes = require('./src/routes/connexion.routes')
const projetRoutes = require('./src/routes/projet.routes')
const stageRoutes = require('./src/routes/stage.routes')
const activiteRoutes = require('./src/routes/activite.routes')
const attestationRoutes = require('./src/routes/attestation.routes')
const notificationRoutes = require('./src/routes/notification.routes');
const badgeRoutes = require('./src/routes/badge.routes');
const app = express()


// Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Sécurité & CORS
app.use(securityHeaders)
app.use(corsMiddleware)
app.use(passport.initialize());
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
  });
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin',        adminRoutes)  
app.use('/api/student',      studentRoutes)
app.use('/api/competences', competenceRoutes)
app.use('/api/profil/photo',  photoRoutes)
app.use('/api/profil/banner', bannerRoutes)
app.use('/api/profil', diplomeLimiter, profileRoutes)
app.use('/api/diplomes',diplomeLimiter, diplomeRoutes)
app.use('/api/projets', projetRoutes)
app.use('/api/stages', stageRoutes)
app.use('/api/activites', activiteRoutes)
app.use('/api/attestations', attestationRoutes)
app.use('/api/connexions', connexionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api', portfolioRoutes)
app.use('/api', lettreRoutes)
app.use('/api/commentaires', commentaireRoutes)
app.use('/api/recommandations', recommendationRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/profiles', profilePublicRoutes)
app.use('/api', exploreRoutes)
app.use('/api/projets', projetRoutes)
app.use('/api/stages', stageRoutes)
app.use('/api/activites', activiteRoutes)
app.use('/api/attestations', attestationRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// error middleware LAST
app.use(errorMiddleware)

module.exports = app
