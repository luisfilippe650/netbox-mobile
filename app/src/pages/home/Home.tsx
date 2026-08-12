import { PageShell } from "../../components/PageShell/PageShell";
import { useState } from "react";
import scannerIcon from "../../assets/icons/leitura_automatica.png";
import searchIcon from "../../assets/icons/tipos_de_objetos.png";
import listIcon from "../../assets/icons/inserir_id_manualmente.png";
import rackIcon from "../../assets/icons/criar_rack.png";
import rowIcon from "../../assets/icons/row_icone.png";
import locationIcon from "../../assets/icons/conexao-icon.png";
import coidsLogo from "../../assets/logos/logo-coids.png";
import inpeLogo from "../../assets/logos/Logo_INPE_maior.jpg";
import "./home.css";

type HomeProps = {
  onLogout: () => void;
  onOpenPage: (
    page:
      | "scanner"
      | "object-info"
      | "object-list"
      | "device"
      | "rack-info"
      | "row-info"
      | "location-info",
  ) => void;
};

type HomeAction = {
  key: HomePage;
  title: string;
  text: string;
  icon: string;
};

type HomePage =
  | "scanner"
  | "object-info"
  | "device"
  | "rack-info"
  | "organizacao"
  | "location-info";

type NavigableHomePage = Exclude<HomePage, "organizacao">;

type ActionOption = {
  label: string;
  page?: NavigableHomePage;
  tone?: "success" | "danger";
};

const actions: readonly HomeAction[] = [
  {
    key: "device",
    title: "Dispositivos",
    text: "Gerencie os dispositivos",
    icon: listIcon,
  },
  {
    key: "rack-info",
    title: "Racks",
    text: "Gerencie os racks",
    icon: rackIcon,
  },
  {
    key: "organizacao",
    title: "Organização",
    text: "Gerencie o local do datacenter",
    icon: rowIcon,
  },
  {
    key: "location-info",
    title: "Conexões",
    text: "Gerencie as conexões",
    icon: locationIcon,
  },
] as const;

const deviceOptions: readonly ActionOption[] = [
  { label: "Visualizar dispositivos", page: "device" },
  { label: "Adicionar dispositivos", tone: "success" },
  { label: "Adicionar tipo de dispositivo", tone: "success" },
  { label: "Deletar dispositivos", tone: "danger" },
  { label: "Deletar tipos de dispositivos", tone: "danger" },
];

const rackOptions: readonly ActionOption[] = [
  { label: "Visualizar racks", page: "rack-info" },
  { label: "Adicionar rack", tone: "success" },
  { label: "Adicionar grupo de racks", tone: "success" },
  { label: "Adicionar tipos de racks", tone: "success" },
  { label: "Deletar rack", tone: "danger" },
  { label: "Deletar grupo de rack", tone: "danger" },
  { label: "Deletar tipo de rack", tone: "danger" },
];

const organizationOptions: readonly ActionOption[] = [
  { label: "Sites" },
  { label: "Locais" },
  { label: "Regiões" },
];

