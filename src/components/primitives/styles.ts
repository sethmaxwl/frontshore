import { css } from '@compiled/react'

const buttonDangerStyles = css({
  background:
    'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.88))',
  border: '1px solid rgba(254, 202, 202, 0.2)',
  boxShadow: 'var(--shadow-soft)',
  color: '#fff',
})

const buttonGhostStyles = css({
  background: 'transparent',
  border: '1px solid transparent',
  color: 'var(--color-text-muted)',
})

const buttonPrimaryStyles = css({
  background:
    'linear-gradient(135deg, rgba(34, 211, 238, 1), rgba(59, 130, 246, 0.88))',
  border: '1px solid rgba(125, 211, 252, 0.4)',
  boxShadow: 'var(--shadow-soft)',
  color: '#04111f',
})

const buttonSecondaryStyles = css({
  background: 'rgba(9, 18, 31, 0.44)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text-strong)',
})

const buttonSubtleStyles = css({
  background: 'rgba(15, 23, 42, 0.08)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  color: 'var(--color-text-strong)',
})

export const buttonStyles = {
  danger: buttonDangerStyles,
  ghost: buttonGhostStyles,
  primary: buttonPrimaryStyles,
  secondary: buttonSecondaryStyles,
  subtle: buttonSubtleStyles,
} as const

export const baseButtonStyles = css({
  alignItems: 'center',
  appearance: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  display: 'inline-flex',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  fontWeight: 700,
  gap: '0.55rem',
  justifyContent: 'center',
  minHeight: '2.8rem',
  padding: '0.75rem 1.1rem',
  textDecoration: 'none',
  transition:
    'transform 180ms ease, background 180ms ease, border-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.45,
    transform: 'none',
  },
  ':hover:not(:disabled)': {
    transform: 'translateY(-1px)',
  },
})

export const iconButtonStyles = css({
  alignItems: 'center',
  appearance: 'none',
  background: 'rgba(8, 17, 30, 0.42)',
  border: '1px solid var(--color-border)',
  borderRadius: '999px',
  color: 'var(--color-text-strong)',
  cursor: 'pointer',
  display: 'inline-flex',
  height: '2.6rem',
  justifyContent: 'center',
  width: '2.6rem',
  ':hover': {
    background: 'rgba(34, 211, 238, 0.15)',
    borderColor: 'rgba(34, 211, 238, 0.28)',
  },
})

const fieldInputStyles = css({
  background: 'rgba(7, 15, 28, 0.4)',
  border: '1px solid var(--color-border)',
  borderRadius: '20px',
  color: 'var(--color-text-strong)',
  fontFamily: 'inherit',
  fontSize: '0.98rem',
  minHeight: '3.2rem',
  padding: '0.95rem 1rem',
  width: '100%',
  '&:focus': {
    borderColor: 'rgba(34, 211, 238, 0.45)',
    boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.14)',
    outline: 'none',
  },
})

const fieldTextareaStyles = css({
  background: 'rgba(7, 15, 28, 0.4)',
  border: '1px solid var(--color-border)',
  borderRadius: '24px',
  color: 'var(--color-text-strong)',
  fontFamily: 'inherit',
  fontSize: '0.98rem',
  minHeight: '8rem',
  padding: '1rem',
  resize: 'vertical',
  width: '100%',
  '&:focus': {
    borderColor: 'rgba(34, 211, 238, 0.45)',
    boxShadow: '0 0 0 4px rgba(34, 211, 238, 0.14)',
    outline: 'none',
  },
})

export const fieldStyles = {
  input: fieldInputStyles,
  textarea: fieldTextareaStyles,
} as const

export const panelStyles = css({
  backdropFilter: 'blur(18px)',
  background:
    'linear-gradient(180deg, rgba(7, 15, 28, 0.84), rgba(8, 17, 30, 0.68))',
  border: '1px solid var(--color-border)',
  borderRadius: '28px',
  boxShadow: 'var(--shadow-panel)',
})

export const inlineLinkStyles = css({
  color: 'var(--color-accent)',
  fontWeight: 700,
  textDecoration: 'none',
  ':hover': {
    color: 'var(--color-accent-strong)',
  },
})
