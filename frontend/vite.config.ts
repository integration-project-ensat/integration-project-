import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    process.env.VITE_PROXY_TARGET ||
    env.VITE_PROXY_TARGET ||
    process.env.VITE_BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    env.BACKEND_URL ||
    'http://localhost:3000'
  const hmrHost = process.env.VITE_HMR_HOST || env.VITE_HMR_HOST || 'localhost'
  const hmrProtocol = process.env.VITE_HMR_PROTOCOL || env.VITE_HMR_PROTOCOL || 'ws'
  const e2eMocksEnabled = process.env.VITE_E2E_MOCKS === 'true' || env.VITE_E2E_MOCKS === 'true'

  const e2eMockApiPlugin = {
    name: 'e2e-mock-api',
    configureServer(server) {
      if (!e2eMocksEnabled) return

      server.middlewares.use((req, res, next) => {
        const url = req.url || ''

        if (!url.startsWith('/api/')) {
          next()
          return
        }

        const send = (status, body) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (url.includes('/auth/seconnecter') || url.endsWith('/login')) {
          send(200, {
            success: true,
            data: {
              token: 'mock-e2e-token',
              user: { id: 1, email: 'test@test.com', role: 'student' }
            }
          })
          return
        }

        if (url.includes('/auth/sinscrire')) {
          send(201, {
            success: true,
            data: {
              token: 'mock-e2e-token',
              user: { id: 2, email: 'test@test.com', role: 'student' }
            }
          })
          return
        }

        if (
          url.includes('/auth/me') ||
          url.includes('/auth/logout') ||
          url.includes('/auth/deconnecter') ||
          url.includes('/auth/mot-de-passe-oublie') ||
          url.includes('/auth/verifier-code') ||
          url.includes('/auth/renvoyer-code') ||
          url.includes('/auth/reinitialiser-mot-de-passe')
        ) {
          send(200, { success: true, data: null })
          return
        }

        if (url.includes('/notifications')) {
          send(200, { success: true, data: [] })
          return
        }

        send(200, { success: true, data: [] })
      })
    }
  }

  return {
    base: '/',
    plugins: [e2eMockApiPlugin, vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        vue: 'vue/dist/vue.esm-bundler.js'
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '/api')
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/uploads/, '/uploads')
        }
      },
      hmr: {
        protocol: hmrProtocol,
        host: hmrHost,
        port: 5173
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: [
        'src/tests/unit/**/*.spec.{js,ts}',
        'src/tests/integration/**/*.spec.{js,ts}'
      ],
      exclude: ['src/tests/e2e/**']
    }
  }
})
