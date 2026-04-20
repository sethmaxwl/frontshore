import {
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { JSX } from 'react'

import { searchYouTubeVideos } from '@/lib/api/streamshore'
import type { PlaylistWithVideos, RoomVideo } from '@/lib/types/streamshore'
import { extractYouTubeVideoId } from '@/lib/utils/media'

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
      notifications.show({
        color: 'red',
        message: 'Unable to search YouTube right now.',
      })
    },
  })

  return (
    <Card padding="md" radius="md" withBorder component="section">
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Text fw={700}>Queue</Text>
            <Text c="dimmed" size="sm">
              {queuedVideos.length} queued video
              {queuedVideos.length === 1 ? '' : 's'}
            </Text>
          </Stack>
          {canAddToQueue ? (
            <Button onClick={() => setDialogOpen(true)} type="button">
              Add to queue
            </Button>
          ) : null}
        </Group>

        {queuedVideos.length > 0 ? (
          <Stack gap="sm">
            {queuedVideos.map((video, index) => (
              <div key={`${video.id}-${index}`}>
                {index > 0 ? <Divider mb="sm" /> : null}
                <Group
                  justify="space-between"
                  wrap="wrap"
                  gap="sm"
                  align="flex-start"
                >
                  <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                    <Text fw={700}>
                      {index === 0 ? 'Next up • ' : ''}
                      {video.title}
                    </Text>
                    <Text c="dimmed" size="sm">
                      Submitted by {video.submittedBy || currentUser}
                    </Text>
                  </Stack>
                  {permission >= 50 ? (
                    <Group gap="xs">
                      {index === 0 ? null : (
                        <Button
                          onClick={() => onMoveToFront(index)}
                          size="xs"
                          variant="default"
                          type="button"
                        >
                          Move to front
                        </Button>
                      )}
                      <Button
                        color="red"
                        onClick={() => onRemoveVideo(index)}
                        size="xs"
                        variant="light"
                        type="button"
                      >
                        Remove
                      </Button>
                    </Group>
                  ) : null}
                </Group>
              </div>
            ))}
          </Stack>
        ) : (
          <Paper p="lg" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={600}>The queue is empty</Text>
              <Text c="dimmed" size="sm">
                Add a video from YouTube, a direct URL, or one of your saved
                playlists.
              </Text>
            </Stack>
          </Paper>
        )}
      </Stack>

      <Modal
        onClose={() => setDialogOpen(false)}
        opened={dialogOpen}
        size="xl"
        title="Add to queue"
      >
        <Tabs defaultValue="search">
          <Tabs.List>
            <Tabs.Tab value="search">YouTube search</Tabs.Tab>
            <Tabs.Tab value="url">YouTube URL</Tabs.Tab>
            <Tabs.Tab value="playlist">Playlist</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="search" pt="md">
            <Stack gap="sm">
              <Group gap="sm" align="flex-end" wrap="nowrap">
                <TextInput
                  aria-label="Search YouTube"
                  onChange={(event) =>
                    setSearchQuery(event.currentTarget.value)
                  }
                  placeholder="Search YouTube"
                  style={{ flex: 1 }}
                  value={searchQuery}
                />
                <Button
                  onClick={() => {
                    if (searchQuery.trim().length > 0) {
                      searchMutation.mutate(searchQuery.trim())
                    }
                  }}
                  type="button"
                >
                  Search
                </Button>
              </Group>
              <ScrollArea.Autosize mah={360}>
                <Stack gap="xs">
                  {(searchMutation.data ?? []).map((video) => (
                    <UnstyledButton
                      key={video.id}
                      onClick={() => {
                        onAddVideo(video.id)
                        setDialogOpen(false)
                      }}
                    >
                      <Paper p="sm" radius="md" withBorder>
                        <Text fw={600} lineClamp={1}>
                          {video.title}
                        </Text>
                        <Text c="dimmed" size="sm">
                          {video.channel}
                        </Text>
                      </Paper>
                    </UnstyledButton>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="url" pt="md">
            <Stack gap="sm">
              <TextInput
                aria-label="YouTube URL"
                onChange={(event) => setUrlInput(event.currentTarget.value)}
                placeholder="https://youtube.com/watch?v=..."
                value={urlInput}
              />
              <Button
                onClick={() => {
                  const videoId = extractYouTubeVideoId(urlInput)

                  if (!videoId) {
                    notifications.show({
                      color: 'red',
                      message: 'That YouTube URL is invalid.',
                    })
                    return
                  }

                  onAddVideo(videoId)
                  setDialogOpen(false)
                }}
                type="button"
              >
                Add by URL
              </Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="playlist" pt="md">
            {playlists.length > 0 ? (
              <ScrollArea.Autosize mah={420}>
                <Stack gap="md">
                  {playlists.map((playlist) => (
                    <Stack key={playlist.name} gap="xs">
                      <Text fw={700}>{playlist.name}</Text>
                      {(playlist.videos ?? []).map((video) => (
                        <UnstyledButton
                          key={`${playlist.name}-${video.id}`}
                          onClick={() => {
                            onAddVideo(video.id)
                            setDialogOpen(false)
                          }}
                        >
                          <Paper p="sm" radius="md" withBorder>
                            <Text lineClamp={1}>{video.title}</Text>
                          </Paper>
                        </UnstyledButton>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              </ScrollArea.Autosize>
            ) : (
              <Paper p="lg" radius="md" withBorder>
                <Stack gap="xs">
                  <Text fw={600}>No playlists available</Text>
                  <Text c="dimmed" size="sm">
                    Create playlists in your profile and they will appear here.
                  </Text>
                </Stack>
              </Paper>
            )}
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Card>
  )
}
