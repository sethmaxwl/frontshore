import { css } from '@compiled/react'
import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import YouTube from 'react-youtube'

import {
  baseButtonStyles,
  buttonStyles,
  fieldStyles,
} from '../../../components/primitives/styles.ts'

import { EmptyState } from '@/components/feedback/EmptyState'
import { SurfaceCard } from '@/components/primitives/SurfaceCard'
import {
  loadStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'
import type { RoomVideo } from '@/lib/types/streamshore'
import { formatVideoDuration } from '@/lib/utils/media'

const shellStyles = css({
  display: 'grid',
  gap: '1rem',
})

const videoFrameStyles = css({
  aspectRatio: '16 / 9',
  border: '1px solid var(--color-border)',
  borderRadius: '24px',
  overflow: 'hidden',
  width: '100%',
})

const controlsStyles = css({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'space-between',
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.1rem',
  fontWeight: 800,
  margin: 0,
})

const metaStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const actionWrapStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.55rem',
})

const progressTrackStyles = css({
  background: 'rgba(148, 163, 184, 0.14)',
  borderRadius: '999px',
  height: '0.5rem',
  overflow: 'hidden',
  width: '100%',
})

const progressFillStyles = css({
  background:
    'linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.88))',
  borderRadius: '999px',
  height: '100%',
})

const rangeStyles = css({
  width: '9rem',
})

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
      <EmptyState
        description="Add a YouTube video to start playback in this room."
        title="No video is currently playing"
      />
    )
  }

  return (
    <SurfaceCard as="section">
      <div css={shellStyles}>
        <div ref={containerReference} css={videoFrameStyles}>
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
        </div>

        <div css={controlsStyles}>
          <div>
            <p css={titleStyles}>{currentVideo.title}</p>
            <p css={metaStyles}>
              {currentTimeLabel} / {durationLabel}
            </p>
          </div>
          <div css={actionWrapStyles}>
            {canSkipVideo ? (
              <button
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={onSkipVideo}
                type="button"
              >
                Skip video
              </button>
            ) : null}
            {votingEnabled && !hasVoted ? (
              <button
                css={[baseButtonStyles, buttonStyles.secondary]}
                onClick={() => {
                  onVoteToSkip()
                  setHasVoted(true)
                }}
                type="button"
              >
                Vote to skip
              </button>
            ) : null}
            <button
              css={[baseButtonStyles, buttonStyles.secondary]}
              onClick={() => {
                void containerReference.current?.requestFullscreen()
              }}
              type="button"
            >
              Fullscreen
            </button>
          </div>
        </div>

        <div css={progressTrackStyles}>
          <div
            css={progressFillStyles}
            style={{
              width: `${Math.max(0, Math.min(progressPercentage, 100))}%`,
            }}
          />
        </div>

        <label css={metaStyles}>
          Volume
          <input
            css={[fieldStyles.input, rangeStyles]}
            max="100"
            min="0"
            onChange={(event) => {
              setVolume(Number(event.currentTarget.value))
            }}
            type="range"
            value={volume}
          />
        </label>
      </div>
    </SurfaceCard>
  )
}
