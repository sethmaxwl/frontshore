import { css } from '@compiled/react'
import type { JSX } from 'react'
import { Outlet } from 'react-router-dom'

import { PrimaryNavigation } from '@/components/navigation/PrimaryNavigation'

const frameStyles = css({
  minHeight: '100svh',
})

const mainStyles = css({
  margin: '0 auto',
  minHeight: 'calc(100svh - 5rem)',
  width: 'min(1280px, calc(100% - 2rem))',
})

export function RootLayout(): JSX.Element {
  return (
    <div css={frameStyles}>
      <PrimaryNavigation />
      <main css={mainStyles}>
        <Outlet />
      </main>
    </div>
  )
}
