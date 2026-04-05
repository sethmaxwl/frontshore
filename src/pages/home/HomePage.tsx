import type { JSX } from 'react'

import { AppShell } from '@/components/layout/AppShell'
import { HeroCard } from '@/features/home/components/HeroCard'
import { QuickLinks } from '@/features/home/components/QuickLinks'

export function HomePage(): JSX.Element {
  return (
    <AppShell
      eyebrow="Frontshore starter"
      title="A modern React frontend foundation"
      description="This repo now has the kind of top-level structure teams usually grow into: an app layer, route entrypoints, page folders, feature folders, shared layout, and centralized styles."
    >
      <HeroCard />
      <QuickLinks />
    </AppShell>
  )
}
