import type { JSX } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppProviders } from '@/app/providers/AppProviders'
import { RootLayout } from '@/components/layout/RootLayout'
import { AboutPage } from '@/pages/about/AboutPage'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

const rootLayoutElement: JSX.Element = <RootLayout />
const homePageElement: JSX.Element = <HomePage />
const aboutPageElement: JSX.Element = <AboutPage />
const notFoundPageElement: JSX.Element = <NotFoundPage />

const router = createBrowserRouter([
  {
    path: '/',
    element: rootLayoutElement,
    children: [
      {
        index: true,
        element: homePageElement,
      },
      {
        path: 'about',
        element: aboutPageElement,
      },
    ],
  },
  {
    path: '*',
    element: notFoundPageElement,
  },
])

export function AppRoutes(): JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
