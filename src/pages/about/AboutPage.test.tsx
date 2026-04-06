import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { AboutPage } from './AboutPage'

describe('AboutPage', () => {
  it('renders the route copy and a link back home', () => {
    const view: JSX.Element = (
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    )
    render(view)

    expect(
      screen.getByRole('heading', {
        name: /react router is now part of the app shell/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /back to home/i,
      }),
    ).toHaveAttribute('href', '/')

    expect(document.title).toBe('Frontshore | About')
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'Learn how Frontshore wires React Router into the app shell with nested routes, shared navigation, and a clean page structure.',
    )
  })
})
