import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = process.env.VITE_BACKEND_URL || env.VITE_BACKEND_URL || 'http://127.0.0.1:3000'

  return {
  base: '/',
  plugins: [vue()],
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
      protocol: 'ws',
      host: 'localhost',
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
