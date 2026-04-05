import { fileURLToPath } from 'node:url'

import compiled from '@compiled/vite-plugin'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    compiled({
      extract: command === 'build',
      importReact: false,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      exclude: [
        'src/assets/**',
        'src/**/*.css',
        'src/**/*.styles.ts',
        'src/**/*.styles.tsx',
        'src/test/**',
      ],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        branches: 45,
        functions: 80,
        lines: 80,
        statements: 75,
      },
    },
  },
}))
