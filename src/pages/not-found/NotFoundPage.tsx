import { AppShell } from '@/components/layout/AppShell'
import { Link } from 'react-router-dom'
import '@/features/home/home-page.css'

export function NotFoundPage() {
  return (
    <AppShell
      eyebrow="404"
      title="That route does not exist"
      description="The router is active, but this URL is not mapped to a page yet."
    >
      <section className="info-card">
        <div className="info-card__content">
          <h2>Try one of the starter routes</h2>
          <p>
            You can head back to the home page or use this as the spot for a
            branded not-found experience.
          </p>
          <Link className="info-card__link" to="/">
            Go home
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
