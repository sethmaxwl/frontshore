import type { Meta, StoryObj } from '@storybook/react-vite'

import { PrimaryNavigation } from '@/components/navigation/PrimaryNavigation'
import {
  removeStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'
import type { AuthSession } from '@/lib/types/streamshore'

const authenticatedSession: AuthSession = {
  admin: false,
  anon: false,
  isLoggedIn: true,
  token: 'session-token',
  user: 'captain',
}

const meta = {
  title: 'Components/Navigation/PrimaryNavigation',
  component: PrimaryNavigation,
} satisfies Meta<typeof PrimaryNavigation>

export default meta

type Story = StoryObj<typeof meta>

export const Anonymous: Story = {
  loaders: [
    () => {
      removeStoredValue(storageKeys.auth)

      return {}
    },
  ],
}

export const Authenticated: Story = {
  loaders: [
    () => {
      saveStoredValue(storageKeys.auth, authenticatedSession)

      return {}
    },
  ],
}
