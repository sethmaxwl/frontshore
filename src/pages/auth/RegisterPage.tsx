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
import { Link } from 'react-router-dom'
import { z } from 'zod'

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

export default function RegisterPage(): JSX.Element {
  const form = useForm<RegisterValues>({
    mode: 'uncontrolled',
    initialValues: {
      confirmPassword: '',
      displayName: '',
      email: '',
      password: '',
    },
    validate: zodResolver(schema),
  })

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) =>
      registerUser({
        email: values.email,
        password: values.password,
        username: values.displayName,
      }),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to register'),
      })
    },
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        message:
          'Registration successful. Check your email for a verification link.',
      })
      form.reset()
    },
  })

  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="lg">
          <Title order={1}>Create your account</Title>
          <form
            onSubmit={form.onSubmit((values) =>
              registerMutation.mutate(values),
            )}
          >
            <Stack gap="md">
              <TextInput
                label="Email address"
                {...form.getInputProps('email')}
              />
              <TextInput
                label="Username"
                {...form.getInputProps('displayName')}
              />
              <PasswordInput
                description="At least 8 characters, with upper, lower, number, and special."
                label="Password"
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label="Confirm password"
                {...form.getInputProps('confirmPassword')}
              />
              <Button
                loading={registerMutation.isPending}
                type="submit"
                fullWidth
              >
                Register
              </Button>
            </Stack>
          </form>

          <Text c="dimmed" size="sm">
            Already have an account?{' '}
            <Anchor component={Link} to="/login">
              Sign in
            </Anchor>
            .
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}
