import { css } from '@compiled/react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { JSX } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import {
  baseButtonStyles,
  buttonStyles,
  iconButtonStyles,
} from '../primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { useTheme } from '@/app/providers/ThemeProvider'
import logoUrl from '@/assets/streamshore-side.svg'

const navStyles = css({
  backdropFilter: 'blur(18px)',
  background: 'rgba(2, 10, 24, 0.72)',
  borderBottom: '1px solid var(--color-border)',
  position: 'sticky',
  top: 0,
  zIndex: 20,
})

const innerStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '1rem',
  justifyContent: 'space-between',
  margin: '0 auto',
  padding: '0.9rem 0',
  width: 'min(1280px, calc(100% - 2rem))',
  '@media (max-width: 860px)': {
    flexWrap: 'wrap',
  },
})

const brandStyles = css({
  alignItems: 'center',
  display: 'inline-flex',
  gap: '0.85rem',
  minWidth: 0,
  textDecoration: 'none',
})

const logoStyles = css({
  display: 'block',
  height: '2rem',
  width: 'auto',
})

const brandTextStyles = css({
  color: 'var(--color-text-muted)',
  display: 'grid',
  gap: '0.1rem',
})

const brandLabelStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1rem',
  fontWeight: 800,
})

const navLinksStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
})

const navLinkStyles = css({
  borderRadius: '999px',
  color: 'var(--color-text-muted)',
  padding: '0.65rem 0.95rem',
  textDecoration: 'none',
  transition: 'background 180ms ease, color 180ms ease',
  '&[aria-current="page"]': {
    background: 'rgba(34, 211, 238, 0.14)',
    color: 'var(--color-text-strong)',
  },
  ':hover': {
    background: 'rgba(125, 211, 252, 0.1)',
    color: 'var(--color-text-strong)',
  },
})

const actionRowStyles = css({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.65rem',
})

const dropdownContentStyles = css({
  background: 'rgba(5, 15, 28, 0.95)',
  border: '1px solid var(--color-border)',
  borderRadius: '18px',
  boxShadow: 'var(--shadow-panel)',
  minWidth: '14rem',
  padding: '0.45rem',
  zIndex: 30,
})

const dropdownItemStyles = css({
  alignItems: 'center',
  borderRadius: '14px',
  color: 'var(--color-text-strong)',
  cursor: 'pointer',
  display: 'flex',
  fontSize: '0.95rem',
  outline: 'none',
  padding: '0.7rem 0.85rem',
  textDecoration: 'none',
  ':focus-visible': {
    background: 'rgba(34, 211, 238, 0.14)',
  },
})

const triggerStyles = css({
  minWidth: '8.75rem',
})

const themeLabelStyles = css({
  fontSize: '1.1rem',
  lineHeight: 1,
})

const visuallyHiddenStyles = css({
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
})

const tooltipContentStyles = css({
  background: 'rgba(5, 15, 28, 0.96)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  boxShadow: 'var(--shadow-soft)',
  color: 'var(--color-text-strong)',
  fontSize: '0.82rem',
  fontWeight: 700,
  padding: '0.5rem 0.75rem',
  zIndex: 35,
})

const navigationItems = [
  { end: true, label: 'Discover', to: '/' },
  { label: 'Search', to: '/search?q=stream' },
]

export function PrimaryNavigation(): JSX.Element {
  const navigate = useNavigate()
  const { isAuthenticated, logout, session } = useAuth()
  const { isDarkTheme, toggleTheme } = useTheme()

  return (
    <nav css={navStyles} aria-label="Primary">
      <div css={innerStyles}>
        <Link css={brandStyles} to="/">
          <img
            alt="Streamshore"
            css={logoStyles}
            height="32"
            src={logoUrl}
            width="178"
          />
          <span css={brandTextStyles}>
            <span css={brandLabelStyles}>Realtime room watching</span>
            <span>Fresh React migration with the legacy Streamshore API</span>
          </span>
        </Link>

        <div css={navLinksStyles}>
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              css={navLinkStyles}
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <NavLink css={navLinkStyles} to="/create-room">
                Create Room
              </NavLink>
              <NavLink css={navLinkStyles} to="/profile">
                Profile
              </NavLink>
            </>
          ) : null}
          {session?.admin ? (
            <NavLink css={navLinkStyles} to="/admin">
              Admin
            </NavLink>
          ) : null}
        </div>

        <div css={actionRowStyles}>
          <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  css={iconButtonStyles}
                  onClick={toggleTheme}
                  type="button"
                >
                  <span css={themeLabelStyles} aria-hidden="true">
                    {isDarkTheme ? '☾' : '☀'}
                  </span>
                  <span css={visuallyHiddenStyles}>
                    Switch to {isDarkTheme ? 'light' : 'dark'} theme
                  </span>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  css={tooltipContentStyles}
                  side="bottom"
                  sideOffset={8}
                >
                  Switch to {isDarkTheme ? 'light' : 'dark'} theme
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>

          {isAuthenticated && session ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  css={[
                    baseButtonStyles,
                    buttonStyles.secondary,
                    triggerStyles,
                  ]}
                  type="button"
                >
                  {session.user}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  css={dropdownContentStyles}
                  sideOffset={10}
                >
                  <DropdownMenu.Item asChild>
                    <Link css={dropdownItemStyles} to="/profile">
                      Open profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link css={dropdownItemStyles} to="/create-room">
                      Create a room
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    css={dropdownItemStyles}
                    onSelect={() => {
                      logout()
                      void navigate('/login')
                    }}
                  >
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <>
              <Link
                css={[baseButtonStyles, buttonStyles.secondary]}
                to="/register"
              >
                Register
              </Link>
              <Link css={[baseButtonStyles, buttonStyles.primary]} to="/login">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
