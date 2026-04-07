import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { baseButtonStyles, buttonStyles } from '../primitives/styles.ts'

import { ConfirmDialog } from '@/components/overlays/ConfirmDialog'

const meta = {
  title: 'Components/Overlays/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    confirmLabel: 'Delete room',
    description:
      'Everyone currently watching will be disconnected immediately.',
    onConfirm: () => {},
    onOpenChange: () => {},
    open: false,
    title: 'Delete Midnight Tides?',
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Danger: Story = {
  render: (args) => {
    function Example() {
      const [open, setOpen] = useState(false)

      return (
        <ConfirmDialog
          {...args}
          onConfirm={() => {
            setOpen(false)
          }}
          onOpenChange={setOpen}
          open={open}
        >
          <button
            css={[baseButtonStyles, buttonStyles.danger]}
            onClick={() => {
              setOpen(true)
            }}
            type="button"
          >
            Open dialog
          </button>
        </ConfirmDialog>
      )
    }

    return <Example />
  },
}
