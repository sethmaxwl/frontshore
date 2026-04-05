import '@testing-library/jest-dom/vitest'

import { toHaveCompiledCss } from '@compiled/jest'
import { expect } from 'vitest'

expect.extend({ toHaveCompiledCss })

type CompiledMatchFilter = {
  media?: string
  target?: string
}

declare module 'vitest' {
  // Match jest-dom's existing Vitest augmentation signature.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveCompiledCss(
      properties: Record<string, string>,
      matchFilter?: CompiledMatchFilter,
    ): T
    toHaveCompiledCss(
      property: string,
      value: string,
      matchFilter?: CompiledMatchFilter,
    ): T
  }

  interface AsymmetricMatchersContaining {
    toHaveCompiledCss(
      properties: Record<string, string>,
      matchFilter?: CompiledMatchFilter,
    ): void
    toHaveCompiledCss(
      property: string,
      value: string,
      matchFilter?: CompiledMatchFilter,
    ): void
  }
}
