require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
BigInt.prototype.toJSON = function () { return this.toString() }

const express = require('express')
const morgan = require('morgan')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./src/config/swagger.config')
const securityHeaders = require('./src/middlewares/securityHeaders.middleware')
const corsMiddleware = require('./src/middlewares/cors.middleware')
const{apiLimiter,authLimiter,passwordLimiter} = require('./src/middlewares/rateLimiter.middleware')
const errorMiddleware = require('./src/middlewares/error.middleware')

const authRoutes = require('./src/routes/auth.routes')
const technologieRoutes = require('./src/routes/technologie.routes')
const competenceRoutes = require('./src/routes/competence.routes')
const profileRoutes = require('./src/routes/profile.routes')
const diplomeRoutes = require('./src/routes/diploma.routes')

const app = express()

// Logger HTTP
app.use(morgan('dev'))

// Documentation Swagger — AVANT helmet
app.use('/api-docs', swaggerUi.serve)
app.get('/api-docs', swaggerUi.setup(swaggerSpec))
app.get('/api-docs/', swaggerUi.setup(swaggerSpec))

// Securite (headers, CORS, rate)
app.use(securityHeaders)
app.use(corsMiddleware)

// Body parser
app.use(express.json({limit:'10Kb'}))
app.use(express.urlencoded({extended:true, limit:'10Kb'}))

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
app.use('/api/technologies', technologieRoutes)
app.use('/api/competences', competenceRoutes)
app.use('/api/profils', profileRoutes)
app.use('/api/diplomes', diplomeRoutes)

// 404
app.use((req,res) => {
  res.status(404).json({
    success:false,
    statusCode:404,
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

app.use(errorMiddleware)

module.exports = app