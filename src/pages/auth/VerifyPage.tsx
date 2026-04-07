import { css } from '@compiled/react'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { SurfaceCard } from '@/components/primitives/SurfaceCard'
import { getApiErrorMessage } from '@/lib/api/client'
import { verifyUser } from '@/lib/api/streamshore'

const shellStyles = css({
  display: 'grid',
  minHeight: 'calc(100svh - 8rem)',
  placeItems: 'center',
})

const contentStyles = css({
  display: 'grid',
  gap: '0.75rem',
  textAlign: 'center',
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  margin: 0,
})

const copyStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

export default function VerifyPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParameters] = useSearchParams()
  const token = searchParameters.get('token')
  const user = searchParameters.get('user')

  useEffect(() => {
    if (!token || !user) {
      toast.error('Invalid verification link.')
      void navigate('/login', { replace: true })
      return
    }

    void verifyUser(user, token)
      .then(() => {
        toast.success('Your email has been verified.')
        void navigate('/login', { replace: true })
      })
      .catch((error: unknown) => {
        toast.error(getApiErrorMessage(error, 'Unable to verify email'))
        void navigate('/login', { replace: true })
      })
  }, [navigate, token, user])

  return (
    <div css={shellStyles}>
      <SurfaceCard as="section">
        <div css={contentStyles}>
          <h1 css={titleStyles}>Verifying your email...</h1>
          <p css={copyStyles}>
            We&apos;re confirming the token and sending you back to login.
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}
