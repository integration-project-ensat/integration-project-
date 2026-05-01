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
const { PrismaClient } = require('@prisma/client')
const{PrismaPg}=require('@prisma/adapter-pg')
const {Pool}=require('pg')

require('dotenv').config()

const pool=new Pool({connectionString:process.env.DATABASE_URL})
const adapter=new PrismaPg(pool)
const prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn','info']
})

module.exports = prisma