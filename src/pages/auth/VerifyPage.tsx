import { Container, Loader, Paper, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/lib/api/client'
import { verifyUser } from '@/lib/api/streamshore'

export default function VerifyPage(): JSX.Element {
  const navigate = useNavigate()
  const [searchParameters] = useSearchParams()
  const token = searchParameters.get('token')
  const user = searchParameters.get('user')

  useEffect(() => {
    if (!token || !user) {
      notifications.show({
        color: 'red',
        message: 'Invalid verification link.',
      })
      void navigate('/login', { replace: true })
      return
    }

    void verifyUser(user, token)
      .then(() => {
        notifications.show({
          color: 'teal',
          message: 'Your email has been verified.',
        })
        void navigate('/login', { replace: true })
      })
      .catch((error: unknown) => {
        notifications.show({
          color: 'red',
          message: getApiErrorMessage(error, 'Unable to verify email'),
        })
        void navigate('/login', { replace: true })
      })
  }, [navigate, token, user])

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" gap="md" ta="center">
          <Loader />
          <Stack gap="xs">
            <Title order={1}>Verifying your email…</Title>
            <Text c="dimmed">
              We&apos;re confirming the token and sending you back to login.
            </Text>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
