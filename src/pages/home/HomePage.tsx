import type { JSX } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { HeroCard } from '@/features/home/components/HeroCard'
import { QuickLinks } from '@/features/home/components/QuickLinks'

export function HomePage(): JSX.Element {
  return (
    <>
      <PageMetadata
        title="Frontshore | Home"
        description="Frontshore is a modern React starter with an app shell, shared layout primitives, and a feature-first structure for scalable frontend work."
      />
      <AppShell
        eyebrow="Frontshore starter"
        title="A modern React frontend foundation"
        description="This repo now has the kind of top-level structure teams usually grow into: an app layer, route entrypoints, page folders, feature folders, shared layout, and centralized styles."
      >
        <HeroCard />
        <QuickLinks />
      </AppShell>
    </>
  )
}
