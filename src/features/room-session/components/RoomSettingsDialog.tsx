import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NumberInput,
  Stack,
  Switch,
  Textarea,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { useEffect } from 'react'
import type { JSX } from 'react'
import { z } from 'zod'

import type { RoomSettingsDraft } from '@/lib/types/streamshore'

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

const emptyValues: RoomSettingsDraft = {
  anon_chat: true,
  anon_queue: true,
  chat_filter: false,
  chat_level: false,
  motd: '',
  queue_level: false,
  queue_limit: 0,
  route: '',
  vote_enable: true,
  vote_threshold: 50,
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
    mode: 'controlled',
    initialValues: initialValues ?? emptyValues,
    validate: zodResolver(schema),
  })

  useEffect(() => {
    if (initialValues) {
      form.setValues(initialValues)
      form.resetDirty(initialValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues])

  return (
    <Modal
      onClose={() => onOpenChange(false)}
      opened={open}
      size="xl"
      title="Room settings"
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {isLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : (
            <>
              <Textarea
                autosize
                label="Welcome message"
                minRows={2}
                {...form.getInputProps('motd')}
              />
              <Switch
                label="Allow anonymous chat participation"
                {...form.getInputProps('anon_chat', { type: 'checkbox' })}
              />
              <Switch
                label="Restrict chat to managers"
                {...form.getInputProps('chat_level', { type: 'checkbox' })}
              />
              <Switch
                label="Enable safe chat filter"
                {...form.getInputProps('chat_filter', { type: 'checkbox' })}
              />
              <Switch
                label="Allow anonymous queue submissions"
                {...form.getInputProps('anon_queue', { type: 'checkbox' })}
              />
              <Switch
                label="Restrict queue submissions to managers"
                {...form.getInputProps('queue_level', { type: 'checkbox' })}
              />
              <Switch
                label="Enable vote-to-skip"
                {...form.getInputProps('vote_enable', { type: 'checkbox' })}
              />
              <NumberInput
                label="Queue limit"
                min={0}
                {...form.getInputProps('queue_limit')}
              />
              <NumberInput
                label="Vote threshold"
                min={1}
                max={100}
                suffix="%"
                {...form.getInputProps('vote_threshold')}
              />
            </>
          )}

          <Group justify="space-between" wrap="wrap" gap="sm" mt="sm">
            <Button
              color="red"
              onClick={onDeleteRoom}
              type="button"
              variant="light"
            >
              Delete room
            </Button>
            <Group gap="sm">
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="default"
              >
                Close
              </Button>
              <Button type="submit">Save settings</Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
