import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { InfoCard } from '@/components/layout/InfoCard'

const withMemoryRouter: Decorator = (Story): JSX.Element => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
)

const storyChildren: JSX.Element = (
  <>
    <p>
      The router lives in the app layer, navigation sits in a shared root
      layout, and route-specific content renders through an <code>Outlet</code>.
    </p>
    <p>
      This is a solid starting point for adding loaders, protected routes,
      nested sections, and route-level code splitting later.
    </p>
  </>
)

const meta = {
  title: 'Components/Layout/InfoCard',
  component: InfoCard,
  decorators: [withMemoryRouter],
  args: {
    title: 'What was added',
    to: '/',
    linkLabel: 'Back to home',
    children: storyChildren,
  },
} satisfies Meta<typeof InfoCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
