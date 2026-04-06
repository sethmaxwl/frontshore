import type { JSX } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { InfoCard } from '@/components/layout/InfoCard'
import { PageMetadata } from '@/components/metadata/PageMetadata'

export function NotFoundPage(): JSX.Element {
  return (
    <>
      <PageMetadata
        title="Frontshore | Not Found"
        description="The requested Frontshore route does not exist yet. Head back home or use this page as the starting point for a branded 404 experience."
      />
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
    </>
  )
}
