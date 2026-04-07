import { css } from '@compiled/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { JSX } from 'react'
import { toast } from 'sonner'

import {
  baseButtonStyles,
  buttonStyles,
} from '../../../components/primitives/styles.ts'

import { useAuth } from '@/app/providers/AuthProvider'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getApiErrorMessage } from '@/lib/api/client'
import { createFriendRequest } from '@/lib/api/streamshore'
import type { PresenceUser } from '@/lib/types/streamshore'

const listStyles = css({
  display: 'grid',
  gap: '0.75rem',
})

const userRowStyles = css({
  alignItems: 'center',
  borderTop: '1px solid rgba(148, 163, 184, 0.12)',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
  paddingTop: '0.85rem',
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

const actionWrapStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
})

type RoomUsersPanelProps = {
  currentPermission: number
  currentUser: string
  onUpdatePermission: (username: string, permission: 0 | 5 | 10 | 50) => void
  users: PresenceUser[]
}

export function RoomUsersPanel({
  currentPermission,
  currentUser,
  onUpdatePermission,
  users,
}: RoomUsersPanelProps): JSX.Element {
  const queryClient = useQueryClient()
  const { isAuthenticated, session } = useAuth()
  const addFriendMutation = useMutation({
    mutationFn: async (friend: string) => {
      if (!session?.user) {
        throw new Error('You must be logged in to add friends')
      }

      return createFriendRequest(session.user, friend)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to send friend request'))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Friend request sent.')
    },
  })

  return (
    <div css={listStyles}>
      {users.length > 0 ? (
        users.map((user) => {
          const canModerate =
            currentPermission >= 50 && user.name !== currentUser
          const canPromote =
            currentPermission === 100 &&
            user.name !== currentUser &&
            !user.anon &&
            user.permission < 50

          return (
            <div key={user.name} css={userRowStyles}>
              <div css={valueStackStyles}>
                <p css={valueTitleStyles}>
                  {user.name}
                  {user.name === currentUser ? ' • You' : ''}
                </p>
                <p css={valueMetaStyles}>
                  {user.anon ? 'Anonymous guest' : 'Authenticated user'} •
                  Permission {user.permission}
                </p>
              </div>
              <div css={actionWrapStyles}>
                {isAuthenticated && !user.anon && user.name !== currentUser ? (
                  <button
                    css={[baseButtonStyles, buttonStyles.secondary]}
                    onClick={() => {
                      addFriendMutation.mutate(user.name)
                    }}
                    type="button"
                  >
                    Add friend
                  </button>
                ) : null}
                {canPromote ? (
                  <button
                    css={[baseButtonStyles, buttonStyles.secondary]}
                    onClick={() => {
                      onUpdatePermission(user.name, 50)
                    }}
                    type="button"
                  >
                    Promote
                  </button>
                ) : null}
                {canModerate && user.permission !== 5 ? (
                  <button
                    css={[baseButtonStyles, buttonStyles.secondary]}
                    onClick={() => {
                      onUpdatePermission(user.name, 5)
                    }}
                    type="button"
                  >
                    Mute
                  </button>
                ) : null}
                {canModerate && user.permission === 5 ? (
                  <button
                    css={[baseButtonStyles, buttonStyles.secondary]}
                    onClick={() => {
                      onUpdatePermission(user.name, 10)
                    }}
                    type="button"
                  >
                    Unmute
                  </button>
                ) : null}
                {canModerate && user.permission < 50 ? (
                  <button
                    css={[baseButtonStyles, buttonStyles.danger]}
                    onClick={() => {
                      onUpdatePermission(user.name, 0)
                    }}
                    type="button"
                  >
                    Ban
                  </button>
                ) : null}
              </div>
            </div>
          )
        })
      ) : (
        <EmptyState
          description="Presence data will appear here after users join the room."
          title="Nobody is connected yet"
        />
      )}
    </div>
  )
}
