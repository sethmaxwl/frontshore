import '@testing-library/jest-dom/vitest'

import { vi } from 'vitest'

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverStub

if (!globalThis.HTMLElement.prototype.scrollTo) {
  globalThis.HTMLElement.prototype.scrollTo = function scrollToStub(): void {}
}

if (!globalThis.HTMLElement.prototype.scrollIntoView) {
  globalThis.HTMLElement.prototype.scrollIntoView =
    function scrollIntoViewStub(): void {}
}
