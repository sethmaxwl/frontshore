import {
  ActionIcon,
  Button,
  Container,
  Group,
  Menu,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core'
import type { JSX } from 'react'
import { Link, useMatch, useNavigate, useResolvedPath } from 'react-router-dom'

import { useAuth } from '@/app/providers/AuthProvider'
import logoUrl from '@/assets/streamshore-side.svg'

type NavItem = {
  end?: boolean
  label: string
  to: string
}

function NavItemButton({ item }: { item: NavItem }): JSX.Element {
  const resolved = useResolvedPath(item.to)
  const match = useMatch({ path: resolved.pathname, end: item.end ?? false })

  return (
    <Button
      component={Link}
      to={item.to}
      size="sm"
      variant={match ? 'light' : 'subtle'}
      aria-current={match ? 'page' : undefined}
    >
      {item.label}
    </Button>
  )
}

export function PrimaryNavigation(): JSX.Element {
  const navigate = useNavigate()
  const { isAuthenticated, logout, session } = useAuth()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  const navItems: NavItem[] = [
    { end: true, label: 'Discover', to: '/' },
    { label: 'Search', to: '/search' },
  ]

  if (isAuthenticated) {
    navItems.push(
      { label: 'Create Room', to: '/create-room' },
      { label: 'Profile', to: '/profile' },
    )
  }

  if (session?.admin) {
    navItems.push({ label: 'Admin', to: '/admin' })
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

        <Group gap="xs" wrap="wrap">
          {navItems.map((item) => (
            <NavItemButton key={item.to} item={item} />
          ))}
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
                  Open profile
                </Menu.Item>
                <Menu.Item component={Link} to="/create-room">
                  Create a room
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    logout()
                    void navigate('/login')
                  }}
                >
                  Sign out
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
