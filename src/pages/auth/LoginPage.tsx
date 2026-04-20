import {
  Anchor,
  Button,
  Container,
  PasswordInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from 'mantine-form-zod-resolver'
import type { JSX } from 'react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/app/providers/AuthProvider'
import { getApiErrorMessage } from '@/lib/api/client'
import { createSession } from '@/lib/api/streamshore'

const schema = z.object({
  id: z.string().trim().min(1, 'Username or email is required'),
  password: z.string().trim().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof schema>

export default function LoginPage(): JSX.Element {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showResendPrompt, setShowResendPrompt] = useState(false)
  const form = useForm<LoginValues>({
    mode: 'uncontrolled',
    initialValues: { id: '', password: '' },
    validate: zodResolver(schema),
  })

  const loginMutation = useMutation({
    mutationFn: createSession,
    onError: (error) => {
      const message = getApiErrorMessage(error, 'Unable to log in')
      setShowResendPrompt(message === 'Email address not verified')
      notifications.show({ color: 'red', message })
    },
    onSuccess: (session) => {
      login(session)
      notifications.show({ color: 'teal', message: 'Login successful.' })
      void navigate(
        (location.state as { from?: string } | null)?.from ?? '/profile',
      )
    },
  })

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Title order={1}>Log in</Title>
          <form
            onSubmit={form.onSubmit((values) => loginMutation.mutate(values))}
          >
            <Stack gap="md">
              <TextInput
                label="Username or email"
                {...form.getInputProps('id')}
              />
              <PasswordInput
                label="Password"
                {...form.getInputProps('password')}
              />
              <Button loading={loginMutation.isPending} type="submit" fullWidth>
                Log in
              </Button>
            </Stack>
          </form>

          <Stack gap="xs">
            <Text c="dimmed" size="sm">
              Forgot your password?{' '}
              <Anchor component={Link} to="/forgot-password">
                Reset it here
              </Anchor>
              .
            </Text>
            <Text c="dimmed" size="sm">
              New around here?{' '}
              <Anchor component={Link} to="/register">
                Create an account
              </Anchor>
              .
            </Text>
            {showResendPrompt ? (
              <Text c="dimmed" size="sm">
                Need another verification email?{' '}
                <Anchor component={Link} to="/resend-verification">
                  Resend it
                </Anchor>
                .
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
