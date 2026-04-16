// Configuration du pool de connexions PostgreSQL via le package 'pg'. Se connecte avec les variables d'environnement et teste la connexion au démarrage du serveur.
// Contenu type
// const { Pool } = require('pg')
// const pool = new Pool({
//   host:     process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   user:     process.env.DB_USER,
//   password: process.env.DB_PASSWORD
// })
// module.exports = pool