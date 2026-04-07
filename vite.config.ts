import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'

import compiled from '@compiled/vite-plugin'
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { browserCheckRooms } from './tests/fixtures/browserChecks.ts'

const srcDirectory = fileURLToPath(new URL('src', import.meta.url))
const browserChecksFixturesEnabled =
  process.env.VITE_BROWSER_CHECKS_FIXTURES === '1'

type NextMiddleware = (error?: Error) => void

function handleBrowserChecksApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
  next: NextMiddleware,
): void {
  if (!request.url) {
    next()
    return
  }

  const pathname = new URL(request.url, 'http://127.0.0.1').pathname

  if (request.method === 'GET' && pathname === '/api/rooms') {
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify(browserCheckRooms))
    return
  }

  next()
}

function createBrowserChecksApiPlugin() {
  return {
    name: 'browser-check-fixtures',
    configurePreviewServer(server: {
      middlewares: {
        use: (
          handler: (
            request: IncomingMessage,
            response: ServerResponse,
            next: NextMiddleware,
          ) => void,
        ) => void
      }
    }) {
      server.middlewares.use(handleBrowserChecksApiRequest)
    },
    configureServer(server: {
      middlewares: {
        use: (
          handler: (
            request: IncomingMessage,
            response: ServerResponse,
            next: NextMiddleware,
          ) => void,
        ) => void
      }
    }) {
      server.middlewares.use(handleBrowserChecksApiRequest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    compiled({
      extract: false,
      importReact: false,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    ...(browserChecksFixturesEnabled ? [createBrowserChecksApiPlugin()] : []),
  ],
  resolve: {
    alias: {
      '@': srcDirectory,
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
})
