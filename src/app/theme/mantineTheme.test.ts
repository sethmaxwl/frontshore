import { describe, expect, it } from 'vitest'

import { mantineTheme } from '@/app/theme/mantineTheme'

function getRelativeLuminance(hexColor: string): number {
  const channels = hexColor.match(/[0-9a-f]{2}/gi)

  if (!channels) {
    throw new Error(`Invalid hex color: ${hexColor}`)
  }

  return channels
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.039_28
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce(
      (luminance, channel, index) =>
        luminance + [0.2126, 0.7152, 0.0722][index] * channel,
      0,
    )
}

function getContrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [
    getRelativeLuminance(foreground),
    getRelativeLuminance(background),
  ].toSorted((left, right) => right - left)

  return (lighter + 0.05) / (darker + 0.05)
}

describe('mantineTheme', () => {
  it('keeps dimmed text readable on dark surfaces', () => {
    const darkPalette = mantineTheme.colors?.dark

    if (!darkPalette) {
      throw new Error('Expected a dark palette in the Mantine theme')
    }

    const dimmed = darkPalette[2]
    const cardSurface = darkPalette[6]
    const pageSurface = darkPalette[7]

    expect(getContrastRatio(dimmed, cardSurface)).toBeGreaterThanOrEqual(4.5)
    expect(getContrastRatio(dimmed, pageSurface)).toBeGreaterThanOrEqual(4.5)
  })

  it('underlines anchors by default so inline links are not color-only cues', () => {
    expect(mantineTheme.components?.Anchor?.defaultProps).toMatchObject({
      underline: 'always',
    })
  })
})
