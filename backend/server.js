/**
 * server.js
 * Point d'entrée de l'application backend
 * Responsabilités :
 * - Établir la connexion à PostgreSQL via Prisma avant démarrage
 * - Créer et démarrer le serveur HTTP
 * - Gérer l'arrêt gracieux (graceful shutdown) pour fermer proprement les connexions
 * Pour démarrer : node server.js
 */
//Importe la configuration Express depuis app.js (routes, middlewares).

const app = require('./app.js')
//Importe le module HTTP natif de Node.js pour créer un serveur web bas niveau (plus propre qu'app.listen()).
const http = require('http')
//Importe l'instance Prisma unique pour gérer la connexion à PostgreSQL.
const prisma = require('./prisma/client')


const PORT = process.env.PORT || 3000
//Crée le serveur HTTP avec ta configuration Express
const server = http.createServer(app)

//connect to database before starting server
async function startServer() {
  try {
    await prisma.$connect()
    console.log('Connected to Database')

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }
  //En cas d'erreur de connexion à la base de données, log l'erreur et arrête le processus. 
  catch (error) {
    console.error('Failed to connect to Database:', error)
    process.exit(1)
  }
}
//Graceful shutdown
process.on('SIGTERM', async() => {
//Quand le système envoie un signal SIGTERM (arrêt du serveur)comme docker ,cloud, log l'événement, ferme le serveur HTTP et la connexion à la base de données avant de quitter proprement.
  console.log('SIGTERM received, shutting down server...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Server and database closed gracefully')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  //en local, quand tu appuies sur Ctrl+C dans le terminal, log l'événement, ferme le serveur HTTP et la connexion à la base de données avant de quitter proprement.
  console.log('Ctrl+C received, shutting down server...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Server and database closed gracefully')
    process.exit(0)
  })

})
//Démarre le serveur après avoir établi la connexion à la base de données.
startServer()
