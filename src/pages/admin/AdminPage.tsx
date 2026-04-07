import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../components/primitives/styles.ts'

import { FormField } from '@/components/forms/FormField'
import { AppShell } from '@/components/layout/AppShell'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { SurfaceCard } from '@/components/primitives/SurfaceCard'
import { getApiErrorMessage } from '@/lib/api/client'
import {
  fetchAdminUsers,
  fetchRooms,
  sendAdminEmail,
} from '@/lib/api/streamshore'
import { sortRoomsByActivity } from '@/lib/utils/rooms'

const tabListStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
})

const tabTriggerStyles = css({
  alignItems: 'center',
  appearance: 'none',
  background: 'rgba(8, 17, 30, 0.48)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  fontWeight: 700,
  justifyContent: 'center',
  minHeight: '2.9rem',
  padding: '0.7rem 1rem',
  '&[data-state="active"]': {
    background: 'rgba(34, 211, 238, 0.14)',
    borderColor: 'rgba(34, 211, 238, 0.24)',
    color: 'var(--color-text-strong)',
  },
})

const tabContentStyles = css({
  display: 'grid',
  gap: '1rem',
  marginTop: '1rem',
})

const stackedStyles = css({
  display: 'grid',
  gap: '1rem',
})

const filterGridStyles = css({
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
})

const listItemStyles = css({
  alignItems: 'center',
  borderTop: '1px solid rgba(148, 163, 184, 0.12)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
  paddingTop: '0.9rem',
})

const valueStackStyles = css({
  display: 'grid',
  gap: '0.2rem',
})

const valueTitleStyles = css({
  color: 'var(--color-text-strong)',
  fontWeight: 700,
  margin: 0,
})

const valueMetaStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const formStyles = css({
  display: 'grid',
  gap: '1rem',
})

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
    defaultValues: {
      body: '',
      subject: '',
    },
    resolver: zodResolver(emailSchema),
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

    toast.error('You do not have permission to access the admin console.')
    void navigate('/')
  }, [adminQuery.isError, navigate])

  const sendEmailMutation = useMutation({
    mutationFn: async (values: EmailValues) =>
      sendAdminEmail({ message: values.body, subject: values.subject }),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send email'))
    },
    onSuccess: () => {
      emailForm.reset()
      toast.success('Admin email sent.')
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
      <AppShell
        eyebrow="Admin console"
        title="Moderate the entire network"
        description="The admin surface keeps the old user and room visibility tools intact while leaning on React Query and deferred filter inputs."
      >
        <Tabs.Root defaultValue="rooms">
          <Tabs.List css={tabListStyles}>
            <Tabs.Trigger css={tabTriggerStyles} value="rooms">
              Rooms
            </Tabs.Trigger>
            <Tabs.Trigger css={tabTriggerStyles} value="users">
              Users
            </Tabs.Trigger>
            <Tabs.Trigger css={tabTriggerStyles} value="email">
              Email
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content css={tabContentStyles} value="rooms">
            <SurfaceCard as="section">
              <div css={stackedStyles}>
                <div css={filterGridStyles}>
                  <input
                    css={fieldStyles.input}
                    onChange={(event) => {
                      startTransition(() => {
                        setRoomNameFilter(event.currentTarget.value)
                      })
                    }}
                    placeholder="Filter by room name"
                    value={roomNameFilter}
                  />
                  <input
                    css={fieldStyles.input}
                    onChange={(event) => {
                      startTransition(() => {
                        setRoomOwnerFilter(event.currentTarget.value)
                      })
                    }}
                    placeholder="Filter by owner"
                    value={roomOwnerFilter}
                  />
                </div>
                {filteredRooms.map((room) => (
                  <div key={room.route} css={listItemStyles}>
                    <div css={valueStackStyles}>
                      <p css={valueTitleStyles}>{room.name}</p>
                      <p css={valueMetaStyles}>
                        {room.owner} •{' '}
                        {room.privacy === 0 ? 'Public' : 'Private'}
                      </p>
                    </div>
                    <p css={valueMetaStyles}>
                      {room.users} active user{room.users === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </Tabs.Content>

          <Tabs.Content css={tabContentStyles} value="users">
            <SurfaceCard as="section">
              <div css={stackedStyles}>
                <div css={filterGridStyles}>
                  <input
                    css={fieldStyles.input}
                    onChange={(event) => {
                      startTransition(() => {
                        setUserNameFilter(event.currentTarget.value)
                      })
                    }}
                    placeholder="Filter by username"
                    value={userNameFilter}
                  />
                  <input
                    css={fieldStyles.input}
                    onChange={(event) => {
                      startTransition(() => {
                        setEmailFilter(event.currentTarget.value)
                      })
                    }}
                    placeholder="Filter by email"
                    value={emailFilter}
                  />
                </div>
                {filteredUsers.map((user) => (
                  <div key={user.username} css={listItemStyles}>
                    <div css={valueStackStyles}>
                      <p css={valueTitleStyles}>
                        {user.username}
                        {user.room ? ` • Online in ${user.room}` : ''}
                      </p>
                      <p css={valueMetaStyles}>
                        {user.email}
                        {user.verify_token ? ' • Unverified' : ''}
                      </p>
                    </div>
                    <p css={valueMetaStyles}>{user.admin ? 'Admin' : 'User'}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </Tabs.Content>

          <Tabs.Content css={tabContentStyles} value="email">
            <SurfaceCard as="section">
              <form
                css={formStyles}
                onSubmit={(event) => {
                  void emailForm.handleSubmit((values) => {
                    sendEmailMutation.mutate(values)
                  })(event)
                }}
              >
                <FormField
                  error={emailForm.formState.errors.subject?.message}
                  label="Subject"
                >
                  <input
                    css={fieldStyles.input}
                    {...emailForm.register('subject')}
                  />
                </FormField>
                <FormField
                  error={emailForm.formState.errors.body?.message}
                  label="Body"
                >
                  <textarea
                    css={fieldStyles.textarea}
                    {...emailForm.register('body')}
                  />
                </FormField>
                <button
                  css={[baseButtonStyles, buttonStyles.primary]}
                  disabled={sendEmailMutation.isPending}
                  type="submit"
                >
                  {sendEmailMutation.isPending ? 'Sending...' : 'Send email'}
                </button>
              </form>
            </SurfaceCard>
          </Tabs.Content>
        </Tabs.Root>
      </AppShell>
    </>
  )
}
