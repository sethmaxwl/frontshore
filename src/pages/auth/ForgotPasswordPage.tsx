import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../components/primitives/styles.ts'

import { FormField } from '@/components/forms/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { getApiErrorMessage } from '@/lib/api/client'
import { requestPasswordReset } from '@/lib/api/streamshore'

const schema = z.object({
  email: z.email('Email address is invalid'),
})

type ForgotPasswordValues = z.infer<typeof schema>

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

export default function ForgotPasswordPage(): JSX.Element {
  const form = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async ({ email }: ForgotPasswordValues) =>
      requestPasswordReset(email),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to request password reset'))
    },
    onSuccess: (_, values) => {
      toast.success(`A reset email has been sent to ${values.email}.`)
    },
  })

  return (
    <AuthCard
      description="Enter the email address tied to your Streamshore account and we’ll send a reset link."
      title="Forgot your password?"
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
          error={form.formState.errors.email?.message}
          label="Email address"
        >
          <input css={fieldStyles.input} {...form.register('email')} />
        </FormField>
        <button
          css={[baseButtonStyles, buttonStyles.primary]}
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? 'Sending...' : 'Send reset email'}
        </button>
      </form>
    </AuthCard>
  )
}
