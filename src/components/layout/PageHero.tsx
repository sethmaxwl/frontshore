import { Badge, Box, Container, Group, Stack, Text, Title } from '@mantine/core'
import type { JSX, PropsWithChildren, ReactNode } from 'react'

type PageHeroProps = PropsWithChildren<{
  actions?: ReactNode
  eyebrow?: string
  subtitle?: string
  title: string
  description: string
}>

export function PageHero({
  actions,
  eyebrow,
  title,
  description,
  subtitle,
  children,
}: PageHeroProps): JSX.Element {
  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="lg">
        <Stack gap="sm" style={{ minWidth: 0, flex: 1 }}>
          {eyebrow ? (
            <Badge variant="light" radius="xl" size="lg">
              {eyebrow}
            </Badge>
          ) : null}
          <Title order={1}>{title}</Title>
          <Text size="lg">{description}</Text>
          {subtitle ? (
            <Text c="dimmed" size="sm">
              {subtitle}
            </Text>
          ) : null}
        </Stack>
        {actions ? (
          <Group gap="sm" wrap="wrap">
            {actions}
          </Group>
        ) : null}
      </Group>
      <Box mt="xl">{children}</Box>
    </Container>
  )
}
