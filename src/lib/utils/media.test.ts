import { describe, expect, it } from 'vitest'

import {
  decodeHtmlEntities,
  extractYouTubeVideoId,
  formatVideoDuration,
} from '@/lib/utils/media'

describe('media utils', () => {
  it('formats video durations with safe whole-second values', () => {
    expect(formatVideoDuration(-12)).toBe('0:00')
    expect(formatVideoDuration(65.9)).toBe('1:05')
    expect(formatVideoDuration(3670)).toBe('1:01:10')
  })

  it('decodes html entities when the document is available', () => {
    expect(decodeHtmlEntities('Tom &amp; Jerry &quot;shorts&quot;')).toBe(
      'Tom & Jerry "shorts"',
    )
  })

  it('returns undecoded text outside the browser document environment', () => {
    const documentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'document',
    )

    try {
      expect(Reflect.deleteProperty(globalThis, 'document')).toBe(true)
      expect(decodeHtmlEntities('Tom &amp; Jerry')).toBe('Tom &amp; Jerry')
    } finally {
      if (documentDescriptor) {
        Object.defineProperty(globalThis, 'document', documentDescriptor)
      }
    }
  })

  it('extracts youtube video ids from ids and urls', () => {
    expect(extractYouTubeVideoId(' dQw4w9WgXcQ ')).toBe('dQw4w9WgXcQ')
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ',
    )
    expect(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    ).toBe('dQw4w9WgXcQ')
  })

  it('returns null when a youtube id cannot be found', () => {
    expect(extractYouTubeVideoId('   ')).toBeNull()
    expect(extractYouTubeVideoId('not a url')).toBeNull()
    expect(extractYouTubeVideoId('https://www.youtube.com/watch')).toBeNull()
  })
})
