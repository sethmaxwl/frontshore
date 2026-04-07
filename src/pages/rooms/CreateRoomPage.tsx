import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import type { JSX } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
  panelStyles,
} from '../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { FormField } from '@/components/forms/FormField'
import { AppShell } from '@/components/layout/AppShell'
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

const pageStyles = css({
  display: 'grid',
  gap: '1.5rem',
})

const stepperStyles = css({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  '@media (max-width: 760px)': {
    gridTemplateColumns: '1fr',
  },
})

const stepStyles = css({
  display: 'grid',
  gap: '0.25rem',
  padding: '1rem',
})

const stepLabelStyles = css({
  color: 'var(--color-accent)',
  fontSize: '0.78rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  margin: 0,
  textTransform: 'uppercase',
})

const stepTitleStyles = css({
  color: 'var(--color-text-strong)',
  fontWeight: 800,
  margin: 0,
})

const panelContentStyles = css({
  display: 'grid',
  gap: '1rem',
  padding: '1.25rem',
})

const toggleGridStyles = css({
  display: 'grid',
  gap: '0.75rem',
})

const toggleLabelStyles = css({
  alignItems: 'center',
  color: 'var(--color-text-strong)',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
})

const actionRowStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
})

const summaryStyles = css({
  color: 'var(--color-text-muted)',
  display: 'grid',
  gap: '0.35rem',
  margin: 0,
})

const roomTypeGridStyles = css({
  display: 'grid',
  gap: '0.75rem',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
  },
})

const roomTypeButtonStyles = css({
  alignItems: 'start',
  background: 'rgba(8, 17, 30, 0.62)',
  cursor: 'pointer',
  display: 'grid',
  gap: '0.55rem',
  minHeight: '10rem',
  padding: '1rem',
  textAlign: 'left',
})

const roomTypeActiveStyles = css({
  borderColor: 'rgba(34, 211, 238, 0.35)',
  boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.08)',
})

function getStepLabel(step: number): string {
  return ['Basic details', 'Chat options', 'Queue options', 'Review'][step - 1]
}

