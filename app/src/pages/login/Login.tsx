import logo from "../../assets/logos/logo-coids-sem-texto.png";
import inpe from "../../assets/logos/Logo_INPE_maior.jpg";
import { useState } from "react";
import "../../utils/colors.css";
import "./login.css";

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);

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
            <h2>Bem-vindo de volta</h2>
            <p>Entre com sua conta constitucional</p>
          </div>

          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin();
            }}
          >
            <div className="login-field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Digite seu e-mail"
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

            <button className="login-submit" type="submit">
              Entrar
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
