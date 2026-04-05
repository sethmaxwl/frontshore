import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HomePage } from '@/pages/home/HomePage'

describe('HomePage', () => {
  it('renders the page shell content and starter links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

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
  })
})
