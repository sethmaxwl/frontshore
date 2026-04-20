import {
  AspectRatio,
  Button,
  Card,
  Group,
  Paper,
  Progress,
  Slider,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import YouTube from 'react-youtube'

import {
  loadStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'
import type { RoomVideo } from '@/lib/types/streamshore'
import { formatVideoDuration } from '@/lib/utils/media'

type RoomVideoPlayerProps = {
  canSkipVideo: boolean
  currentVideo: RoomVideo | null
  onSkipVideo: () => void
  onVoteToSkip: () => void
  syncTime: number
  votingEnabled: boolean
}

type StreamshoreYouTubePlayer = {
  getCurrentTime: () => Promise<number>
  getDuration: () => Promise<number>
  getPlayerState: () => Promise<number>
  mute: () => Promise<void>
  playVideo: () => Promise<void>
  seekTo: (seconds: number, allowSeekAhead?: boolean) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  unMute: () => Promise<void>
}

const playerOptions = {
  height: '100%',
  playerVars: {
    autoplay: 1,
    controls: 0,
    disablekb: 1,
    modestbranding: 1,
  },
  width: '100%',
}

export function RoomVideoPlayer({
  canSkipVideo,
  currentVideo,
  onSkipVideo,
  onVoteToSkip,
  syncTime,
  votingEnabled,
}: RoomVideoPlayerProps): JSX.Element {
  const containerReference = useRef<HTMLDivElement | null>(null)
  const playerReference = useRef<StreamshoreYouTubePlayer | null>(null)
  const [currentTimeLabel, setCurrentTimeLabel] = useState('0:00')
  const [durationLabel, setDurationLabel] = useState('0:00')
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [volume, setVolume] = useState(
    loadStoredValue<number>(storageKeys.playerVolume, 100),
  )
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    saveStoredValue(storageKeys.playerVolume, volume)

    if (!playerReference.current) {
      return
    }

    if (volume === 0) {
      void playerReference.current.mute()
      return
    }

    void playerReference.current.unMute()
    void playerReference.current.setVolume(volume)
  }, [volume])

  useEffect(() => {
    if (!playerReference.current || !currentVideo) {
      return
    }

    let ignore = false

    void (async () => {
      const player = playerReference.current

      if (!player) {
        return
      }

      const [playerState, playerTime, duration] = await Promise.all([
        player.getPlayerState(),
        player.getCurrentTime(),
        player.getDuration(),
      ])

      if (ignore) {
        return
      }

      if (playerState !== 1) {
        await player.playVideo()
      }

      if (Math.abs(syncTime - playerTime) > 1) {
        await player.seekTo(syncTime, true)
      }

      setCurrentTimeLabel(formatVideoDuration(playerTime))
      setDurationLabel(formatVideoDuration(duration))
      setProgressPercentage(duration > 0 ? (syncTime / duration) * 100 : 0)
    })()

    return () => {
      ignore = true
    }
  }, [currentVideo, syncTime])

  if (!currentVideo) {
    return (
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="xs" align="center" ta="center">
          <Title order={3} size="h5">
            No video is currently playing
          </Title>
          <Text c="dimmed" size="sm">
            Add a YouTube video to start playback in this room.
          </Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Stack gap="md">
        <div ref={containerReference}>
          <AspectRatio ratio={16 / 9}>
            <YouTube
              opts={playerOptions}
              onReady={(event) => {
                const player = event.target as StreamshoreYouTubePlayer

                playerReference.current = player
                void player.setVolume(volume)
              }}
              style={{ height: '100%', width: '100%' }}
              videoId={currentVideo.id}
            />
          </AspectRatio>
        </div>

        <Group justify="space-between" wrap="wrap" gap="sm">
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={700}>{currentVideo.title}</Text>
            <Text c="dimmed" size="sm">
              {currentTimeLabel} / {durationLabel}
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap">
            {canSkipVideo ? (
              <Button onClick={onSkipVideo} variant="default" type="button">
                Skip video
              </Button>
            ) : null}
            {votingEnabled && !hasVoted ? (
              <Button
                onClick={() => {
                  onVoteToSkip()
                  setHasVoted(true)
                }}
                variant="default"
                type="button"
              >
                Vote to skip
              </Button>
            ) : null}
            <Button
              onClick={() => {
                void containerReference.current?.requestFullscreen()
              }}
              variant="default"
              type="button"
            >
              Fullscreen
            </Button>
          </Group>
        </Group>

        <Progress value={Math.max(0, Math.min(progressPercentage, 100))} />

        <Group gap="sm" align="center">
          <Text c="dimmed" size="sm" style={{ minWidth: '4rem' }}>
            Volume
          </Text>
          <Slider
            aria-label="Volume"
            min={0}
            max={100}
            onChange={setVolume}
            style={{ flex: 1 }}
            value={volume}
          />
        </Group>
      </Stack>
    </Card>
  )
}
