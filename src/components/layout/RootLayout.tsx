import { css } from '@compiled/react'
import type { JSX } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
]

const frameStyles = css({
  minHeight: '100svh',
})

const navStyles = css({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backdropFilter: 'blur(18px)',
  background: 'rgba(244, 247, 251, 0.78)',
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
})

const navInnerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  width: 'min(1100px, calc(100% - 2rem))',
  margin: '0 auto',
  padding: '1rem 0',
  '@media (max-width: 640px)': {
    flexDirection: 'column',
  },
})

const brandStyles = css({
  color: 'var(--color-text-strong)',
  fontWeight: 800,
  letterSpacing: '-0.04em',
  textDecoration: 'none',
})

const navLinksStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  '@media (max-width: 640px)': {
    flexDirection: 'column',
  },
})

const navLinkStyles = css({
  padding: '0.55rem 0.9rem',
  borderRadius: '999px',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
  transition: 'background 160ms ease, color 160ms ease',
  ':hover': {
    background: 'rgba(15, 23, 42, 0.08)',
    color: 'var(--color-text-strong)',
  },
  '&[aria-current="page"]': {
    background: 'rgba(15, 23, 42, 0.08)',
    color: 'var(--color-text-strong)',
  },
})

export function RootLayout(): JSX.Element {
  return (
    <div css={frameStyles}>
      <nav css={navStyles} aria-label="Primary">
        <div css={navInnerStyles}>
          <NavLink to="/" end css={brandStyles}>
            Frontshore
          </NavLink>
          <div css={navLinksStyles}>
            {navigationItems.map(
              (item): JSX.Element => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  css={navLinkStyles}
                >
                  {item.label}
                </NavLink>
              ),
            )}
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
