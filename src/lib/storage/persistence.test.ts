import { beforeEach, describe, expect, it } from 'vitest'

import {
  loadStoredValue,
  removeStoredValue,
  saveStoredValue,
  storageKeys,
} from '@/lib/storage/persistence'

describe('persistence', () => {
  let storageEntries = new Map<string, string>()

  beforeEach(() => {
    storageEntries = new Map()

    Object.defineProperty(globalThis.window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storageEntries.get(key) ?? null,
        removeItem: (key: string) => {
          storageEntries.delete(key)
        },
        setItem: (key: string, value: string) => {
          storageEntries.set(key, value)
        },
      },
    })
  })

  it('round-trips namespaced values through local storage', () => {
    saveStoredValue(storageKeys.theme, 'light')

    expect(loadStoredValue(storageKeys.theme, 'dark')).toBe('light')
    expect(storageEntries.get('streamshore:v1:theme-mode')).toBe('"light"')
  })

  it('falls back for invalid or removed values', () => {
    storageEntries.set('streamshore:v1:custom', '{broken')

    expect(loadStoredValue('custom', 42)).toBe(42)

    saveStoredValue(storageKeys.playerVolume, 65)
    removeStoredValue(storageKeys.playerVolume)

    expect(loadStoredValue(storageKeys.playerVolume, 100)).toBe(100)
  })

  it('treats storage operations as no-ops when window is unavailable', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    )

    try {
      expect(Reflect.deleteProperty(globalThis, 'window')).toBe(true)

      expect(loadStoredValue(storageKeys.theme, 'dark')).toBe('dark')
      expect(() => {
        saveStoredValue(storageKeys.theme, 'light')
      }).not.toThrow()
      expect(() => {
        removeStoredValue(storageKeys.theme)
      }).not.toThrow()
    } finally {
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor)
      }
    }
  })
})
