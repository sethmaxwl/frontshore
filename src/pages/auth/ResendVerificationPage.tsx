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
import { resendVerification } from '@/lib/api/streamshore'

const schema = z.object({
  id: z.string().trim().min(1, 'Username or email is required'),
})

type ResendVerificationValues = z.infer<typeof schema>

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

export default function ResendVerificationPage(): JSX.Element {
  const form = useForm<ResendVerificationValues>({
    defaultValues: {
      id: '',
    },
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async ({ id }: ResendVerificationValues) =>
      resendVerification(id),
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Unable to resend verification email'),
      )
    },
    onSuccess: () => {
      toast.success('A fresh verification email has been sent.')
    },
  })

  return (
    <AuthCard
      description="If your inbox lost the first email, we can issue another verification link."
      title="Resend verification"
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
          error={form.formState.errors.id?.message}
          label="Username or email"
        >
          <input css={fieldStyles.input} {...form.register('id')} />
        </FormField>
        <button
          css={[baseButtonStyles, buttonStyles.primary]}
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? 'Sending...' : 'Resend email'}
        </button>
      </form>
    </AuthCard>
  )
}
