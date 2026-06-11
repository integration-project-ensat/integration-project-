import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.svg'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
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
})
