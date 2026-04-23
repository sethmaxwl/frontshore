import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/dom'
import { cleanup, fireEvent, render } from '@testing-library/react'
import type { JSX } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type MockAuthValue = {
  isAuthenticated: boolean
  logout: () => void
  session: {
    admin: boolean
    anon: boolean
    isLoggedIn: boolean
    token: string
    user: string
  }
}

type MockRoom = {
  motd: string
  name: string
  owner: string
  privacy: number
  route: string
  thumbnail: null
  users: number
}

const mockUseAuth = vi.fn<() => MockAuthValue>()
const mockFetchRooms = vi.fn<() => Promise<MockRoom[]>>()

vi.mock('@/app/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api/streamshore', () => ({
  fetchRooms: () => mockFetchRooms(),
}))

import { PrimaryNavigation } from '@/components/navigation/PrimaryNavigation'

function CurrentLocation(): JSX.Element {
  const location = useLocation()

  return <div data-testid="current-location">{location.pathname}</div>
}

function renderNavigation(initialEntries: string[] = ['/']): void {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 0,
        retry: false,
      },
    },
  })

  render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <PrimaryNavigation />
          <CurrentLocation />
        </MantineProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

describe('PrimaryNavigation', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  beforeEach(() => {
    mockFetchRooms.mockResolvedValue([
      {
        motd: 'Queue up your favorite synthwave set.',
        name: 'Blue Current',
        owner: 'streamcaptain',
        privacy: 0,
        route: 'blue-current',
        thumbnail: null,
        users: 42,
      },
      {
        motd: 'Private afterparty.',
        name: 'Hidden Harbor',
        owner: 'captain',
        privacy: 5,
        route: 'hidden-harbor',
        thumbnail: null,
        users: 8,
      },
      {
        motd: 'Late-night watch party.',
        name: 'Watch Current',
        owner: 'nightowl',
        privacy: 0,
        route: 'watch-current',
        thumbnail: null,
        users: 11,
      },
    ])
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
      session: {
        admin: false,
        anon: false,
        isLoggedIn: true,
        token: 'session-token',
        user: 'captain',
      },
    })
  })

  it('replaces discover and search buttons with an integrated room search field', () => {
    renderNavigation()

    expect(
      screen.getByRole('searchbox', { name: 'Search public rooms' }),
    ).toBeInTheDocument()
    const createRoomLink = screen.getByRole('link', { name: 'Create Room' })

    expect(createRoomLink).toHaveAttribute('href', '/create-room')
    expect(createRoomLink).toHaveAttribute('data-variant', 'filled')
    expect(
      screen.queryByRole('link', { name: 'Discover' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Search' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'captain' })).toBeInTheDocument()
  })

  it('shows matching public room results inside the navigation search', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'watch' } })

    expect(
      await screen.findByRole('link', { name: /Watch Current/i }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Hidden Harbor')).not.toBeInTheDocument()
    expect(
      screen.getByText('Press Enter to open the top match.'),
    ).toBeInTheDocument()
  })

  it('opens the top room match when search is submitted', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })
    const searchForm = searchInput.closest('form')

    if (!searchForm) {
      throw new Error('Expected navigation search form to be rendered.')
    }

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'blue' } })
    await screen.findByRole('link', { name: /Blue Current/i })
    fireEvent.submit(searchForm)

    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/blue-current',
    )
  })
})
