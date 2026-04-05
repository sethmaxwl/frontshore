import { Link } from 'react-router-dom'

const links = [
  {
    title: 'Home route',
    body: 'The index route renders through the shared root layout so page content stays separate from app chrome.',
    to: '/',
    label: 'View home',
  },
  {
    title: 'Nested route',
    body: 'A second page is already wired so adding sections and route groups has a clear pattern to follow.',
    to: '/about',
    label: 'View about',
  },
  {
    title: 'Not-found route',
    body: 'Unknown URLs now land on a dedicated 404 screen instead of silently breaking the app experience.',
    to: '/missing',
    label: 'View 404',
  },
]

export function QuickLinks() {
  return (
    <section className="link-grid" aria-label="Project structure overview">
      {links.map((link) => (
        <article key={link.title} className="link-card">
          <h2>{link.title}</h2>
          <p>{link.body}</p>
          <Link to={link.to}>{link.label}</Link>
        </article>
      ))}
    </section>
  )
}
