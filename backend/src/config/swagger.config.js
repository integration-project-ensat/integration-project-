const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Integration Project API',
      version: '1.0.0',
      description: 'Documentation complète de l\'API du projet d\'intégration',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.routes.js',
    './src/swagger/*.js'
  ],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec