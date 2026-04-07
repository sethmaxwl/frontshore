import { css } from '@compiled/react'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { JSX } from 'react'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../../components/primitives/styles.ts'

import { EmptyState } from '@/components/feedback/EmptyState'
import type { PresenceUser, RoomMessage } from '@/lib/types/streamshore'

const shellStyles = css({
  display: 'grid',
  gap: '0.85rem',
})

const messageListStyles = css({
  display: 'grid',
  gap: '0.75rem',
  maxHeight: '28rem',
  overflowY: 'auto',
  paddingRight: '0.35rem',
})

const messageCardStyles = css({
  background: 'rgba(8, 17, 30, 0.52)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '20px',
  display: 'grid',
  gap: '0.5rem',
  padding: '0.85rem',
})

const highlightStyles = css({
  borderColor: 'rgba(34, 211, 238, 0.28)',
  boxShadow: '0 0 0 3px rgba(34, 211, 238, 0.08)',
})

const messageHeaderStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '0.65rem',
  justifyContent: 'space-between',
})

const userStyles = css({
  color: 'var(--color-text-strong)',
  fontWeight: 700,
  margin: 0,
})

const timeStyles = css({
  color: 'var(--color-text-muted)',
  fontSize: '0.82rem',
  margin: 0,
})

const bodyStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
  whiteSpace: 'pre-wrap',
})

const composerStyles = css({
  display: 'grid',
  gap: '0.75rem',
})

const suggestionWrapStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
})

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
  const feedReference = useRef<HTMLDivElement | null>(null)
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
    feedReference.current?.scrollTo({
      behavior: 'smooth',
      top: feedReference.current.scrollHeight,
    })
  }, [messages])

  function replaceMention(name: string): void {
    const inputParts = input.split(' ')
    inputParts[inputParts.length - 1] = `@${name}`
    setInput(`${inputParts.join(' ')} `)
  }

  return (
    <div css={shellStyles}>
      <div ref={feedReference} css={messageListStyles}>
        {messages.length > 0 ? (
          messages.map((message) => {
            const highlightsCurrentUser =
              !message.motd && message.msg.includes(`@${currentUser}`)

            return (
              <article
                key={message.uuid}
                css={[
                  messageCardStyles,
                  highlightsCurrentUser ? highlightStyles : null,
                ]}
              >
                <div css={messageHeaderStyles}>
                  <div>
                    <p css={userStyles}>
                      {message.motd ? 'Room message' : message.user}
                    </p>
                    <p css={timeStyles}>
                      {message.motd
                        ? 'MOTD'
                        : new Date(message.time * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                  {permission >= 50 && !message.motd ? (
                    <button
                      css={[baseButtonStyles, buttonStyles.secondary]}
                      onClick={() => {
                        onDeleteMessage(message.uuid)
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
                <p css={bodyStyles}>{message.msg}</p>
              </article>
            )
          })
        ) : (
          <EmptyState
            description="No chat activity yet. Start the conversation when you are ready."
            title="Chat is quiet"
          />
        )}
      </div>

      <div css={composerStyles}>
        {suggestions.length > 0 ? (
          <div css={suggestionWrapStyles}>
            {suggestions.map((name) => (
              <button
                key={name}
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={() => {
                  replaceMention(name)
                }}
                type="button"
              >
                @{name}
              </button>
            ))}
          </div>
        ) : null}
        <textarea
          css={fieldStyles.textarea}
          disabled={disabled}
          onChange={(event) => {
            setInput(event.currentTarget.value)
          }}
          placeholder={
            disabled
              ? 'You do not have permission to chat in this room.'
              : 'Say something to the room...'
          }
          value={input}
        />
        <button
          css={[baseButtonStyles, buttonStyles.primary]}
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
        </button>
      </div>
    </div>
  )
}
