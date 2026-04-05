import { css } from '@compiled/react'
import type { JSX } from 'react'

import heroImage from '@/assets/hero.png'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'

const highlights = [
  'App shell and route entrypoints',
  'Feature-focused page organization',
  'Shared styling tokens and aliases',
]

const cardStyles = css({
  display: 'grid',
  gridTemplateColumns: 'minmax(260px, 360px) minmax(0, 1fr)',
  gap: '2rem',
  alignItems: 'center',
  padding: '2rem',
  border: '1px solid var(--color-border)',
  borderRadius: '32px',
  background: 'var(--color-surface)',
  boxShadow: 'var(--shadow-panel)',
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
  },
  '@media (max-width: 640px)': {
    padding: '1.25rem',
  },
})

const visualStyles = css({
  position: 'relative',
  minHeight: '300px',
  '@media (max-width: 900px)': {
    minHeight: '240px',
  },
})

const visualAssetStyles = css({
  position: 'absolute',
  insetInline: 0,
  margin: '0 auto',
  display: 'block',
  maxWidth: '100%',
})

const baseImageStyles = css({
  bottom: 0,
})

const frameworkImageStyles = css({
  top: '72px',
  width: '140px',
  transform:
    'perspective(1800px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.35)',
})

const bundlerImageStyles = css({
  top: '172px',
  width: '86px',
  transform:
    'perspective(1800px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.92)',
})

const copyStyles = css({
  display: 'grid',
  gap: '1.5rem',
})

const leadStyles = css({
  margin: 0,
  fontSize: '1.15rem',
  lineHeight: 1.7,
})

const highlightsStyles = css({
  display: 'grid',
  gap: '0.9rem',
  padding: 0,
  margin: 0,
  listStyle: 'none',
})

const highlightStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  padding: '1rem 1.1rem',
  border: '1px solid var(--color-border)',
  borderRadius: '18px',
  background: 'var(--color-surface-muted)',
  color: 'var(--color-text-strong)',
  ':before': {
    content: '""',
    width: '0.7rem',
    height: '0.7rem',
    borderRadius: '999px',
    background:
      'linear-gradient(135deg, var(--color-accent), var(--color-accent-alt))',
    boxShadow: '0 0 0 0.3rem rgba(36, 74, 255, 0.12)',
    flexShrink: 0,
  },
})

export function HeroCard(): JSX.Element {
  return (
    <section css={cardStyles}>
      <div css={visualStyles}>
        <img
          src={heroImage}
          css={[visualAssetStyles, baseImageStyles]}
          width="170"
          height="179"
          alt=""
        />
        <img
          src={reactLogo}
          css={[visualAssetStyles, frameworkImageStyles]}
          alt="React logo"
        />
        <img
          src={viteLogo}
          css={[visualAssetStyles, bundlerImageStyles]}
          alt="Vite logo"
        />
      </div>
      <div css={copyStyles}>
        <p css={leadStyles}>
          A starter structure that is ready for routing, providers, shared UI,
          and feature work without needing to reorganize the app later.
        </p>
        <ul css={highlightsStyles}>
          {highlights.map(
            (highlight): JSX.Element => (
              <li key={highlight} css={highlightStyles}>
                {highlight}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  )
}
