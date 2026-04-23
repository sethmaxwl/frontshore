import {
  ActionIcon,
  Box,
  Button,
  Container,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import type { FocusEvent, FormEvent, JSX } from 'react'
import { Link, useMatch, useNavigate, useResolvedPath } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import logoUrl from '@/assets/streamshore-side.svg'
import { roomSearchFocusEventName } from '@/components/navigation/roomSearch'
import { fetchRooms } from '@/lib/api/streamshore'
import type { RoomSummary } from '@/lib/types/streamshore'
import { findMatchingRooms } from '@/lib/utils/rooms'

type NavItem = {
  end?: boolean
  label: string
  primary?: boolean
  to: string
}

const maxVisibleSearchResults = 6

function NavItemButton({ item }: { item: NavItem }): JSX.Element {
  const resolved = useResolvedPath(item.to)
  const match = useMatch({ path: resolved.pathname, end: item.end ?? false })
  let variant: 'filled' | 'light' | 'subtle' = 'subtle'

  if (item.primary) {
    variant = 'filled'
  } else if (match) {
    variant = 'light'
  }

  return (
    <Button
      component={Link}
      to={item.to}
      size="sm"
      variant={variant}
      aria-current={match ? 'page' : undefined}
    >
      {item.label}
    </Button>
  )
}

function SearchResultItem({
  onSelect,
  room,
}: {
  onSelect: () => void
  room: RoomSummary
}): JSX.Element {
  return (
    <UnstyledButton
      component={Link}
      to={`/${room.route}`}
      onClick={onSelect}
      style={{
        borderRadius: '0.5rem',
        display: 'block',
        padding: '0.625rem 0.75rem',
        textDecoration: 'none',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text fw={600} lineClamp={1}>
            {room.name}
          </Text>
          <Text c="dimmed" size="xs" lineClamp={1}>
            Hosted by {room.owner}
          </Text>
        </Stack>
        <Text c="dimmed" size="xs">
          {room.users} {room.users === 1 ? 'user' : 'users'}
        </Text>
      </Group>
    </UnstyledButton>
  )
}

export function PrimaryNavigation(): JSX.Element {
  const navigate = useNavigate()
  const { isAuthenticated, logout, session } = useAuth()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputReference = useRef<HTMLInputElement | null>(null)
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const immediateSearchQuery = searchQuery.trim()

  const navItems: NavItem[] = []

  if (isAuthenticated) {
    navItems.push({ label: 'Create Room', primary: true, to: '/create-room' })
  }

  if (session?.admin) {
    navItems.push({ label: 'Admin', to: '/admin' })
  }

  const roomsQuery = useQuery({
    enabled: immediateSearchQuery.length > 0,
    queryFn: fetchRooms,
    queryKey: ['rooms'],
  })
  const matchingRooms = findMatchingRooms(
    roomsQuery.data ?? [],
    deferredSearchQuery,
  )
  const visibleSearchResults = matchingRooms.slice(0, maxVisibleSearchResults)
  const showSearchResults = isSearchFocused && immediateSearchQuery.length > 0
  let searchResultsContent: JSX.Element

  useEffect(() => {
    function handleFocusRoomSearch(): void {
      searchInputReference.current?.focus()
      searchInputReference.current?.select()
      setIsSearchFocused(true)
    }

    globalThis.window.addEventListener(
      roomSearchFocusEventName,
      handleFocusRoomSearch,
    )

    return () => {
      globalThis.window.removeEventListener(
        roomSearchFocusEventName,
        handleFocusRoomSearch,
      )
    }
  }, [])

  function resetSearch(): void {
    setIsSearchFocused(false)
    setSearchQuery('')
  }

  function handleSearchFocusBoundaryBlur(
    event: FocusEvent<HTMLDivElement>,
  ): void {
    const nextTarget = event.relatedTarget

    if (
      nextTarget instanceof Node &&
      event.currentTarget.contains(nextTarget)
    ) {
      return
    }

    setIsSearchFocused(false)
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const topResult = findMatchingRooms(roomsQuery.data ?? [], searchQuery)[0]

    if (!topResult) {
      return
    }

    resetSearch()
    void navigate(`/${topResult.route}`)
  }

  if (roomsQuery.isPending) {
    searchResultsContent = (
      <Text c="dimmed" size="sm" px="xs" py={6}>
        Searching public rooms...
      </Text>
    )
  } else if (roomsQuery.isError) {
    searchResultsContent = (
      <Text c="red" size="sm" px="xs" py={6}>
        Unable to load rooms right now.
      </Text>
    )
  } else if (visibleSearchResults.length > 0) {
    searchResultsContent = (
      <Stack gap={4}>
        {visibleSearchResults.map((room) => (
          <SearchResultItem
            key={room.route}
            onSelect={resetSearch}
            room={room}
          />
        ))}
        <Text c="dimmed" px="xs" py={6} size="xs">
          Press Enter to open the top match.
        </Text>
      </Stack>
    )
  } else {
    searchResultsContent = (
      <Text c="dimmed" size="sm" px="xs" py={6}>
        No public rooms matched "{immediateSearchQuery}".
      </Text>
    )
  }

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%" wrap="nowrap" gap="md">
        <Link
          to="/"
          aria-label="Streamshore home"
          style={{
            alignItems: 'center',
            display: 'inline-flex',
            minWidth: 0,
            textDecoration: 'none',
          }}
        >
          <img alt="Streamshore" src={logoUrl} height={28} />
        </Link>

        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Box
            onBlurCapture={handleSearchFocusBoundaryBlur}
            onFocusCapture={() => {
              setIsSearchFocused(true)
            }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}
          >
            <form onSubmit={handleSearchSubmit} style={{ minWidth: 0 }}>
              <TextInput
                aria-label="Search public rooms"
                autoComplete="off"
                id="room-search"
                onChange={(event) => {
                  setSearchQuery(event.currentTarget.value)
                }}
                placeholder="Search public rooms"
                ref={searchInputReference}
                size="sm"
                style={{ minWidth: 0 }}
                type="search"
                value={searchQuery}
              />
            </form>

            {showSearchResults ? (
              <Paper
                mt="xs"
                p="xs"
                radius="md"
                shadow="md"
                style={{
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  zIndex: 200,
                }}
                withBorder
              >
                {searchResultsContent}
              </Paper>
            ) : null}
          </Box>

          <Group gap="xs" wrap="nowrap">
            {navItems.map((item) => (
              <NavItemButton key={item.to} item={item} />
            ))}
          </Group>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Tooltip
            label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            withArrow
          >
            <ActionIcon
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
            >
              <span aria-hidden>{isDark ? '☾' : '☀'}</span>
            </ActionIcon>
          </Tooltip>

          {isAuthenticated && session ? (
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <Button variant="default" size="sm">
                  {session.user}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item component={Link} to="/profile">
                  My Profile
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    logout()
                    void navigate('/login')
                  }}
                >
                  Sign Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
              <Button
                component={Link}
                to="/register"
                variant="default"
                size="sm"
              >
                Register
              </Button>
              <Button component={Link} to="/login" size="sm">
                Login
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Container>
  )
}
