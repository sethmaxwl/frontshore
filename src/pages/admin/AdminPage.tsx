import {
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery } from '@tanstack/react-query'
import { zodResolver } from 'mantine-form-zod-resolver'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { getApiErrorMessage } from '@/lib/api/client'
import {
  fetchAdminUsers,
  fetchRooms,
  sendAdminEmail,
} from '@/lib/api/streamshore'
import { sortRoomsByActivity } from '@/lib/utils/rooms'

const emailSchema = z.object({
  body: z.string().trim().min(1, 'Email body is required'),
  subject: z.string().trim().min(1, 'Email subject is required'),
})

type EmailValues = z.infer<typeof emailSchema>

export default function AdminPage(): JSX.Element {
  const navigate = useNavigate()
  const [roomNameFilter, setRoomNameFilter] = useState('')
  const [roomOwnerFilter, setRoomOwnerFilter] = useState('')
  const [userNameFilter, setUserNameFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const deferredRoomNameFilter = useDeferredValue(roomNameFilter)
  const deferredRoomOwnerFilter = useDeferredValue(roomOwnerFilter)
  const deferredUserNameFilter = useDeferredValue(userNameFilter)
  const deferredEmailFilter = useDeferredValue(emailFilter)
  const emailForm = useForm<EmailValues>({
    mode: 'uncontrolled',
    initialValues: { body: '', subject: '' },
    validate: zodResolver(emailSchema),
  })

  const adminQuery = useQuery({
    queryFn: async () => {
      const [rooms, users] = await Promise.all([
        fetchRooms(),
        fetchAdminUsers(),
      ])
      return {
        rooms: rooms.toSorted(sortRoomsByActivity),
        users: users.toSorted((left, right) =>
          left.username.localeCompare(right.username),
        ),
      }
    },
    queryKey: ['admin'],
    retry: 0,
  })

  useEffect(() => {
    if (!adminQuery.isError) {
      return
    }

    notifications.show({
      color: 'red',
      message: 'You do not have permission to access the admin console.',
    })
    void navigate('/')
  }, [adminQuery.isError, navigate])

  const sendEmailMutation = useMutation({
    mutationFn: async (values: EmailValues) =>
      sendAdminEmail({ message: values.body, subject: values.subject }),
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to send email'),
      })
    },
    onSuccess: () => {
      emailForm.reset()
      notifications.show({ color: 'teal', message: 'Admin email sent.' })
    },
  })

  const filteredRooms = useMemo(() => {
    return (adminQuery.data?.rooms ?? []).filter((room) => {
      const matchesName = room.name
        .toUpperCase()
        .includes(deferredRoomNameFilter.trim().toUpperCase())
      const matchesOwner = room.owner
        .toUpperCase()
        .includes(deferredRoomOwnerFilter.trim().toUpperCase())
      return matchesName && matchesOwner
    })
  }, [adminQuery.data?.rooms, deferredRoomNameFilter, deferredRoomOwnerFilter])

  const filteredUsers = useMemo(() => {
    return (adminQuery.data?.users ?? []).filter((user) => {
      const matchesName = user.username
        .toUpperCase()
        .includes(deferredUserNameFilter.trim().toUpperCase())
      const matchesEmail = user.email
        .toUpperCase()
        .includes(deferredEmailFilter.trim().toUpperCase())
      return matchesName && matchesEmail
    })
  }, [adminQuery.data?.users, deferredEmailFilter, deferredUserNameFilter])

  return (
    <>
      <PageMetadata
        description="Filter rooms and users, then send administrative broadcast emails from the Streamshore console."
        title="Streamshore | Admin"
      />
      <PageHero
        eyebrow="Admin console"
        title="Moderate the entire network"
        description="Filter rooms and users, then broadcast administrative emails to the entire network."
      >
        <Tabs defaultValue="rooms">
          <Tabs.List>
            <Tabs.Tab value="rooms">Rooms</Tabs.Tab>
            <Tabs.Tab value="users">Users</Tabs.Tab>
            <Tabs.Tab value="email">Email</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="rooms" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <TextInput
                    aria-label="Filter by room name"
                    onChange={(event) => {
                      const value = event.currentTarget.value
                      startTransition(() => setRoomNameFilter(value))
                    }}
                    placeholder="Filter by room name"
                    value={roomNameFilter}
                  />
                  <TextInput
                    aria-label="Filter by owner"
                    onChange={(event) => {
                      const value = event.currentTarget.value
                      startTransition(() => setRoomOwnerFilter(value))
                    }}
                    placeholder="Filter by owner"
                    value={roomOwnerFilter}
                  />
                </SimpleGrid>
                <Stack gap="sm">
                  {filteredRooms.map((room, index) => (
                    <div key={room.route}>
                      {index > 0 ? <Divider mb="sm" /> : null}
                      <Group
                        justify="space-between"
                        wrap="wrap"
                        gap="sm"
                        align="flex-start"
                      >
                        <Stack gap={2}>
                          <Text fw={700}>{room.name}</Text>
                          <Text c="dimmed" size="sm">
                            {room.owner} •{' '}
                            {room.privacy === 0 ? 'Public' : 'Private'}
                          </Text>
                        </Stack>
                        <Text c="dimmed" size="sm">
                          {room.users} active user{room.users === 1 ? '' : 's'}
                        </Text>
                      </Group>
                    </div>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="users" pt="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  <TextInput
                    aria-label="Filter by username"
                    onChange={(event) => {
                      const value = event.currentTarget.value
                      startTransition(() => setUserNameFilter(value))
                    }}
                    placeholder="Filter by username"
                    value={userNameFilter}
                  />
                  <TextInput
                    aria-label="Filter by email"
                    onChange={(event) => {
                      const value = event.currentTarget.value
                      startTransition(() => setEmailFilter(value))
                    }}
                    placeholder="Filter by email"
                    value={emailFilter}
                  />
                </SimpleGrid>
                <Stack gap="sm">
                  {filteredUsers.map((user, index) => (
                    <div key={user.username}>
                      {index > 0 ? <Divider mb="sm" /> : null}
                      <Group
                        justify="space-between"
                        wrap="wrap"
                        gap="sm"
                        align="flex-start"
                      >
                        <Stack gap={2}>
                          <Text fw={700}>
                            {user.username}
                            {user.room ? ` • Online in ${user.room}` : ''}
                          </Text>
                          <Text c="dimmed" size="sm">
                            {user.email}
                            {user.verify_token ? ' • Unverified' : ''}
                          </Text>
                        </Stack>
                        <Text c="dimmed" size="sm">
                          {user.admin ? 'Admin' : 'User'}
                        </Text>
                      </Group>
                    </div>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="email" pt="md">
            <Paper p="md" radius="md" withBorder>
              <form
                onSubmit={emailForm.onSubmit((values) =>
                  sendEmailMutation.mutate(values),
                )}
              >
                <Stack gap="md">
                  <TextInput
                    label="Subject"
                    {...emailForm.getInputProps('subject')}
                  />
                  <Textarea
                    autosize
                    label="Body"
                    minRows={4}
                    {...emailForm.getInputProps('body')}
                  />
                  <Button loading={sendEmailMutation.isPending} type="submit">
                    Send email
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </PageHero>
    </>
  )
}
