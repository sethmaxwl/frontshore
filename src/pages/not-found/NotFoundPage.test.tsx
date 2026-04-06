import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from './NotFoundPage'

describe('NotFoundPage', () => {
  it('renders the fallback copy and a link back home', () => {
    const view: JSX.Element = (
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )
    render(view)

    expect(
      screen.getByRole('heading', {
        name: /that route does not exist/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /go home/i,
      }),
    ).toHaveAttribute('href', '/')

    expect(document.title).toBe('Frontshore | Not Found')
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'The requested Frontshore route does not exist yet. Head back home or use this page as the starting point for a branded 404 experience.',
    )
  })
})
