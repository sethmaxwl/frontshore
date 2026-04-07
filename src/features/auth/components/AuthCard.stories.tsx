import type { Meta, StoryObj } from '@storybook/react-vite'

import { AuthCard } from '@/features/auth/components/AuthCard'

const meta = {
  title: 'Features/Auth/AuthCard',
  component: AuthCard,
  args: {
    description:
      'A focused authentication shell with Streamshore branding and room for form fields or verification copy.',
    title: 'Welcome back',
  },
} satisfies Meta<typeof AuthCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <AuthCard
      {...args}
      footer={
        <p>
          Footer copy can link to reset, registration, or verification flows.
        </p>
      }
    >
      <div>
        <p>Form fields render here in the real app.</p>
      </div>
    </AuthCard>
  ),
}
