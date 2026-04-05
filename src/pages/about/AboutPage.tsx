import type { JSX } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { InfoCard } from '@/components/layout/InfoCard'

export function AboutPage(): JSX.Element {
  return (
    <AppShell
      eyebrow="Routing ready"
      title="React Router is now part of the app shell"
      description="The repo now uses a browser router with nested routes, a shared layout, and a dedicated place to grow page-level navigation."
    >
      <InfoCard title="What was added" to="/" linkLabel="Back to home">
        <p>
          The router lives in the app layer, navigation sits in a shared root
          layout, and route-specific content renders through an{' '}
          <code>Outlet</code>.
        </p>
        <p>
          This is a solid starting point for adding loaders, protected routes,
          nested sections, and route-level code splitting later.
        </p>
      </InfoCard>
    </AppShell>
  )
}
