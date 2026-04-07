import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
  inlineLinkStyles,
} from '../../components/primitives/styles.ts'

import { FormField } from '@/components/forms/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { getApiErrorMessage } from '@/lib/api/client'
import { registerUser } from '@/lib/api/streamshore'

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/

const schema = z
  .object({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z.string().trim().min(1, 'Username is required'),
    email: z.email('Email address is invalid'),
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

type RegisterValues = z.infer<typeof schema>

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

const footerCopyStyles = css({
  margin: 0,
})

export default function RegisterPage(): JSX.Element {
  const form = useForm<RegisterValues>({
    defaultValues: {
      confirmPassword: '',
      displayName: '',
      email: '',
      password: '',
    },
    resolver: zodResolver(schema),
  })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) =>
      registerUser({
        email: values.email,
        password: values.password,
        username: values.displayName,
      }),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to register'))
    },
    onSuccess: () => {
      toast.success(
        'Registration successful. Check your email for a verification link.',
      )
      form.reset()
    },
  })

  return (
    <AuthCard
      description="Create a Streamshore identity so you can manage rooms, playlists, favorites, and friends."
      footer={
        <p css={footerCopyStyles}>
          Already have an account?{' '}
          <Link css={inlineLinkStyles} to="/login">
            Sign in
          </Link>
          .
        </p>
      }
      title="Create your account"
    >
      <form
        css={formStyles}
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            registerMutation.mutate(values)
          })(event)
        }}
      >
        <FormField
          error={form.formState.errors.email?.message}
          label="Email address"
        >
          <input css={fieldStyles.input} {...form.register('email')} />
        </FormField>
        <FormField
          error={form.formState.errors.displayName?.message}
          label="Username"
        >
          <input css={fieldStyles.input} {...form.register('displayName')} />
        </FormField>
        <FormField
          error={form.formState.errors.password?.message}
          hint="At least 8 characters, with upper, lower, number, and special."
          label="Password"
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
          disabled={registerMutation.isPending}
          type="submit"
        >
          {registerMutation.isPending ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </AuthCard>
  )
}
