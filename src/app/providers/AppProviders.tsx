import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { JSX, PropsWithChildren } from 'react'

import { AuthProvider } from '@/app/providers/AuthProvider'
import { mantineTheme } from '@/app/theme/mantineTheme'

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 0,
    },
    queries: {
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
})

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'streamshore:v1:mantine-color-scheme',
})

export function AppProviders({ children }: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={mantineTheme}
        defaultColorScheme="dark"
        colorSchemeManager={colorSchemeManager}
      >
        <ModalsProvider>
          <Notifications position="bottom-right" />
          <AuthProvider>{children}</AuthProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
