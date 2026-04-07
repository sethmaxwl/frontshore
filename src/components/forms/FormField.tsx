import { css } from '@compiled/react'
import type { JSX, PropsWithChildren } from 'react'

const wrapperStyles = css({
  display: 'grid',
  gap: '0.55rem',
})

const labelStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '0.92rem',
  fontWeight: 700,
})

const hintStyles = css({
  color: 'var(--color-text-muted)',
  fontSize: '0.85rem',
  margin: 0,
})

const errorStyles = css({
  color: '#fda4af',
  fontSize: '0.85rem',
  margin: 0,
})

type FormFieldProps = PropsWithChildren<{
  error?: string
  hint?: string
  label: string
}>

export function FormField({
  children,
  error,
  hint,
  label,
}: FormFieldProps): JSX.Element {
  return (
    <label css={wrapperStyles}>
      <span css={labelStyles}>{label}</span>
      {children}
      {hint ? <p css={hintStyles}>{hint}</p> : null}
      {error ? <p css={errorStyles}>{error}</p> : null}
    </label>
  )
}
