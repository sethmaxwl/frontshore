import { css } from '@compiled/react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { JSX } from 'react'
import { toast } from 'sonner'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../../components/primitives/styles.ts'

import { EmptyState } from '@/components/feedback/EmptyState'
import { SurfaceCard } from '@/components/primitives/SurfaceCard'
import { searchYouTubeVideos } from '@/lib/api/streamshore'
import type { PlaylistWithVideos, RoomVideo } from '@/lib/types/streamshore'
import { extractYouTubeVideoId } from '@/lib/utils/media'

const listStyles = css({
  display: 'grid',
  gap: '0.75rem',
})

const queueItemStyles = css({
  alignItems: 'center',
  borderTop: '1px solid rgba(148, 163, 184, 0.12)',
  contentVisibility: 'auto',
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
  maxWidth: '56rem',
  padding: '1.2rem',
  position: 'fixed',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 2rem)',
  zIndex: 41,
})

const tabListStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginBottom: '1rem',
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

const searchFormStyles = css({
  display: 'grid',
  gap: '0.85rem',
})

type QueuePanelProps = {
  canAddToQueue: boolean
  currentUser: string
  onAddVideo: (videoId: string) => void
  onMoveToFront: (index: number) => void
  onRemoveVideo: (index: number) => void
  permission: number
  playlists: PlaylistWithVideos[]
  queuedVideos: RoomVideo[]
}

export function QueuePanel({
  canAddToQueue,
  currentUser,
  onAddVideo,
  onMoveToFront,
  onRemoveVideo,
  permission,
  playlists,
  queuedVideos,
}: QueuePanelProps): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const searchMutation = useMutation({
    mutationFn: searchYouTubeVideos,
    onError: () => {
      toast.error('Unable to search YouTube right now.')
    },
  })

  return (
    <SurfaceCard as="section">
      <div css={listStyles}>
        <div css={queueItemStyles}>
          <div css={valueStackStyles}>
            <p css={valueTitleStyles}>Queue</p>
            <p css={valueMetaStyles}>
              {queuedVideos.length} queued video
              {queuedVideos.length === 1 ? '' : 's'}
            </p>
          </div>
          {canAddToQueue ? (
            <Dialog.Root onOpenChange={setDialogOpen} open={dialogOpen}>
              <Dialog.Trigger asChild>
                <button
                  css={[baseButtonStyles, buttonStyles.primary]}
                  type="button"
                >
                  Add to queue
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay css={dialogOverlayStyles} />
                <Dialog.Content css={dialogContentStyles}>
                  <Tabs.Root defaultValue="search">
                    <Tabs.List css={tabListStyles}>
                      <Tabs.Trigger css={tabTriggerStyles} value="search">
                        YouTube search
                      </Tabs.Trigger>
                      <Tabs.Trigger css={tabTriggerStyles} value="url">
                        YouTube URL
                      </Tabs.Trigger>
                      <Tabs.Trigger css={tabTriggerStyles} value="playlist">
                        Playlist
                      </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="search">
                      <div css={searchFormStyles}>
                        <input
                          css={fieldStyles.input}
                          onChange={(event) => {
                            setSearchQuery(event.currentTarget.value)
                          }}
                          placeholder="Search YouTube"
                          value={searchQuery}
                        />
                        <button
                          css={[baseButtonStyles, buttonStyles.primary]}
                          onClick={() => {
                            if (searchQuery.trim().length > 0) {
                              searchMutation.mutate(searchQuery.trim())
                            }
                          }}
                          type="button"
                        >
                          Search
                        </button>
                        <div css={listStyles}>
                          {(searchMutation.data ?? []).map((video) => (
                            <button
                              key={video.id}
                              css={[baseButtonStyles, buttonStyles.secondary]}
                              onClick={() => {
                                onAddVideo(video.id)
                                setDialogOpen(false)
                              }}
                              type="button"
                            >
                              {video.title} • {video.channel}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="url">
                      <div css={searchFormStyles}>
                        <input
                          css={fieldStyles.input}
                          onChange={(event) => {
                            setUrlInput(event.currentTarget.value)
                          }}
                          placeholder="https://youtube.com/watch?v=..."
                          value={urlInput}
                        />
                        <button
                          css={[baseButtonStyles, buttonStyles.primary]}
                          onClick={() => {
                            const videoId = extractYouTubeVideoId(urlInput)

                            if (!videoId) {
                              toast.error('That YouTube URL is invalid.')
                              return
                            }

                            onAddVideo(videoId)
                            setDialogOpen(false)
                          }}
                          type="button"
                        >
                          Add by URL
                        </button>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="playlist">
                      <div css={listStyles}>
                        {playlists.length > 0 ? (
                          playlists.map((playlist) => (
                            <div key={playlist.name} css={listStyles}>
                              <p css={valueTitleStyles}>{playlist.name}</p>
                              {(playlist.videos ?? []).map((video) => (
                                <button
                                  key={`${playlist.name}-${video.id}`}
                                  css={[
                                    baseButtonStyles,
                                    buttonStyles.secondary,
                                  ]}
                                  onClick={() => {
                                    onAddVideo(video.id)
                                    setDialogOpen(false)
                                  }}
                                  type="button"
                                >
                                  {video.title}
                                </button>
                              ))}
                            </div>
                          ))
                        ) : (
                          <EmptyState
                            description="Create playlists in your profile and they will appear here."
                            title="No playlists available"
                          />
                        )}
                      </div>
                    </Tabs.Content>
                  </Tabs.Root>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          ) : null}
        </div>

        {queuedVideos.length > 0 ? (
          queuedVideos.map((video, index) => (
            <div key={`${video.id}-${index}`} css={queueItemStyles}>
              <div css={valueStackStyles}>
                <p css={valueTitleStyles}>
                  {index === 0 ? 'Next up • ' : ''}
                  {video.title}
                </p>
                <p css={valueMetaStyles}>
                  Submitted by {video.submittedBy || currentUser}
                </p>
              </div>
              {permission >= 50 ? (
                <div css={actionWrapStyles}>
                  {index === 0 ? null : (
                    <button
                      css={[baseButtonStyles, buttonStyles.secondary]}
                      onClick={() => {
                        onMoveToFront(index)
                      }}
                      type="button"
                    >
                      Move to front
                    </button>
                  )}
                  <button
                    css={[baseButtonStyles, buttonStyles.danger]}
                    onClick={() => {
                      onRemoveVideo(index)
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState
            description="Add a video from YouTube, a direct URL, or one of your saved playlists."
            title="The queue is empty"
          />
        )}
      </div>
    </SurfaceCard>
  )
}
