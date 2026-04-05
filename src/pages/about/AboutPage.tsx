import { AppShell } from '@/components/layout/AppShell'
import { Link } from 'react-router-dom'
import '@/features/home/home-page.css'

export function AboutPage() {
  return (
    <AppShell
      eyebrow="Routing ready"
      title="React Router is now part of the app shell"
      description="The repo now uses a browser router with nested routes, a shared layout, and a dedicated place to grow page-level navigation."
    >
      <section className="info-card">
        <div className="info-card__content">
          <h2>What was added</h2>
          <p>
            The router lives in the app layer, navigation sits in a shared root
            layout, and route-specific content renders through an{' '}
            <code>Outlet</code>.
          </p>
          <p>
            This is a solid starting point for adding loaders, protected routes,
            nested sections, and route-level code splitting later.
          </p>
          <Link className="info-card__link" to="/">
            Back to home
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
