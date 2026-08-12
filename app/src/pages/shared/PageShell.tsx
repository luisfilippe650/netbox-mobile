import type { ReactNode } from 'react'

type PageShellProps = {
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
}

export function PageShell({ eyebrow, title, subtitle, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <section className="page-shell__frame">
        <header className="page-shell__hero">
          <p className="page-shell__eyebrow">{eyebrow}</p>
          <h1 className="page-shell__title">{title}</h1>
          {subtitle ? <p className="page-shell__subtitle">{subtitle}</p> : null}
        </header>
        {children}
      </section>
    </main>
  )
}
