import type { Meta, StoryObj } from '@storybook/react-vite'

import { baseButtonStyles, buttonStyles } from '../primitives/styles.ts'

import { AppShell } from '@/components/layout/AppShell'
import { SurfaceCard } from '@/components/primitives/SurfaceCard'

const meta = {
  title: 'Components/Layout/AppShell',
  component: AppShell,
  args: {
    description:
      'A wide cinematic shell for discovery pages, profile dashboards, and live room control surfaces.',
    eyebrow: 'Storybook preview',
    subtitle: 'Shared shell copy, actions, and layout spacing.',
    title: 'Ocean control center',
  },
} satisfies Meta<typeof AppShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <AppShell
      {...args}
      actions={
        <>
          <button
            css={[baseButtonStyles, buttonStyles.secondary]}
            type="button"
          >
            Secondary action
          </button>
          <button css={[baseButtonStyles, buttonStyles.primary]} type="button">
            Primary action
          </button>
        </>
      }
    >
      <SurfaceCard as="section">
        <p>
          This shell keeps the page header, supporting copy, and action cluster
          consistent while feature modules own the content below.
        </p>
      </SurfaceCard>
    </AppShell>
  ),
}
