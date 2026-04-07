import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { JSX } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
  inlineLinkStyles,
} from '../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/forms/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { getApiErrorMessage } from '@/lib/api/client'
import { createSession } from '@/lib/api/streamshore'

const schema = z.object({
  id: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().trim().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof schema>

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

const footerCopyStyles = css({
  margin: 0,
})

export default function LoginPage(): JSX.Element {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showResendPrompt, setShowResendPrompt] = useState(false)
  const form = useForm<LoginValues>({
    defaultValues: {
      id: '',
      password: '',
    },
    resolver: zodResolver(schema),
  })

  const loginMutation = useMutation({
    mutationFn: createSession,
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to log in')
      setShowResendPrompt(message === 'Email address not verified')
      toast.error(message)
    },
    onSuccess: (session) => {
      login(session)
      toast.success('Login successful.')
      void navigate(
        (location.state as { from?: string } | null)?.from ?? '/profile',
      )
    },
  })

  return (
    <AuthCard
      description="Jump back into your profile, your playlists, and your live rooms."
      footer={
        <>
          <p css={footerCopyStyles}>
            Forgot your password?{' '}
            <Link css={inlineLinkStyles} to="/forgot-password">
              Reset it here
            </Link>
            .
          </p>
          <p css={footerCopyStyles}>
            New around here?{' '}
            <Link css={inlineLinkStyles} to="/register">
              Create an account
            </Link>
            .
          </p>
          {showResendPrompt ? (
            <p css={footerCopyStyles}>
              Need another verification email?{' '}
              <Link css={inlineLinkStyles} to="/resend-verification">
                Resend it
              </Link>
              .
            </p>
          ) : null}
        </>
      }
      title="Log in"
    >
      <form
        css={formStyles}
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            loginMutation.mutate(values)
          })(event)
        }}
      >
        <FormField
          error={form.formState.errors.id?.message}
          label="Username or email"
        >
          <input css={fieldStyles.input} {...form.register('id')} />
        </FormField>
        <FormField
          error={form.formState.errors.password?.message}
          label="Password"
        >
          <input
            css={fieldStyles.input}
            type="password"
            {...form.register('password')}
          />
        </FormField>
        <button
          css={[baseButtonStyles, buttonStyles.primary]}
          disabled={loginMutation.isPending}
          type="submit"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthCard>
  )
}
