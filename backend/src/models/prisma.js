const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const adapter = new PrismaPg({ connectionString })

const prisma = new PrismaClient({
  adapter,
  errorFormat: 'colorless',
})

const toBigInt = (value) => {
  if (value === null || value === undefined || value === '') return value
  return typeof value === 'bigint' ? value : BigInt(value)
}

const normalizeBigIntFields = (data = {}, fields = []) => {
  const normalized = { ...data }

  for (const field of fields) {
    if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
      normalized[field] = toBigInt(normalized[field])
    }
  }

  return normalized
}

module.exports = {
  normalizeBigIntFields,
  prisma,
  toBigInt,
}