export default function Home({ onLogout, onOpenPage }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<HomeAction | null>(null);

  const openActionOptions = (action: HomeAction) => {
    setSelectedAction(action);
  };

  const closeActionOptions = () => {
    setSelectedAction(null);
  };

  return (
    <PageShell
      className="home-page"
      brand={{
        logo: coidsLogo,
        name: "Gerenciador",
        subtitle: "de Datacenter",
      }}
      headerAction={
        <div className="home__menu">
          <button
            className="home__menu-button"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          {menuOpen ? (
            <div className="home__menu-popover">
              <button type="button" onClick={onLogout}>
                Sair
              </button>
            </div>
          ) : null}
        </div>
      }
    >
      <section className="home__quick-section" aria-label="Ações rápidas">
        <h2 className="home__quick-title">Ações rápidas</h2>
        <div className="home__quick-actions">
          <button
            className="home__quick-action home__quick-action--primary"
            type="button"
            onClick={() =>
              openActionOptions({
                key: "scanner",
                title: "Scanner",
                text: "Leia um QR code",
                icon: scannerIcon,
              })
            }
          >
            <span className="home__quick-icon">
              <img src={scannerIcon} alt="" />
            </span>
            <span>
              <strong>Scanner</strong>
              <small>Leia um QR code</small>
            </span>
          </button>
          <button
            className="home__quick-action"
            type="button"
            onClick={() =>
              openActionOptions({
                key: "object-info",
                title: "Buscar Dispositivos",
                text: "Consulte detalhes",
                icon: searchIcon,
              })
            }
          >
            <span className="home__quick-icon">
              <img src={searchIcon} alt="" />
            </span>
            <span>
              <strong>Buscar dispositivo</strong>
              <small>Consulte detalhes</small>
            </span>
          </button>
        </div>
      </section>

      <section className="page-section home__section">
        <div className="home__section-heading">
          <div>
            <h2 className="page-section__title">Outras ações</h2>
          </div>
        </div>
        <div className="page-grid home__grid">
          {actions.map((action) => (
            <button
              key={action.key}
              className="home__card"
              type="button"
              onClick={() => openActionOptions(action)}
            >
              {action.key === "rack-info" ||
              action.key === "device" ||
              action.key === "location-info" ||
              action.key === "organizacao" ? (
                <span
                  className={`home__icon ${action.key === "rack-info" ? "home__icon--rack" : action.key === "organizacao" ? "home__icon--row" : action.key === "location-info" ? "home__icon--connections" : "home__icon--large"}`}
                >
                  <img src={action.icon} alt="" />
                </span>
              ) : (
                <img className="home__icon" src={action.icon} alt="" />
              )}
              <span className="home__card-content">
                <strong className="home__card-title">{action.title}</strong>
                <span className="page-section__text">{action.text}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <footer className="home__inpe-footer">
        <img src={inpeLogo} alt="Logo do INPE" />
        <span>Instituto Nacional de Pesquisas Espaciais</span>
      </footer>

      {selectedAction ? (
        <div
          className="home__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeActionOptions();
          }}
        >
          <section
            className="home__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-action-title"
          >
            <span className="home__modal-handle" aria-hidden="true" />
            <button
              className="home__modal-close"
              type="button"
              aria-label="Fechar opções"
              onClick={closeActionOptions}
            >
              ×
            </button>
            <span className={`home__modal-icon home__modal-icon--contained${selectedAction.key === "location-info" ? " home__modal-icon--connections" : ""}`}>
              <img src={selectedAction.icon} alt="" />
            </span>
            <h2 id="home-action-title">{selectedAction.title}</h2>
            <p>{selectedAction.text}</p>
            <div className="home__modal-actions">
              {selectedAction.key === "device" ||
              selectedAction.key === "rack-info" ||
              selectedAction.key === "organizacao" ? (
                (selectedAction.key === "device"
                  ? deviceOptions
                  : selectedAction.key === "rack-info"
                    ? rackOptions
                    : organizationOptions
                ).map((option, index) => (
                  <button
                    className={`home__modal-option${(selectedAction.key === "device" || selectedAction.key === "rack-info") && index === 0 ? " home__modal-option--primary" : ""}${option.tone ? ` home__modal-option--${option.tone}` : ""}`}
                    key={option.label}
                    type="button"
                    onClick={() => {
                      if (option.page) onOpenPage(option.page);
                      closeActionOptions();
                    }}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <button
                  className="home__modal-option home__modal-option--primary"
                  type="button"
                  onClick={() => {
                    if (selectedAction.key !== "organizacao") {
                      onOpenPage(selectedAction.key);
                    }
                    closeActionOptions();
                  }}
                >
                  Abrir {selectedAction.title}
                </button>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
