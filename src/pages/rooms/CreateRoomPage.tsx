import {
  Button,
  Card,
  Group,
  List,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Stepper,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useAuth } from '@/app/providers/AuthProvider'
import { PageHero } from '@/components/layout/PageHero'
import { PageMetadata } from '@/components/metadata/PageMetadata'
import { getApiErrorMessage } from '@/lib/api/client'
import { createRoom } from '@/lib/api/streamshore'
import { slugifyRoomName } from '@/lib/utils/rooms'

const reservedRoutes = new Set([
  '404',
  'admin',
  'create-room',
  'forgot-password',
  'login',
  'profile',
  'register',
  'resend-verification',
  'reset',
  'search',
  'verify',
])

const createRoomSchema = z.object({
  anonymousChatting: z.boolean(),
  anonymousQueueAdd: z.boolean(),
  chatFilter: z.boolean(),
  chatLevel: z.boolean(),
  maxInQueue: z.number().int().min(0, 'Queue limit must be 0 or more'),
  queueLevel: z.boolean(),
  queueVoting: z.boolean(),
  roomMOTD: z.string(),
  roomName: z
    .string()
    .trim()
    .min(1, 'Room name is required')
    .refine((value) => !reservedRoutes.has(slugifyRoomName(value)), {
      message: 'That room slug collides with an existing route',
    }),
  roomType: z.enum(['Public', 'Private']),
  voteThreshold: z.number().int().min(1).max(100),
})

type CreateRoomValues = z.infer<typeof createRoomSchema>

