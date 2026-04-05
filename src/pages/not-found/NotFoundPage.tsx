import type { JSX } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { InfoCard } from '@/components/layout/InfoCard'

export function NotFoundPage(): JSX.Element {
  return (
    <AppShell
      eyebrow="404"
      title="That route does not exist"
      description="The router is active, but this URL is not mapped to a page yet."
    >
      <InfoCard
        title="Try one of the starter routes"
        to="/"
        linkLabel="Go home"
      >
        <p>
          You can head back to the home page or use this as the spot for a
          branded not-found experience.
        </p>
      </InfoCard>
    </AppShell>
  )
}
