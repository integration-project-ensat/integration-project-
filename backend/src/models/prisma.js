import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma')
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
  adapter,
  errorFormat: 'colorless',
})

export const toBigInt = (value) => {
  if (value === null || value === undefined || value === '') return value
  return typeof value === 'bigint' ? value : BigInt(value)
}

export const normalizeBigIntFields = (data = {}, fields = []) => {
  const normalized = { ...data }

  for (const field of fields) {
    if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
      normalized[field] = toBigInt(normalized[field])
    }
  }

  return normalized
}
