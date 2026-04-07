import { css } from '@compiled/react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../../components/primitives/styles.ts'

import { FormField } from '@/components/forms/FormField'
import type { RoomSettingsDraft } from '@/lib/types/streamshore'

const dialogOverlayStyles = css({
  backdropFilter: 'blur(10px)',
  background: 'rgba(2, 6, 23, 0.72)',
  inset: 0,
  position: 'fixed',
  zIndex: 40,
})

const dialogContentStyles = css({
  background: 'rgba(5, 15, 28, 0.96)',
  border: '1px solid var(--color-border)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-panel)',
  left: '50%',
  maxHeight: '80vh',
  maxWidth: '48rem',
  overflowY: 'auto',
  padding: '1.2rem',
  position: 'fixed',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 2rem)',
  zIndex: 41,
})

const formStyles = css({
  display: 'grid',
  gap: '1rem',
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

const schema = z.object({
  anon_chat: z.boolean(),
  anon_queue: z.boolean(),
  chat_filter: z.boolean(),
  chat_level: z.boolean(),
  motd: z.string(),
  queue_level: z.boolean(),
  queue_limit: z.number().int().min(0),
  route: z.string(),
  vote_enable: z.boolean(),
  vote_threshold: z.number().int().min(1).max(100),
})

type RoomSettingsDialogProps = {
  initialValues: RoomSettingsDraft | undefined
  isLoading: boolean
  onDeleteRoom: () => void
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: RoomSettingsDraft) => void
  open: boolean
}

export function RoomSettingsDialog({
  initialValues,
  isLoading,
  onDeleteRoom,
  onOpenChange,
  onSubmit,
  open,
}: RoomSettingsDialogProps): JSX.Element {
  const form = useForm<RoomSettingsDraft>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues)
    }
  }, [form, initialValues])

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay css={dialogOverlayStyles} />
        <Dialog.Content css={dialogContentStyles}>
          <form
            css={formStyles}
            onSubmit={(event) => {
              void form.handleSubmit((values) => {
                onSubmit(values)
              })(event)
            }}
          >
            <Dialog.Title>Room settings</Dialog.Title>

            {isLoading ? (
              <p>Loading current settings...</p>
            ) : (
              <>
                <FormField label="Welcome message">
                  <textarea
                    css={fieldStyles.textarea}
                    {...form.register('motd')}
                  />
                </FormField>

                <label css={toggleLabelStyles}>
                  Allow anonymous chat participation
                  <input type="checkbox" {...form.register('anon_chat')} />
                </label>
                <label css={toggleLabelStyles}>
                  Restrict chat to managers
                  <input type="checkbox" {...form.register('chat_level')} />
                </label>
                <label css={toggleLabelStyles}>
                  Enable safe chat filter
                  <input type="checkbox" {...form.register('chat_filter')} />
                </label>
                <label css={toggleLabelStyles}>
                  Allow anonymous queue submissions
                  <input type="checkbox" {...form.register('anon_queue')} />
                </label>
                <label css={toggleLabelStyles}>
                  Restrict queue submissions to managers
                  <input type="checkbox" {...form.register('queue_level')} />
                </label>
                <label css={toggleLabelStyles}>
                  Enable vote-to-skip
                  <input type="checkbox" {...form.register('vote_enable')} />
                </label>

                <FormField label="Queue limit">
                  <input
                    css={fieldStyles.input}
                    type="number"
                    {...form.register('queue_limit', { valueAsNumber: true })}
                  />
                </FormField>

                <FormField label="Vote threshold">
                  <input
                    css={fieldStyles.input}
                    type="number"
                    {...form.register('vote_threshold', {
                      valueAsNumber: true,
                    })}
                  />
                </FormField>
              </>
            )}

            <div css={actionRowStyles}>
              <button
                css={[baseButtonStyles, buttonStyles.primary]}
                type="submit"
              >
                Save settings
              </button>
              <button
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={() => {
                  onOpenChange(false)
                }}
                type="button"
              >
                Close
              </button>
              <button
                css={[baseButtonStyles, buttonStyles.danger]}
                onClick={onDeleteRoom}
                type="button"
              >
                Delete room
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
