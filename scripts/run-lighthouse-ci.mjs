import { access } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import process from 'node:process'

import { chromium } from '@playwright/test'

const require = createRequire(import.meta.url)
const lhciCliPath = require.resolve('@lhci/cli/src/cli.js')
const lighthouseArgs = [lhciCliPath, 'autorun', '--config=.lighthouserc.json']

async function resolveChromePath() {
  if (process.env.CHROME_PATH) {
    await access(process.env.CHROME_PATH)
    return process.env.CHROME_PATH
  }

  const chromePath = chromium.executablePath()
  await access(chromePath)
  return chromePath
}

function runLighthouse(chromePath) {
  const child = spawn(process.execPath, lighthouseArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      CHROME_PATH: chromePath,
    },
  })

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 1)
  })
}

try {
  const chromePath = await resolveChromePath()
  runLighthouse(chromePath)
} catch {
  console.error(
    [
      'Unable to find a local Chromium binary for Lighthouse.',
      'Run `yarn playwright:install` to install Playwright Chromium, then retry `yarn perf:lighthouse`.',
    ].join('\n'),
  )
  process.exit(1)
}
