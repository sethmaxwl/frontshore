import { css } from '@compiled/react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

const links = [
  {
    title: 'Home route',
    body: 'The index route renders through the shared root layout so page content stays separate from app chrome.',
    to: '/',
    label: 'View home',
  },
  {
    title: 'Nested route',
    body: 'A second page is already wired so adding sections and route groups has a clear pattern to follow.',
    to: '/about',
    label: 'View about',
  },
  {
    title: 'Not-found route',
    body: 'Unknown URLs now land on a dedicated 404 screen instead of silently breaking the app experience.',
    to: '/missing',
    label: 'View 404',
  },
]

const linkGridStyles = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '1.25rem',
  marginTop: '1.5rem',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
})

const linkCardStyles = css({
  display: 'grid',
  gap: '1rem',
  padding: '1.5rem',
  border: '1px solid var(--color-border)',
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.82)',
  boxShadow: 'var(--shadow-card)',
  '@media (max-width: 640px)': {
    padding: '1.25rem',
  },
})

const linkTitleStyles = css({
  margin: 0,
})

const linkBodyStyles = css({
  margin: 0,
})

const linkStyles = css({
  display: 'inline-flex',
  width: 'fit-content',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.7rem 1rem',
  borderRadius: '999px',
  background: 'var(--color-text-strong)',
  color: 'white',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'transform 160ms ease, box-shadow 160ms ease',
  ':hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.15)',
  },
  ':focus-visible': {
    outline: '3px solid rgba(36, 74, 255, 0.25)',
    outlineOffset: '2px',
  },
})

export function QuickLinks(): JSX.Element {
  return (
    <section css={linkGridStyles} aria-label="Project structure overview">
      {links.map(
        (link): JSX.Element => (
          <article key={link.title} css={linkCardStyles}>
            <h2 css={linkTitleStyles}>{link.title}</h2>
            <p css={linkBodyStyles}>{link.body}</p>
            <Link css={linkStyles} to={link.to}>
              {link.label}
            </Link>
          </article>
        ),
      )}
    </section>
  )
}
