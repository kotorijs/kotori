import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      fluoro: resolve(import.meta.dirname, 'packages/fluoro/src'),
      '@kotori-bot/i18n': resolve(import.meta.dirname, 'packages/i18n/src'),
      '@kotori-bot/tools': resolve(import.meta.dirname, 'packages/tools/src'),
      '@kotori-bot/logger': resolve(import.meta.dirname, 'packages/logger/src'),
      '@kotori-bot/core': resolve(import.meta.dirname, 'packages/core/src'),
      '@kotori-bot/loader': resolve(import.meta.dirname, 'packages/loader/src'),
      'kotori-bot': resolve(import.meta.dirname, 'packages/kotori/src')
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
})
