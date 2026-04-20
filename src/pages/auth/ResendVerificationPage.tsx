import {
  Button,
  Container,
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
import { z } from 'zod'

import { getApiErrorMessage } from '@/lib/api/client'
import { resendVerification } from '@/lib/api/streamshore'

const schema = z.object({
  id: z.string().trim().min(1, 'Username or email is required'),
})

type ResendVerificationValues = z.infer<typeof schema>

export default function ResendVerificationPage(): JSX.Element {
  const form = useForm<ResendVerificationValues>({
    mode: 'uncontrolled',
    initialValues: { id: '' },
    validate: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async ({ id }: ResendVerificationValues) =>
      resendVerification(id),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(
          error,
          'Unable to resend verification email',
        ),
      })
    },
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        message: 'A fresh verification email has been sent.',
      })
    },
  })

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text c="teal" fw={700} size="xs" tt="uppercase">
              Verification help
            </Text>
            <Title order={1}>Resend verification</Title>
            <Text c="dimmed">
              If your inbox lost the first email, we can issue another
              verification link.
            </Text>
          </Stack>

          <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack gap="md">
              <TextInput
                label="Username or email"
                {...form.getInputProps('id')}
              />
              <Button loading={mutation.isPending} type="submit" fullWidth>
                Resend email
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
