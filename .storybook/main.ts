import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/react-vite'

const storybookConfigDir = path.dirname(fileURLToPath(import.meta.url))
const srcDirectory = path.resolve(storybookConfigDir, '../src')

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': srcDirectory,
    }

    return config
  },
}

export default config
