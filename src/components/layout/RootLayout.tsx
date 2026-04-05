import { NavLink, Outlet } from 'react-router-dom'

const navigationItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
]

export function RootLayout() {
  return (
    <div className="app-frame">
      <nav className="app-nav" aria-label="Primary">
        <div className="app-nav__inner">
          <NavLink to="/" end className="app-nav__brand">
            Frontshore
          </NavLink>
          <div className="app-nav__links">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `app-nav__link${isActive ? ' app-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
