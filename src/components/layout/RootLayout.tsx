import { AppShell } from '@mantine/core'
import type { JSX } from 'react'
import { Outlet } from 'react-router-dom'

import { PrimaryNavigation } from '@/components/navigation/PrimaryNavigation'

export function RootLayout(): JSX.Element {
  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <AppShell.Header>
        <PrimaryNavigation />
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
