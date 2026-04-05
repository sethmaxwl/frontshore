import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeroCard } from '@/features/home/components/HeroCard'
import '@/features/home/home-page.css'

const meta = {
  title: 'Features/Home/HeroCard',
  component: HeroCard,
} satisfies Meta<typeof HeroCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
