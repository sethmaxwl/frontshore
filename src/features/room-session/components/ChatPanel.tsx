import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'

import type { PresenceUser, RoomMessage } from '@/lib/types/streamshore'

type ChatPanelProps = {
  currentUser: string
  disabled: boolean
  messages: RoomMessage[]
  onDeleteMessage: (uuid: string) => void
  onSendMessage: (message: string) => void
  permission: number
  users: PresenceUser[]
}

export function ChatPanel({
  currentUser,
  disabled,
  messages,
  onDeleteMessage,
  onSendMessage,
  permission,
  users,
}: ChatPanelProps): JSX.Element {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [input, setInput] = useState('')
  const deferredInput = useDeferredValue(input)
  const suggestions = useMemo(() => {
    const inputParts = deferredInput.split(' ')
    const lastToken = inputParts.at(-1) ?? ''

    if (!lastToken.startsWith('@')) {
      return []
    }

    const filterValue = lastToken.slice(1).toLowerCase()

    return users
      .filter((user) => user.name !== currentUser)
      .filter((user) => user.name.toLowerCase().startsWith(filterValue))
      .map((user) => user.name)
      .slice(0, 6)
  }, [currentUser, deferredInput, users])

  useEffect(() => {
    viewportRef.current?.scrollTo({
      behavior: 'smooth',
      top: viewportRef.current.scrollHeight,
    })
  }, [messages])

  function replaceMention(name: string): void {
    const inputParts = input.split(' ')
    inputParts[inputParts.length - 1] = `@${name}`
    setInput(`${inputParts.join(' ')} `)
  }

  return (
    <Stack gap="sm">
      <ScrollArea h={448} viewportRef={viewportRef}>
        {messages.length > 0 ? (
          <Stack gap="sm" pr="xs">
            {messages.map((message) => {
              const highlightsCurrentUser =
                !message.motd && message.msg.includes(`@${currentUser}`)

              return (
                <Paper
                  key={message.uuid}
                  p="sm"
                  radius="md"
                  withBorder
                  bg={highlightsCurrentUser ? 'teal.0' : undefined}
                  style={
                    highlightsCurrentUser
                      ? { borderColor: 'var(--mantine-color-teal-5)' }
                      : undefined
                  }
                >
                  <Stack gap={6}>
                    <Group
                      justify="space-between"
                      wrap="nowrap"
                      align="flex-start"
                    >
                      <Stack gap={0}>
                        <Text fw={700} size="sm">
                          {message.motd ? 'Room message' : message.user}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {message.motd
                            ? 'MOTD'
                            : new Date(
                                message.time * 1000,
                              ).toLocaleTimeString()}
                        </Text>
                      </Stack>
                      {permission >= 50 && !message.motd ? (
                        <Button
                          color="red"
                          onClick={() => onDeleteMessage(message.uuid)}
                          size="xs"
                          variant="light"
                          type="button"
                        >
                          Delete
                        </Button>
                      ) : null}
                    </Group>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {message.msg}
                    </Text>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        ) : (
          <Paper p="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={600}>Chat is quiet</Text>
              <Text c="dimmed" size="sm">
                No chat activity yet. Start the conversation when you are ready.
              </Text>
            </Stack>
          </Paper>
        )}
      </ScrollArea>

      <Stack gap="sm">
        {suggestions.length > 0 ? (
          <Group gap="xs" wrap="wrap">
            {suggestions.map((name) => (
              <Button
                key={name}
                onClick={() => replaceMention(name)}
                size="xs"
                variant="default"
                type="button"
              >
                @{name}
              </Button>
            ))}
          </Group>
        ) : null}
        <Textarea
          autosize
          disabled={disabled}
          minRows={2}
          maxRows={6}
          onChange={(event) => setInput(event.currentTarget.value)}
          placeholder={
            disabled
              ? 'You do not have permission to chat in this room.'
              : 'Say something to the room…'
          }
          value={input}
        />
        <Button
          disabled={disabled || input.trim().length === 0}
          onClick={() => {
            if (input.trim().length === 0) {
              return
            }

            onSendMessage(input.trim())
            setInput('')
          }}
          type="button"
        >
          Send message
        </Button>
      </Stack>
    </Stack>
  )
}
