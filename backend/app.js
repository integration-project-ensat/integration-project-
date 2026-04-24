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

const express = require('express')
const cors = require('cors')

const authRoutes = require('./src/routes/auth.routes')

const app = express()
// Middlewares globaux
app.use(cors())
app.use(express.json())
// Routes
app.get('/', (req, res) => {
  res.send('Backend is running ')
})
// Auth routes
app.use('/api/auth', authRoutes) 

module.exports = app    