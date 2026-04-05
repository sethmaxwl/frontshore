import type { Preview } from '@storybook/react-vite'
import { createElement } from 'react'

import { AppProviders } from '@/app/providers/AppProviders'

const preview: Preview = {
  decorators: [
    (Story) => createElement(AppProviders, null, createElement(Story)),
  ],
  parameters: {
    a11y: {
      element: '#storybook-root',
    },
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
