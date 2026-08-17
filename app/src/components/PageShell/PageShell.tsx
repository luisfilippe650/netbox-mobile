import type { ReactNode } from "react";

const pageShellStyles = `
.page-shell,
.page-shell * {
  box-sizing: border-box;
}

.page-shell {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background: #f4f6fb;
  color: var(--font-color);
}

.page-shell__frame {
  width: min(100%, 480px);
  min-height: 100vh;
  padding: max(12px, env(safe-area-inset-top)) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.page-shell__content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 16px 14px 24px;
  box-sizing: border-box;
}

.page-shell__hero {
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  border-radius: 30px;
  padding: 22px 20px;
  color: var(--font-color-on-primary);
  background: var(--primary-color);
  box-shadow: 0 8px 18px rgba(13, 15, 26, 0.1);
}

.page-shell__eyebrow {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.82;
}

.page-shell__title {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.02;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.page-shell__subtitle {
  margin: 10px 0 0;
  font-size: 0.98rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

.page-shell:not(.home-page) .page-shell__frame {
  width: min(100%, 460px);
}

.page-shell:not(.home-page) .page-shell__content {
  gap: 12px;
  padding: 14px 13px 22px;
}

.page-shell:not(.home-page) .page-shell__hero {
  padding: 19px 18px;
  border-radius: 14px;
}

.page-shell:not(.home-page) .page-shell__eyebrow {
  margin-bottom: 6px;
  font-size: 0.68rem;
}

.page-shell:not(.home-page) .page-shell__title {
  font-size: 1.72rem;
  line-height: 1.05;
}

.page-shell:not(.home-page) .page-shell__subtitle {
  margin-top: 8px;
  font-size: 0.9rem;
  line-height: 1.45;
}

.page-shell.home-page .page-shell__hero {
  border-radius: 14px;
}

@media (max-width: 360px) {
  .page-shell__content {
    padding-inline: 12px;
  }

  .page-shell__hero {
    padding: 18px 16px;
  }

  .page-shell__title {
    font-size: 1.6rem;
  }

  .page-shell:not(.home-page) .page-shell__content {
    padding: 12px 11px 20px;
  }

  .page-shell:not(.home-page) .page-shell__hero {
    padding: 16px 14px;
  }

  .page-shell:not(.home-page) .page-shell__title {
    font-size: 1.5rem;
  }
}
`;

type PageShellProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  brand?: {
    logo: string;
    name: string;
    subtitle?: string;
  };
  headerAction?: ReactNode;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  subtitle,
  className,
  brand,
  headerAction,
  children,
}: PageShellProps) {
  return (
    <main className={`page-shell ${className ?? ""}`.trim()}>
      <style>{pageShellStyles}</style>
      <section className="page-shell__frame">
        <header className="page-shell__hero">
          {brand ? (
            <div className="page-shell__brand">
              <img src={brand.logo} alt="" />
              <strong>
                <span>{brand.name}</span>
                {brand.subtitle ? <small>{brand.subtitle}</small> : null}
              </strong>
            </div>
          ) : null}
          {headerAction ? (
            <div className="page-shell__header-action">{headerAction}</div>
          ) : null}
          {eyebrow ? <p className="page-shell__eyebrow">{eyebrow}</p> : null}
          {title ? <h1 className="page-shell__title">{title}</h1> : null}
          {subtitle ? <p className="page-shell__subtitle">{subtitle}</p> : null}
        </header>
        <div className="page-shell__content">{children}</div>
      </section>
    </main>
  );
}
