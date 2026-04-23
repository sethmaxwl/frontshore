import { MantineProvider } from '@mantine/core'
import { screen } from '@testing-library/dom'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PageHero } from '@/components/layout/PageHero'

describe('PageHero', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the page title, description, and main content', () => {
    render(
      <MantineProvider>
        <PageHero
          description="Keep synchronized playback, queue tools, and social controls in one place."
          eyebrow="Streamshore"
          subtitle="Live room dashboard"
          title="Current control room"
        >
          <div>Room body content</div>
        </PageHero>
      </MantineProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Current control room' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Keep synchronized playback, queue tools, and social controls in one place.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Streamshore')).toBeInTheDocument()
    expect(screen.getByText('Live room dashboard')).toBeInTheDocument()
    expect(screen.getByText('Room body content')).toBeInTheDocument()
  })

  it('renders action content without requiring optional labels', () => {
    render(
      <MantineProvider>
        <PageHero
          actions={<button type="button">Launch room</button>}
          description="Jump straight into the next session."
          title="Ready room"
        >
          <div>Action-ready content</div>
        </PageHero>
      </MantineProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Ready room' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Launch room' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Streamshore')).not.toBeInTheDocument()
    expect(screen.queryByText('Live room dashboard')).not.toBeInTheDocument()
  })

  it('keeps the required-only layout stable across rerenders', () => {
    const { rerender } = render(
      <MantineProvider>
        <PageHero
          description="Only the baseline page context is available."
          title="Minimal room"
        />
      </MantineProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Minimal room' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Only the baseline page context is available.'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Launch room')).not.toBeInTheDocument()

    rerender(
      <MantineProvider>
        <PageHero
          description="Only the baseline page context is available."
          title="Minimal room"
        />
      </MantineProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Minimal room' }),
    ).toBeInTheDocument()
  })

  it('rerenders optional labels and actions when hero content changes', () => {
    const { rerender } = render(
      <MantineProvider>
        <PageHero
          actions={<button type="button">Open harbor</button>}
          description="Coordinate a quieter watch party."
          eyebrow="Harbor"
          subtitle="Before the stream starts"
          title="Harbor room"
        >
          <div>Harbor body content</div>
        </PageHero>
      </MantineProvider>,
    )

    expect(screen.getByText('Harbor')).toBeInTheDocument()
    expect(screen.getByText('Before the stream starts')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open harbor' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Harbor body content')).toBeInTheDocument()

    rerender(
      <MantineProvider>
        <PageHero
          actions={<button type="button">Open lighthouse</button>}
          description="Coordinate a brighter watch party."
          eyebrow="Lighthouse"
          subtitle="Once the stream is live"
          title="Lighthouse room"
        >
          <div>Lighthouse body content</div>
        </PageHero>
      </MantineProvider>,
    )

    expect(
      screen.getByRole('heading', { name: 'Lighthouse room' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lighthouse')).toBeInTheDocument()
    expect(screen.getByText('Once the stream is live')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open lighthouse' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Lighthouse body content')).toBeInTheDocument()
    expect(screen.queryByText('Harbor room')).not.toBeInTheDocument()
  })
})
