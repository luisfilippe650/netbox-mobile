import { t, useLanguage } from "../../i18n/language";
import logo from "../../assets/logos/logoDatacenterManager.png";
import wordmark from "../../assets/logos/Logo Datacenter Manager sem ícone.png";
import {useState} from "react";
import "../../utils/colors.css";
import "./Login.css";

type LoginProps = {
    initialError?: string;
    onLogin: (username: string, password: string) => Promise<void>;
};

export default function Login({initialError = "", onLogin}: LoginProps) {
    const {language} = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    return (
        <main className="login-page" lang={language === "pt" ? "pt-BR" : "en"}>
            <section className="login-card" aria-labelledby="login-title">
                <header className="login-card__header">
                    <div className="login-card__heading">
                        <div className="login-logo-frame">
                            <img src={logo} alt="Datacenter Manager" className="logo"/>
                        </div>
                        <h1 id="login-title">
                            <span>Datacenter</span>
                            <small>Manager</small>
                        </h1>
                    </div>
                    <div className="login-decoration" aria-hidden="true">
                        <span className="login-decoration__circle login-decoration__circle--large"/>
                        <span className="login-decoration__circle login-decoration__circle--small"/>
                        <span className="login-decoration__ring"/>
                    </div>
                </header>

                <div className="login-card__body">
                    <div className="login-intro">
                        <h2>{t("Welcome")}</h2>
                        <p>{t("Sign in with your account")}</p>
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
                                        : "Unable to sign in to NetBox.",
                                );
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        <div className="login-field">
                            <label htmlFor="username">{t("Username")}</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                placeholder={t("Enter your username")}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">{t("Password")}</label>
                            <div className="login-password-input">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder={t("Enter your password")}
                                    required
                                />
                                <button
                                    className="login-password-toggle"
                                    type="button"
                                    aria-label={t(showPassword ? "Hide password" : "Show password")}
                                    aria-pressed={showPassword}
                                    onClick={() => setShowPassword((visible) => !visible)}
                                >
                                    {t(showPassword ? "Hide" : "Show")}
                                </button>
                            </div>
                        </div>

                        {error || initialError ? (
                            <p className="login-error" role="alert">
                                {t(error || initialError)}
                            </p>
                        ) : null}

                        <button
                            className="login-submit"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {t(isSubmitting ? "Signing in…" : "Sign in")}
                        </button>
                    </form>

                    <div className="login-institution">
                        <img src={wordmark} alt="Datacenter Manager"/>
                    </div>
                </div>
            </section>
        </main>
    );
}
