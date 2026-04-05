import heroImage from '@/assets/hero.png'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'

const highlights = [
  'App shell and route entrypoints',
  'Feature-focused page organization',
  'Shared styling tokens and aliases',
]

export function HeroCard() {
  return (
    <section className="hero-card">
      <div className="hero-card__visual">
        <img
          src={heroImage}
          className="hero-card__base"
          width="170"
          height="179"
          alt=""
        />
        <img
          src={reactLogo}
          className="hero-card__framework"
          alt="React logo"
        />
        <img src={viteLogo} className="hero-card__bundler" alt="Vite logo" />
      </div>
      <div className="hero-card__copy">
        <p className="hero-card__lead">
          A starter structure that is ready for routing, providers, shared UI,
          and feature work without needing to reorganize the app later.
        </p>
        <ul className="hero-card__highlights">
          {highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
