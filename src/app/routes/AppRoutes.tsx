import { AppProviders } from '@/app/providers/AppProviders'
import { RootLayout } from '@/components/layout/RootLayout'
import { AboutPage } from '@/pages/about/AboutPage'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRoutes() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
