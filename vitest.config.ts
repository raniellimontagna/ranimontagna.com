import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  css: {
    postcss: {},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/tests/**',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/head.tsx',
        'src/app/**/loading.tsx',
        'src/app/**/error.tsx',
        'src/app/**/not-found.tsx',
        'src/**/*.types.ts',
        'src/**/index.ts',
        'src/proxy.ts', // Next.js middleware, no testable logic
        'src/middleware.ts', // Next.js middleware
      ],
      thresholds: {
        statements: 86,
        branches: 78,
        functions: 86,
        lines: 87,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
