import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/dom'
import {
  act,
  cleanup,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
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
  } | null
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
const mockLogout = vi.fn()

function throwUninitializedDeferredRooms(): never {
  throw new Error('Expected deferred rooms promise to initialize.')
}

function createDeferredRooms(): {
  promise: Promise<MockRoom[]>
  resolveRooms: (rooms: MockRoom[]) => void
} {
  let resolveRooms: (rooms: MockRoom[]) => void =
    throwUninitializedDeferredRooms
  const promise = new Promise<MockRoom[]>((resolve) => {
    resolveRooms = resolve
  })

  return { promise, resolveRooms }
}

vi.mock('@/app/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/api/streamshore', () => ({
  fetchRooms: () => mockFetchRooms(),
}))

import { PrimaryNavigation } from '@/components/navigation/PrimaryNavigation'
import { dispatchRoomSearchFocus } from '@/components/navigation/roomSearch'

function CurrentLocation(): JSX.Element {
  const location = useLocation()

  return <div data-testid="current-location">{location.pathname}</div>
}

function renderNavigation(
  initialEntries: string[] = ['/'],
  options: { forceColorScheme?: 'light' | 'dark' } = {},
): void {
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
        <MantineProvider forceColorScheme={options.forceColorScheme}>
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
    globalThis.window.localStorage.clear()
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
      {
        motd: 'A tiny room for careful listening.',
        name: 'Solo Current',
        owner: 'minimalist',
        privacy: 0,
        route: 'solo-current',
        thumbnail: null,
        users: 1,
      },
    ])
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
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

  it('shows register and login links for signed-out visitors', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      logout: mockLogout,
      session: null,
    })

    renderNavigation()

    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.queryByRole('link', { name: 'Create Room' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'captain' }),
    ).not.toBeInTheDocument()
  })

  it('marks the admin navigation item active for admin sessions', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      session: {
        admin: true,
        anon: false,
        isLoggedIn: true,
        token: 'session-token',
        user: 'captain',
      },
    })

    renderNavigation(['/admin'])

    const adminLink = screen.getByRole('link', { name: 'Admin' })

    expect(adminLink).toHaveAttribute('href', '/admin')
    expect(adminLink).toHaveAttribute('aria-current', 'page')
    expect(adminLink).toHaveAttribute('data-variant', 'light')
  })

  it('shows the admin navigation item as subtle away from the admin route', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
      session: {
        admin: true,
        anon: false,
        isLoggedIn: true,
        token: 'session-token',
        user: 'captain',
      },
    })

    renderNavigation(['/profile'])

    const adminLink = screen.getByRole('link', { name: 'Admin' })

    expect(adminLink).not.toHaveAttribute('aria-current')
    expect(adminLink).toHaveAttribute('data-variant', 'subtle')
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
    expect(screen.getByText('Hosted by nightowl')).toBeInTheDocument()
    expect(screen.getByText('11 users')).toBeInTheDocument()
    expect(screen.queryByText('Hidden Harbor')).not.toBeInTheDocument()
    expect(
      screen.getByText('Press Enter to open the top match.'),
    ).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'watch ' } })

    await waitFor(() => {
      expect(screen.getByText('Hosted by nightowl')).toBeInTheDocument()
    })
  })

  it('shows a pending search state while public rooms load', async () => {
    const { promise, resolveRooms } = createDeferredRooms()

    mockFetchRooms.mockReturnValue(promise)
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'blue' } })

    expect(
      await screen.findByText('Searching public rooms...'),
    ).toBeInTheDocument()

    await act(async () => {
      resolveRooms([])
      await Promise.resolve()
    })
  })

  it('focuses the room search when the global search event is dispatched', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.change(searchInput, { target: { value: 'solo' } })
    expect(
      screen.queryByText('Press Enter to open the top match.'),
    ).not.toBeInTheDocument()

    act(() => {
      dispatchRoomSearchFocus()
    })

    expect(searchInput).toHaveFocus()
    expect(
      await screen.findByRole('link', { name: /Solo Current/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('1 user')).toBeInTheDocument()
  })

  it('keeps search results open when focus moves into a result', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'blue' } })

    const resultLink = await screen.findByRole('link', {
      name: /Blue Current/i,
    })

    fireEvent.blur(searchInput, { relatedTarget: resultLink })

    expect(resultLink).toBeInTheDocument()
  })

  it('closes search results when focus leaves the search boundary', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'blue' } })

    expect(
      await screen.findByRole('link', { name: /Blue Current/i }),
    ).toBeInTheDocument()

    fireEvent.blur(searchInput, { relatedTarget: document.body })

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: /Blue Current/i }),
      ).not.toBeInTheDocument()
    })
  })

  it('resets the search field when a result is selected', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'watch' } })
    fireEvent.click(await screen.findByRole('link', { name: /Watch Current/i }))

    expect(searchInput).toHaveValue('')
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/watch-current',
    )
  })

  it('shows an empty search state and ignores submit when there is no match', async () => {
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })
    const searchForm = searchInput.closest('form')

    if (!searchForm) {
      throw new Error('Expected navigation search form to be rendered.')
    }

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'zzzz' } })

    expect(
      await screen.findByText('No public rooms matched "zzzz".'),
    ).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'zzzz ' } })

    await waitFor(() => {
      expect(
        screen.getByText('No public rooms matched "zzzz".'),
      ).toBeInTheDocument()
    })

    fireEvent.submit(searchForm)

    expect(screen.getByTestId('current-location')).toHaveTextContent('/')
  })

  it('shows an error state when room search cannot load rooms', async () => {
    mockFetchRooms.mockRejectedValue(new Error('Network unavailable'))
    renderNavigation()

    const searchInput = screen.getByRole('searchbox', {
      name: 'Search public rooms',
    })

    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'blue' } })

    expect(
      await screen.findByText('Unable to load rooms right now.'),
    ).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'blue ' } })

    await waitFor(() => {
      expect(
        screen.getByText('Unable to load rooms right now.'),
      ).toBeInTheDocument()
    })
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

  it('signs authenticated users out from the account menu', async () => {
    renderNavigation()

    fireEvent.click(screen.getByRole('button', { name: 'captain' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Sign Out' }))

    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('current-location')).toHaveTextContent('/login')
  })

  it('toggles the theme action into dark mode', async () => {
    renderNavigation()

    const themeButton = screen.getByRole('button', {
      name: 'Switch to dark theme',
    })

    fireEvent.click(themeButton)

    expect(
      await screen.findByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })

  it('labels the theme action for dark mode when the provider starts dark', () => {
    renderNavigation(['/'], { forceColorScheme: 'dark' })

    expect(
      screen.getByRole('button', { name: 'Switch to light theme' }),
    ).toBeInTheDocument()
  })
})
