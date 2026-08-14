import logo from "../../assets/logos/logo-coids-sem-texto.png";
import inpe from "../../assets/logos/Logo_INPE_maior.png";
import { useState } from "react";
import "../../utils/colors.css";
import "./Login.css";

type LoginProps = {
  onLogin: (username: string, password: string) => Promise<void>;
};

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-card__header">
          <div className="login-card__heading">
            <img src={logo} alt="Logo COIDS" className="logo" />
            <h1 id="login-title">
              <span>Gerenciador</span>
              <small>Datacenter</small>
            </h1>
          </div>
          <div className="login-decoration" aria-hidden="true">
            <span className="login-decoration__circle login-decoration__circle--large" />
            <span className="login-decoration__circle login-decoration__circle--small" />
            <span className="login-decoration__ring" />
          </div>
        </header>

        <div className="login-card__body">
          <div className="login-intro">
            <h2>Bem-vindo</h2>
            <p>Entre com sua conta institucional</p>
          </div>

          <form
            className="login-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSubmitting(true);
              setError("");
              const data = new FormData(event.currentTarget);
              try {
                await onLogin(
                  String(data.get("username") ?? ""),
                  String(data.get("password") ?? ""),
                );
              } catch (loginError) {
                setError(
                  loginError instanceof Error
                    ? loginError.message
                    : "Não foi possível entrar no NetBox.",
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="login-field">
              <label htmlFor="username">Usuário</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Digite seu usuário"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Senha</label>
              <div className="login-password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Conectando…" : "Entrar"}
            </button>
          </form>

          <div className="login-institution">
            <img src={inpe} alt="Logo INPE" />
            <span className="login-institution__divider" aria-hidden="true" />
            <span>Instituto Nacional de Pesquisas Espaciais</span>
          </div>
        </div>
      </section>
    </main>
  );
}
