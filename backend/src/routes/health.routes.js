const express = require('express')
const prisma = require('../../prisma/client')

const router = express.Router()

router.get('/', async (req, res) => {
  const startedAt = process.hrtime.bigint()

  try {
    await prisma.$queryRaw`SELECT 1`

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    return res.status(200).json({
      status: 'ok',
      service: 'backend',
      database: 'connected',
      uptime: process.uptime(),
      responseTimeMs: Number(durationMs.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    return res.status(503).json({
      status: 'error',
      service: 'backend',
      database: 'disconnected',
      uptime: process.uptime(),
      responseTimeMs: Number(durationMs.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
