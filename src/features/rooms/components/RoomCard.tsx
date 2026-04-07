import { css } from '@compiled/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/app/providers/AuthProvider'
import {
  addFavorite,
  defaultRoomThumbnail,
  removeFavorite,
} from '@/lib/api/streamshore'
import type { RoomSummary } from '@/lib/types/streamshore'

const cardStyles = css({
  display: 'grid',
  gap: '0.9rem',
  height: '100%',
  overflow: 'hidden',
  padding: '1rem',
  position: 'relative',
  textDecoration: 'none',
})

const surfaceStyles = css({
  backdropFilter: 'blur(18px)',
  background:
    'linear-gradient(180deg, rgba(7, 15, 28, 0.88), rgba(8, 17, 30, 0.72))',
  border: '1px solid var(--color-border)',
  borderRadius: '26px',
  boxShadow: 'var(--shadow-panel)',
  minHeight: '100%',
  transition: 'transform 180ms ease, border-color 180ms ease',
  ':hover': {
    borderColor: 'rgba(34, 211, 238, 0.24)',
    transform: 'translateY(-4px)',
  },
})

const thumbnailStyles = css({
  aspectRatio: '16 / 9',
  borderRadius: '18px',
  objectFit: 'cover',
  width: '100%',
})

const topRowStyles = css({
  alignItems: 'start',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.08rem',
  fontWeight: 800,
  margin: 0,
})

const ownerStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const metaRowStyles = css({
  alignItems: 'center',
  color: 'var(--color-text-muted)',
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'space-between',
  marginTop: 'auto',
})

const pillStyles = css({
  background: 'rgba(34, 211, 238, 0.12)',
  border: '1px solid rgba(34, 211, 238, 0.2)',
  borderRadius: '999px',
  color: 'var(--color-accent)',
  fontSize: '0.78rem',
  fontWeight: 700,
  padding: '0.4rem 0.7rem',
})

const favoriteButtonStyles = css({
  alignItems: 'center',
  appearance: 'none',
  background: 'rgba(3, 10, 20, 0.84)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  color: 'var(--color-text-strong)',
  cursor: 'pointer',
  display: 'inline-flex',
  height: '2.3rem',
  justifyContent: 'center',
  width: '2.3rem',
  ':hover': {
    borderColor: 'rgba(250, 204, 21, 0.24)',
    color: '#facc15',
  },
})

type RoomCardProps = {
  favoriteRoom?: boolean
  room: RoomSummary
}

export function RoomCard({
  favoriteRoom = false,
  room,
}: RoomCardProps): JSX.Element {
  const queryClient = useQueryClient()
  const { isAuthenticated, session } = useAuth()

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) {
        return
      }

      if (favoriteRoom) {
        await removeFavorite(session.user, room.route)
        return
      }

      await addFavorite(session.user, room.route)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['landing'] })
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
      void queryClient.invalidateQueries({
        queryKey: ['room', room.route, 'favorite'],
      })
      toast.success(
        favoriteRoom
          ? `${room.name} removed from your favorites.`
          : `${room.name} added to your favorites.`,
      )
    },
  })

  return (
    <Link css={surfaceStyles} to={`/${room.route}`}>
      <article css={cardStyles}>
        <img
          alt={`${room.name} room thumbnail`}
          css={thumbnailStyles}
          src={room.thumbnail ?? defaultRoomThumbnail}
        />
        <div css={topRowStyles}>
          <div>
            <h3 css={titleStyles}>{room.name}</h3>
            <p css={ownerStyles}>Hosted by {room.owner}</p>
          </div>
          {isAuthenticated ? (
            <button
              aria-label={
                favoriteRoom
                  ? `Remove ${room.name} from favorites`
                  : `Add ${room.name} to favorites`
              }
              css={favoriteButtonStyles}
              disabled={favoriteMutation.isPending}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                favoriteMutation.mutate()
              }}
              type="button"
            >
              {favoriteRoom ? '♥' : '♡'}
            </button>
          ) : null}
        </div>
        <div css={metaRowStyles}>
          <span>
            {room.users} {room.users === 1 ? 'user' : 'users'}
          </span>
          <span css={pillStyles}>
            {room.privacy === 0 ? 'Public' : 'Private'}
          </span>
        </div>
      </article>
    </Link>
  )
}