export default function CreateRoomPage(): JSX.Element {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [step, setStep] = useState(1)
  const form = useForm<CreateRoomValues>({
    defaultValues: {
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
    resolver: zodResolver(createRoomSchema),
  })

  const values = useWatch({
    control: form.control,
    defaultValue: form.getValues(),
  })

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
      toast.error(getApiErrorMessage(error, 'Unable to create room'))
    },
    onSuccess: (room) => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({ queryKey: ['rooms'] })
      toast.success('Room created successfully.')
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

  return (
    <>
      <PageMetadata
        description="Create a new synchronized Streamshore room with queue, chat, and moderation settings."
        title="Streamshore | Create Room"
      />
      <AppShell
        eyebrow="Room creation"
        title="Launch a new room"
        description="The new flow keeps the old backend payloads intact, but the UI collapses the legacy stepper into a cleaner React form surface."
      >
        <div css={pageStyles}>
          <div css={stepperStyles}>
            {Array.from({ length: 4 }, (_, index) => index + 1).map(
              (currentStep) => (
                <section key={currentStep} css={[panelStyles, stepStyles]}>
                  <p css={stepLabelStyles}>Step {currentStep}</p>
                  <p css={stepTitleStyles}>{getStepLabel(currentStep)}</p>
                </section>
              ),
            )}
          </div>

          <form
            css={[panelStyles, panelContentStyles]}
            onSubmit={(event) => {
              void form.handleSubmit((submittedValues) => {
                createRoomMutation.mutate(submittedValues)
              })(event)
            }}
          >
            {step === 1 ? (
              <>
                <FormField
                  error={form.formState.errors.roomName?.message}
                  hint="This becomes the final room route slug."
                  label="Room name"
                >
                  <input
                    css={fieldStyles.input}
                    {...form.register('roomName')}
                  />
                </FormField>
                <FormField label="Welcome message">
                  <textarea
                    css={fieldStyles.textarea}
                    {...form.register('roomMOTD')}
                  />
                </FormField>
                <div css={roomTypeGridStyles}>
                  {(['Public', 'Private'] as const).map((roomType) => (
                    <button
                      key={roomType}
                      css={[
                        panelStyles,
                        roomTypeButtonStyles,
                        values.roomType === roomType
                          ? roomTypeActiveStyles
                          : null,
                      ]}
                      onClick={(event) => {
                        event.preventDefault()
                        form.setValue('roomType', roomType)
                      }}
                      type="button"
                    >
                      <strong>{roomType} room</strong>
                      <span>
                        {roomType === 'Public'
                          ? 'Visible on the landing page for anyone to join.'
                          : 'Only accessible through friends or direct links.'}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <div css={toggleGridStyles}>
                <label css={toggleLabelStyles}>
                  Allow anonymous chat participation
                  <input
                    checked={values.anonymousChatting}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setValue('anonymousChatting', checked)
                      if (checked) {
                        form.setValue('chatLevel', false)
                      }
                    }}
                    type="checkbox"
                  />
                </label>
                <label css={toggleLabelStyles}>
                  Restrict chat to room managers
                  <input
                    checked={values.chatLevel}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked
                      form.setValue('chatLevel', checked)
                      if (checked) {
                        form.setValue('anonymousChatting', false)
                      }
                    }}
                    type="checkbox"
                  />
                </label>
                <label css={toggleLabelStyles}>
                  Enable the safe chat filter
                  <input
                    checked={values.chatFilter}
                    onChange={(event) => {
                      form.setValue('chatFilter', event.currentTarget.checked)
                    }}
                    type="checkbox"
                  />
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <>
                <div css={toggleGridStyles}>
                  <label css={toggleLabelStyles}>
                    Allow anonymous queue submissions
                    <input
                      checked={values.anonymousQueueAdd}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked
                        form.setValue('anonymousQueueAdd', checked)
                        if (checked) {
                          form.setValue('queueLevel', false)
                        }
                      }}
                      type="checkbox"
                    />
                  </label>
                  <label css={toggleLabelStyles}>
                    Restrict queue submissions to managers
                    <input
                      checked={values.queueLevel}
                      onChange={(event) => {
                        const checked = event.currentTarget.checked
                        form.setValue('queueLevel', checked)
                        if (checked) {
                          form.setValue('anonymousQueueAdd', false)
                        }
                      }}
                      type="checkbox"
                    />
                  </label>
                  <label css={toggleLabelStyles}>
                    Enable vote-to-skip
                    <input
                      checked={values.queueVoting}
                      onChange={(event) => {
                        form.setValue(
                          'queueVoting',
                          event.currentTarget.checked,
                        )
                      }}
                      type="checkbox"
                    />
                  </label>
                </div>
                <FormField
                  error={form.formState.errors.maxInQueue?.message}
                  label="Maximum number of queued videos"
                >
                  <input
                    css={fieldStyles.input}
                    type="number"
                    {...form.register('maxInQueue', { valueAsNumber: true })}
                  />
                </FormField>
                <FormField
                  error={form.formState.errors.voteThreshold?.message}
                  label="Vote threshold to skip the current video"
                >
                  <input
                    css={fieldStyles.input}
                    type="number"
                    {...form.register('voteThreshold', { valueAsNumber: true })}
                  />
                </FormField>
              </>
            ) : null}

            {step === 4 ? (
              <div css={summaryStyles}>
                {summary.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            <div css={actionRowStyles}>
              {step > 1 ? (
                <button
                  css={[baseButtonStyles, buttonStyles.secondary]}
                  onClick={() => {
                    setStep((currentStep) => currentStep - 1)
                  }}
                  type="button"
                >
                  Back
                </button>
              ) : null}
              {step < 4 ? (
                <button
                  css={[baseButtonStyles, buttonStyles.primary]}
                  onClick={() => {
                    const fields =
                      step === 1
                        ? (['roomName', 'roomMOTD', 'roomType'] as const)
                        : ([
                            'anonymousQueueAdd',
                            'maxInQueue',
                            'queueLevel',
                            'queueVoting',
                            'voteThreshold',
                          ] as const)

                    const validationFields =
                      step === 2
                        ? ([
                            'anonymousChatting',
                            'chatFilter',
                            'chatLevel',
                          ] as const)
                        : fields

                    void form.trigger(validationFields).then((isStepValid) => {
                      if (isStepValid) {
                        setStep((currentStep) => currentStep + 1)
                      }
                    })
                  }}
                  type="button"
                >
                  Continue
                </button>
              ) : (
                <button
                  css={[baseButtonStyles, buttonStyles.primary]}
                  disabled={createRoomMutation.isPending}
                  type="submit"
                >
                  {createRoomMutation.isPending
                    ? 'Creating room...'
                    : 'Create room'}
                </button>
              )}
            </div>
          </form>
        </div>
      </AppShell>
    </>
  )
}
