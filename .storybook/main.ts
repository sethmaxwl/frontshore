import path from 'node:path'
import { fileURLToPath } from 'node:url'

import compiled from '@compiled/vite-plugin'
import type { StorybookConfig } from '@storybook/react-vite'

const storybookConfigDir = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config, { configType }) => {
    config.resolve ??= {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(storybookConfigDir, '../src'),
    }
    config.plugins = [
      compiled({
        extract: configType === 'PRODUCTION',
        importReact: false,
      }),
      ...(config.plugins ?? []),
    ]

    return config
  },
}

export default config
