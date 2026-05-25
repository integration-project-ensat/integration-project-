/**
 * prisma/client.js
 * Instance unique et partagée de PrismaClient
 * 
 * Responsabilités :
 * - Créer une seule connexion à PostgreSQL
 * - Centraliser les logs SQL
 * - Être importée par tous les controllers (pas de new PrismaClient())
 * 
 * Pourquoi ce fichier ?
 * Évite les connexions multiples qui surchargeraient PostgreSQL
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // logs SQL centralisés ici
});

module.exports = prisma;