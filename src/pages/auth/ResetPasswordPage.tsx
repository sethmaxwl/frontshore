import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../components/primitives/styles.ts'

import { FormField } from '@/components/forms/FormField'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { getApiErrorMessage } from '@/lib/api/client'
import { resetPassword } from '@/lib/api/streamshore'

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/

const schema = z
  .object({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    password: z
      .string()
      .regex(
        strongPasswordPattern,
        'Password must include upper, lower, number, special, and 8+ characters',
      ),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordValues = z.infer<typeof schema>

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

export default function ResetPasswordPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParameters] = useSearchParams()
  const user = searchParameters.get('user')
  const token = searchParameters.get('token')
  const form = useForm<ResetPasswordValues>({
    defaultValues: {
      confirmPassword: '',
      password: '',
    },
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (user && token) {
      return
    }

    toast.error('Invalid reset link.')
    void navigate('/login', { replace: true })
  }, [navigate, token, user])

  const mutation = useMutation({
    mutationFn: async ({ password }: ResetPasswordValues) => {
      if (!user || !token) {
        throw new Error('Invalid reset link')
      }

      return resetPassword(user, password, token)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to reset password'))
    },
    onSuccess: () => {
      toast.success('Your password has been reset.')
      void navigate('/login')
    },
  })

  return (
    <>
      <PageMetadata
        description="Reset your Streamshore password using the secure email token."
        title="Streamshore | Reset Password"
      />
      <AuthCard
        description="Pick a fresh password so you can get back into your rooms and playlists."
        title="Reset password"
      >
        <form
          css={formStyles}
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              mutation.mutate(values)
            })(event)
          }}
        >
          <FormField
            error={form.formState.errors.password?.message}
            label="New password"
          >
            <input
              css={fieldStyles.input}
              type="password"
              {...form.register('password')}
            />
          </FormField>
          <FormField
            error={form.formState.errors.confirmPassword?.message}
            label="Confirm password"
          >
            <input
              css={fieldStyles.input}
              type="password"
              {...form.register('confirmPassword')}
            />
          </FormField>
          <button
            css={[baseButtonStyles, buttonStyles.primary]}
            disabled={mutation.isPending}
            type="submit"
          >
            {mutation.isPending ? 'Updating...' : 'Save new password'}
          </button>
        </form>
      </AuthCard>
    </>
  )
}
