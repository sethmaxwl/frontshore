import { css } from '@compiled/react'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'

import {
  baseButtonStyles,
  buttonStyles,
} from '../../components/primitives/styles.ts'

import notFoundIllustrationUrl from '@/assets/404.svg'
import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'

const shellStyles = css({
  alignItems: 'center',
  display: 'grid',
  gap: '1.5rem',
  justifyItems: 'center',
  paddingBottom: '3rem',
  textAlign: 'center',
})

const imageStyles = css({
  maxWidth: '26rem',
  width: '100%',
})

export default function NotFoundPage(): JSX.Element {
  return (
    <>
      <PageMetadata
        description="The Streamshore room or route you requested could not be found."
        title="Streamshore | Not Found"
      />
      <AppShell
        eyebrow="404"
        title="That room drifted off the map."
        description="The React migration keeps the old deep links, but this one does not point to a room or route we can open."
      >
        <div css={shellStyles}>
          <img
            alt="A floating 404 illustration"
            css={imageStyles}
            src={notFoundIllustrationUrl}
          />
          <Link css={[baseButtonStyles, buttonStyles.primary]} to="/">
            Return to discovery
          </Link>
        </div>
      </AppShell>
    </>
  )
}
