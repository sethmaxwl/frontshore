const storagePrefix = 'streamshore:v1'

export const storageKeys = {
  auth: 'auth-session',
  playerVolume: 'player-volume',
  theme: 'theme-mode',
} as const

function getStorageKey(key: string): string {
  return `${storagePrefix}:${key}`
}

function hasWindow(): boolean {
  return 'window' in globalThis
}

export function loadStoredValue<T>(key: string, fallback: T): T {
  if (!hasWindow()) {
    return fallback
  }

  const rawValue = globalThis.window.localStorage.getItem(getStorageKey(key))

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

export function saveStoredValue<T>(key: string, value: T): void {
  if (!hasWindow()) {
    return
  }

  globalThis.window.localStorage.setItem(
    getStorageKey(key),
    JSON.stringify(value),
  )
}

export function removeStoredValue(key: string): void {
  if (!hasWindow()) {
    return
  }

  globalThis.window.localStorage.removeItem(getStorageKey(key))
}
