import { Center, Loader } from '@mantine/core'
import { Suspense, lazy } from 'react'
import type { JSX, LazyExoticComponent } from 'react'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppProviders } from '@/app/providers/AppProviders'
import { GuestOnlyRoute, ProtectedRoute } from '@/app/routes/RouteGuards'
import { RootLayout } from '@/components/layout/RootLayout'

const rootLayoutElement: JSX.Element = <RootLayout />

const LandingPage = lazy(() => import('@/pages/rooms/LandingPage'))
const CreateRoomPage = lazy(() => import('@/pages/rooms/CreateRoomPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const VerifyPage = lazy(() => import('@/pages/auth/VerifyPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const ResendVerificationPage = lazy(
  () => import('@/pages/auth/ResendVerificationPage'),
)
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/admin/AdminPage'))
const RoomPage = lazy(() => import('@/pages/room-session/RoomPage'))
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'))

function LazyRouteElement({
  component: Component,
}: {
  component: LazyExoticComponent<() => JSX.Element>
}): JSX.Element {
  return (
    <Suspense
      fallback={
        <Center h="50vh">
          <Loader />
        </Center>
      }
    >
      <Component />
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: rootLayoutElement,
    children: [
      {
        index: true,
        element: <LazyRouteElement component={LandingPage} />,
      },
      {
        path: 'search',
        element: <Navigate replace to="/" />,
      },
      {
        element: <GuestOnlyRoute />,
        children: [
          {
            path: 'login',
            element: <LazyRouteElement component={LoginPage} />,
          },
          {
            path: 'register',
            element: <LazyRouteElement component={RegisterPage} />,
          },
          {
            path: 'verify',
            element: <LazyRouteElement component={VerifyPage} />,
          },
          {
            path: 'forgot-password',
            element: <LazyRouteElement component={ForgotPasswordPage} />,
          },
          {
            path: 'reset',
            element: <LazyRouteElement component={ResetPasswordPage} />,
          },
          {
            path: 'resend-verification',
            element: <LazyRouteElement component={ResendVerificationPage} />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'create-room',
            element: <LazyRouteElement component={CreateRoomPage} />,
          },
          {
            path: 'profile',
            element: <LazyRouteElement component={ProfilePage} />,
          },
          {
            path: 'admin',
            element: <LazyRouteElement component={AdminPage} />,
          },
        ],
      },
      {
        path: ':room',
        element: <LazyRouteElement component={RoomPage} />,
      },
      {
        path: '404',
        element: <LazyRouteElement component={NotFoundPage} />,
      },
    ],
  },
  {
    path: '*',
    element: <LazyRouteElement component={NotFoundPage} />,
  },
])

export function AppRoutes(): JSX.Element {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
