import { Button, Group, Text } from '@mantine/core'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PageHero } from '@/components/layout/PageHero'

const meta = {
  title: 'Components/Layout/PageHero',
  component: PageHero,
  args: {
    eyebrow: 'Control room',
    title: 'Watch together, in sync.',
    description:
      'Discover active rooms, jump back into your favorites, or spin up a new one for your group.',
    subtitle:
      'Synchronized playback, live chat, playlists, and moderation tools in one dense control room.',
    actions: (
      <Group gap="sm">
        <Button variant="default">Search rooms</Button>
        <Button>Launch a room</Button>
      </Group>
    ),
    children: (
      <Text size="sm">
        Shared page shells should keep headings, supporting copy, and actions
        readable in both color schemes.
      </Text>
    ),
  },
} satisfies Meta<typeof PageHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
