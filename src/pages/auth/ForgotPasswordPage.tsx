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
import { requestPasswordReset } from '@/lib/api/streamshore'

const schema = z.object({
  email: z.email('Email address is invalid'),
})

type ForgotPasswordValues = z.infer<typeof schema>

export default function ForgotPasswordPage(): JSX.Element {
  const form = useForm<ForgotPasswordValues>({
    mode: 'uncontrolled',
    initialValues: { email: '' },
    validate: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: async ({ email }: ForgotPasswordValues) =>
      requestPasswordReset(email),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to request password reset'),
      })
    },
    onSuccess: (_, values) => {
      notifications.show({
        color: 'teal',
        message: `A reset email has been sent to ${values.email}.`,
      })
    },
  })

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Stack gap="xs">
            <Text c="teal" fw={700} size="xs" tt="uppercase">
              Account recovery
            </Text>
            <Title order={1}>Forgot your password?</Title>
            <Text c="dimmed">
              Enter the email tied to your Streamshore account and we&apos;ll
              send a reset link.
            </Text>
          </Stack>

          <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                {...form.getInputProps('email')}
              />
              <Button loading={mutation.isPending} type="submit" fullWidth>
                Send reset email
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  )
}
