/**
 * server.js
 * Point d'entrée de l'application backend
 */

require('dotenv').config()

const app = require('./app.js')
const http = require('http')
const prisma = require('./prisma/client')

const PORT = process.env.PORT || 3000

const server = http.createServer(app)

// Connect DB then start server
async function startServer() {
  try {
    await prisma.$connect()
    console.log('Connected to Database')

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`)
        process.exit(1)
      }
    })

  } catch (error) {
    console.error('Failed to connect to Database:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down server...')

  server.close(async () => {
    await prisma.$disconnect()
    console.log('Server and database closed gracefully')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Forced shutdown after 10 seconds')
    process.exit(1)
  }, 10000)
})

process.on('SIGINT', async () => {
  console.log('Ctrl+C received, shutting down server...')

  server.close(async () => {
    await prisma.$disconnect()
    console.log('Server and database closed gracefully')
    process.exit(0)
  })
})

startServer()
