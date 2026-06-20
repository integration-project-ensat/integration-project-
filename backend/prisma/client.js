const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

function resolveConnectionString() {
  const rawConnectionString = process.env.DATABASE_URL || '';
  if (!rawConnectionString) {
    return rawConnectionString;
  }

  if (process.env.RUNNING_IN_DOCKER === 'true') {
    return rawConnectionString;
  }

  try {
    const parsed = new URL(rawConnectionString);
    if (parsed.hostname === 'postgres') {
      parsed.hostname = 'localhost';
      return parsed.toString();
    }
  } catch {
    return rawConnectionString;
  }

  return rawConnectionString;
}

const adapter = new PrismaPg({ connectionString: resolveConnectionString() });

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
