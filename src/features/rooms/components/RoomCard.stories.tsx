import type { Meta, StoryObj } from '@storybook/react-vite'

import { RoomCard } from '@/features/rooms/components/RoomCard'

const meta = {
  title: 'Features/Rooms/RoomCard',
  component: RoomCard,
  args: {
    room: {
      motd: 'Queue up your favorite synthwave set.',
      name: 'Blue Current',
      owner: 'streamcaptain',
      privacy: 0,
      route: 'blue-current',
      thumbnail:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      users: 42,
    },
  },
} satisfies Meta<typeof RoomCard>

export default meta

type Story = StoryObj<typeof meta>

export const PublicRoom: Story = {}

export const FavoriteRoom: Story = {
  args: {
    favoriteRoom: true,
  },
}
