import { render, screen } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { QuickLinks } from './QuickLinks'

describe('QuickLinks', () => {
  it('renders the starter route cards with compiled styles', () => {
    const view: JSX.Element = (
      <MemoryRouter>
        <QuickLinks />
      </MemoryRouter>
    )
    render(view)

    const cardGrid = screen.getByRole('region', {
      name: /project structure overview/i,
    })
    const aboutLink = screen.getByRole('link', { name: /view about/i })

    expect(cardGrid).toHaveCompiledCss({
      display: 'grid',
      gap: '1.25rem',
    })
    expect(aboutLink).toHaveCompiledCss('display', 'inline-flex')
  })
})
