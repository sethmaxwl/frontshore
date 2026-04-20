import {
  Button,
  Container,
  PasswordInput,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import { PageMetadata } from '@/components/metadata/PageMetadata'
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

export default function ResetPasswordPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParameters] = useSearchParams()
  const user = searchParameters.get('user')
  const token = searchParameters.get('token')
  const form = useForm<ResetPasswordValues>({
    mode: 'uncontrolled',
    initialValues: { confirmPassword: '', password: '' },
    validate: zodResolver(schema),
  })

  useEffect(() => {
    if (user && token) {
      return
    }

    notifications.show({ color: 'red', message: 'Invalid reset link.' })
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
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to reset password'),
      })
    },
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        message: 'Your password has been reset.',
      })
      void navigate('/login')
    },
  })

  return (
    <>
      <PageMetadata
        description="Reset your Streamshore password using the secure email token."
        title="Streamshore | Reset Password"
      />
      <Container size="xs" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Stack gap="xs">
              <Text c="teal" fw={700} size="xs" tt="uppercase">
                Choose a new password
              </Text>
              <Title order={1}>Reset password</Title>
              <Text c="dimmed">
                Pick a fresh password so you can get back into your rooms and
                playlists.
              </Text>
            </Stack>

            <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
              <Stack gap="md">
                <PasswordInput
                  description="At least 8 characters, with upper, lower, number, and special."
                  label="New password"
                  {...form.getInputProps('password')}
                />
                <PasswordInput
                  label="Confirm password"
                  {...form.getInputProps('confirmPassword')}
                />
                <Button loading={mutation.isPending} type="submit" fullWidth>
                  Save new password
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </>
  )
}
