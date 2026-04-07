import type { AppConfig } from '@/lib/types/streamshore'

type StreamshoreImportMetaEnv = ImportMetaEnv & {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_BASE_URL?: string
  readonly VITE_YOUTUBE_API_KEY?: string
}

const environment = import.meta.env as StreamshoreImportMetaEnv

const legacyApiBaseUrl = import.meta.env.PROD
  ? 'https://streamshore-backend.nextinfinity.net'
  : 'http://localhost:4000'

const legacyWsBaseUrl = import.meta.env.PROD
  ? 'wss://streamshore-backend.nextinfinity.net'
  : 'ws://localhost:4000'

export const appConfig: AppConfig = {
  apiBaseUrl: environment.VITE_API_BASE_URL ?? legacyApiBaseUrl,
  wsBaseUrl: environment.VITE_WS_BASE_URL ?? legacyWsBaseUrl,
  youtubeApiKey:
    environment.VITE_YOUTUBE_API_KEY ??
    'AIzaSyAgLJ1EoP-mRNnBVuo6CvBNB3B7-TzWIu8',
}
