import type { Meta, StoryObj } from '@storybook/react-vite'

import { QuickLinks } from '@/features/home/components/QuickLinks'

const meta = {
  title: 'Features/Home/QuickLinks',
  component: QuickLinks,
} satisfies Meta<typeof QuickLinks>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
