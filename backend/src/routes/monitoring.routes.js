const express = require('express')
const client = require('prom-client')
const prisma = require('../../prisma/client')

const router = express.Router()
const register = new client.Registry()

client.collectDefaultMetrics({ register })

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
})

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestsTotal)

const metricsMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint()

  res.on('finish', () => {
    if (req.path === '/metrics') return

    const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000
    const route = req.route?.path || req.path || req.originalUrl
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode)
    }

    httpRequestDuration.observe(labels, durationSeconds)
    httpRequestsTotal.inc(labels)
  })

  next()
}

router.get('/health', async (req, res) => {
  const startedAt = process.hrtime.bigint()

  try {
    await prisma.$queryRaw`SELECT 1`

    const responseTimeMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    return res.status(200).json({
      status: 'ok',
      service: 'backend',
      database: 'connected',
      uptime: process.uptime(),
      responseTimeMs: Number(responseTimeMs.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const responseTimeMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    return res.status(503).json({
      status: 'error',
      service: 'backend',
      database: 'disconnected',
      uptime: process.uptime(),
      responseTimeMs: Number(responseTimeMs.toFixed(2)),
      timestamp: new Date().toISOString()
    })
  }
})

router.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

module.exports = {
  metricsMiddleware,
  monitoringRoutes: router
}
