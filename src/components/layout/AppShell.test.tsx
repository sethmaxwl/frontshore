import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppShell } from '@/components/layout/AppShell'

describe('AppShell', () => {
  it('renders the page title, description, and main content', () => {
    render(
      <AppShell
        description="Keep synchronized playback, queue tools, and social controls in one place."
        eyebrow="Streamshore"
        subtitle="Live room dashboard"
        title="Current control room"
      >
        <div>Room body content</div>
      </AppShell>,
    )

    expect(
      screen.getByRole('heading', { name: 'Current control room' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Keep synchronized playback, queue tools, and social controls in one place.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Room body content')).toBeInTheDocument()
  })
})
