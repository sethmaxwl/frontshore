import type { CssFunction } from '@compiled/react'

type CompiledCssProp = CssFunction<void> | CssFunction<void>[]

declare module 'react' {
  interface Attributes {
    css?: CompiledCssProp
  }
}

export {}
