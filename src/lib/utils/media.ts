export function formatVideoDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  const minuteSection = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const secondSection = String(seconds).padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${minuteSection}:${secondSection}`
  }

  return `${minuteSection}:${secondSection}`
}

export function decodeHtmlEntities(value: string): string {
  if (typeof document === 'undefined') {
    return value
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value

  return textarea.value
}

export function extractYouTubeVideoId(value: string): string | null {
  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return null
  }

  if (/^[\w-]{11}$/u.test(trimmedValue)) {
    return trimmedValue
  }

  try {
    const parsedUrl = new URL(trimmedValue)

    if (parsedUrl.hostname.includes('youtu.be')) {
      return parsedUrl.pathname.replace('/', '')
    }

    return parsedUrl.searchParams.get('v')
  } catch {
    return null
  }
}
