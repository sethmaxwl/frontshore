import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('renders the page shell content and starter links', () => {
    const view: JSX.Element = (
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )
    render(view)

    expect(
      screen.getByRole('heading', {
        name: /a modern react frontend foundation/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /view about/i,
      }),
    ).toHaveAttribute('href', '/about')

    expect(document.title).toBe('Frontshore | Home')
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'Frontshore is a modern React starter with an app shell, shared layout primitives, and a feature-first structure for scalable frontend work.',
    )
  })
})
