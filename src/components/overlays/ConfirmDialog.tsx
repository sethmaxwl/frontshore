import { css } from '@compiled/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { JSX, PropsWithChildren } from 'react'

import {
  baseButtonStyles,
  buttonStyles,
  panelStyles,
} from '../primitives/styles.ts'

const overlayStyles = css({
  backdropFilter: 'blur(12px)',
  background: 'rgba(2, 6, 23, 0.7)',
  inset: 0,
  position: 'fixed',
  zIndex: 40,
})

const contentStyles = css({
  display: 'grid',
  gap: '1rem',
  left: '50%',
  maxWidth: '28rem',
  padding: '1.25rem',
  position: 'fixed',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'calc(100% - 2rem)',
  zIndex: 41,
})

const titleStyles = css({
  color: 'var(--color-text-strong)',
  fontSize: '1.1rem',
  fontWeight: 800,
  margin: 0,
})

const descriptionStyles = css({
  color: 'var(--color-text-muted)',
  margin: 0,
})

const footerStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  justifyContent: 'flex-end',
})

type ConfirmDialogProps = PropsWithChildren<{
  cancelLabel?: string
  confirmLabel?: string
  description: string
  onConfirm: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  tone?: 'danger' | 'primary'
  title: string
}>

export function ConfirmDialog({
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
  tone = 'danger',
  children,
}: ConfirmDialogProps): JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
      <Dialog.Portal>
        <Dialog.Overlay css={overlayStyles} />
        <Dialog.Content css={[panelStyles, contentStyles]}>
          <div>
            <Dialog.Title css={titleStyles}>{title}</Dialog.Title>
            <Dialog.Description css={descriptionStyles}>
              {description}
            </Dialog.Description>
          </div>
          <div css={footerStyles}>
            <Dialog.Close asChild>
              <button
                type="button"
                css={[baseButtonStyles, buttonStyles.secondary]}
              >
                {cancelLabel}
              </button>
            </Dialog.Close>
            {tone === 'primary' ? (
              <button
                type="button"
                css={[baseButtonStyles, buttonStyles.primary]}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            ) : (
              <button
                type="button"
                css={[baseButtonStyles, buttonStyles.danger]}
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
