import type { PropsWithChildren } from 'react'

type AppShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
}>

export function AppShell({
  eyebrow,
  title,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" aria-hidden="true" />
      <header className="app-shell__header">
        <span className="app-shell__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <main className="app-shell__content">{children}</main>
    </div>
  )
}