export default function CreateRoomPage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [step, setStep] = useState(0)
  const form = useForm<CreateRoomValues>({
    mode: 'controlled',
    initialValues: {
      anonymousChatting: true,
      anonymousQueueAdd: true,
      chatFilter: false,
      chatLevel: false,
      maxInQueue: 25,
      queueLevel: false,
      queueVoting: true,
      roomMOTD: '',
      roomName: '',
      roomType: 'Public',
      voteThreshold: 50,
    },
    validate: zodResolver(createRoomSchema),
  })

  const values = form.getValues()

  const createRoomMutation = useMutation({
    mutationFn: async (submittedValues: CreateRoomValues) => {
      if (!session?.user) {
        throw new Error('You must be logged in to create a room')
      }

      return createRoom({
        anon_chat: Number(submittedValues.anonymousChatting),
        anon_queue: Number(submittedValues.anonymousQueueAdd),
        chat_filter: Number(submittedValues.chatFilter),
        chat_level: submittedValues.chatLevel ? 50 : 10,
        motd: submittedValues.roomMOTD,
        name: submittedValues.roomName,
        owner: session.user,
        privacy: submittedValues.roomType === 'Private' ? 1 : 0,
        queue_level: submittedValues.queueLevel ? 50 : 10,
        queue_limit: submittedValues.maxInQueue,
        vote_enable: Number(submittedValues.queueVoting),
        vote_threshold: submittedValues.voteThreshold,
      })
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error, 'Unable to create room'),
      })
    },
    onSuccess: (room) => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      notifications.show({
        color: 'teal',
        message: 'Room created successfully.',
      })
      void navigate(`/${room.route}`)
    },
  })

  const summary = useMemo(
    () => [
      `Room name: ${values.roomName || 'Untitled'}`,
      `Welcome message: ${values.roomMOTD || 'None provided'}`,
      `Visibility: ${values.roomType}`,
      values.anonymousChatting
        ? 'Anonymous chat is enabled'
        : 'Only elevated users can chat',
      values.chatFilter
        ? 'Safe chat filter enabled'
        : 'Safe chat filter disabled',
      values.anonymousQueueAdd
        ? 'Anonymous queue submissions enabled'
        : 'Only elevated users can add to queue',
      values.queueVoting ? 'Vote-to-skip enabled' : 'Vote-to-skip disabled',
      `Vote threshold: ${values.voteThreshold}%`,
      `Queue limit: ${values.maxInQueue} videos`,
    ],
    [values],
  )

  function handleNext(): void {
    let fields: Array<keyof CreateRoomValues>
    if (step === 0) {
      fields = ['roomName', 'roomMOTD', 'roomType']
    } else if (step === 1) {
      fields = ['anonymousChatting', 'chatFilter', 'chatLevel']
    } else {
      fields = [
        'anonymousQueueAdd',
        'maxInQueue',
        'queueLevel',
        'queueVoting',
        'voteThreshold',
      ]
    }

    const hasError = fields.some((field) => form.validateField(field).hasError)
    if (!hasError) {
      setStep((current) => current + 1)
    }
  }

  return (
    <>
      <PageMetadata
        description="Create a new synchronized Streamshore room with queue, chat, and moderation settings."
        title="Streamshore | Create Room"
      />
      <PageHero
        eyebrow="Room creation"
        title="Launch a new room"
        description="Configure the name, chat policy, and queue rules for your new room in a few guided steps."
      >
        <form
          onSubmit={form.onSubmit((submittedValues) => {
            createRoomMutation.mutate(submittedValues)
          })}
        >
          <Paper p="xl" radius="md" withBorder>
            <Stepper
              active={step}
              onStepClick={setStep}
              allowNextStepsSelect={false}
            >
              <Stepper.Step
                label="Basic details"
                description="Name and visibility"
              >
                <Stack gap="md" mt="lg">
                  <TextInput
                    description="This becomes the final room route slug."
                    label="Room name"
                    {...form.getInputProps('roomName')}
                  />
                  <Textarea
                    label="Welcome message"
                    autosize
                    minRows={3}
                    {...form.getInputProps('roomMOTD')}
                  />
                  <Stack gap="xs">
                    <Text fw={600} size="sm">
                      Room type
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {(['Public', 'Private'] as const).map((roomType) => {
                        const active = values.roomType === roomType
                        return (
                          <UnstyledButton
                            key={roomType}
                            onClick={() =>
                              form.setFieldValue('roomType', roomType)
                            }
                          >
                            <Card
                              padding="md"
                              radius="md"
                              withBorder
                              style={{
                                borderColor: active
                                  ? 'var(--mantine-color-teal-5)'
                                  : undefined,
                                boxShadow: active
                                  ? '0 0 0 3px var(--mantine-color-teal-light)'
                                  : undefined,
                              }}
                            >
                              <Stack gap={4}>
                                <Text fw={700}>{roomType} room</Text>
                                <Text c="dimmed" size="sm">
                                  {roomType === 'Public'
                                    ? 'Visible on the landing page for anyone to join.'
                                    : 'Only accessible through friends or direct links.'}
                                </Text>
                              </Stack>
                            </Card>
                          </UnstyledButton>
                        )
                      })}
                    </SimpleGrid>
                  </Stack>
                </Stack>
              </Stepper.Step>

              <Stepper.Step
                label="Chat options"
                description="Permissions and filter"
              >
                <Stack gap="md" mt="lg">
                  <Switch
                    label="Allow anonymous chat participation"
                    checked={values.anonymousChatting}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setFieldValue('anonymousChatting', checked)
                      if (checked) {
                        form.setFieldValue('chatLevel', false)
                      }
                    }}
                  />
                  <Switch
                    label="Restrict chat to room managers"
                    checked={values.chatLevel}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setFieldValue('chatLevel', checked)
                      if (checked) {
                        form.setFieldValue('anonymousChatting', false)
                      }
                    }}
                  />
                  <Switch
                    label="Enable the safe chat filter"
                    checked={values.chatFilter}
                    onChange={(event) => {
                      form.setFieldValue(
                        'chatFilter',
                        event.currentTarget.checked,
                      )
                    }}
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Step
                label="Queue options"
                description="Submissions and voting"
              >
                <Stack gap="md" mt="lg">
                  <Switch
                    label="Allow anonymous queue submissions"
                    checked={values.anonymousQueueAdd}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setFieldValue('anonymousQueueAdd', checked)
                      if (checked) {
                        form.setFieldValue('queueLevel', false)
                      }
                    }}
                  />
                  <Switch
                    label="Restrict queue submissions to managers"
                    checked={values.queueLevel}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setFieldValue('queueLevel', checked)
                      if (checked) {
                        form.setFieldValue('anonymousQueueAdd', false)
                      }
                    }}
                  />
                  <Switch
                    label="Enable vote-to-skip"
                    checked={values.queueVoting}
                    onChange={(event) => {
                      form.setFieldValue(
                        'queueVoting',
                        event.currentTarget.checked,
                      )
                    }}
                  />
                  <NumberInput
                    label="Maximum number of queued videos"
                    min={0}
                    {...form.getInputProps('maxInQueue')}
                  />
                  <NumberInput
                    label="Vote threshold to skip the current video"
                    min={1}
                    max={100}
                    suffix="%"
                    {...form.getInputProps('voteThreshold')}
                  />
                </Stack>
              </Stepper.Step>

              <Stepper.Completed>
                <Stack gap="md" mt="lg">
                  <Title order={3} size="h5">
                    Review your room
                  </Title>
                  <List spacing="xs" size="sm">
                    {summary.map((line) => (
                      <List.Item key={line}>{line}</List.Item>
                    ))}
                  </List>
                </Stack>
              </Stepper.Completed>
            </Stepper>

            <Group justify="flex-end" mt="xl" gap="sm">
              {step > 0 ? (
                <Button
                  onClick={() => setStep((current) => current - 1)}
                  variant="default"
                  type="button"
                >
                  Back
                </Button>
              ) : null}
              {step < 3 ? (
                <Button onClick={handleNext} type="button">
                  Continue
                </Button>
              ) : (
                <Button loading={createRoomMutation.isPending} type="submit">
                  Create room
                </Button>
              )}
            </Group>
          </Paper>
        </form>
      </PageHero>
    </>
  )
}
