import { PageShell } from "../../components/PageShell/PageShell";
import { useState } from "react";
import scannerIcon from "../../assets/icons/leitura_automatica.png";
import searchIcon from "../../assets/icons/tipos_de_objetos.png";
import listIcon from "../../assets/icons/inserir_id_manualmente.png";
import rackIcon from "../../assets/icons/criar_rack.png";
import rowIcon from "../../assets/icons/row_icone.png";
import coidsLogo from "../../assets/logos/logo-coids.png";
import inpeLogo from "../../assets/logos/Logo_INPE_maior.jpg";
import type { NetBoxRack } from "../../services";
import type { DeviceSummary } from "../devices/devices-data";
import "./home.css";

type HomeProps = {
  onLogout: () => void;
  devices: readonly DeviceSummary[];
  racks: readonly NetBoxRack[];
  onSelectDevice: (device: DeviceSummary) => void;
  onDelete: (kind: DeleteKind, id: number) => Promise<void>;
  onOpenPage: (
    page:
      | "scanner"
      | "devices"
      | "add-device"
      | "add-device-type"
      | "device-types"
      | "manufacturers"
      | "device-functions"
      | "rack-info"
      | "add-rack"
      | "add-rack-group"
      | "rack-groups"
      | "rack-roles"
      | "sites"
      | "locations"
      | "regions",
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
  | "devices"
  | "add-device"
  | "add-device-type"
  | "device-types"
  | "manufacturers"
  | "device-functions"
  | "device"
  | "rack-info"
  | "add-rack"
  | "add-rack-group"
  | "rack-groups"
  | "rack-roles"
  | "organizacao"
  | "sites"
  | "locations"
  | "regions";

type NavigableHomePage = Exclude<
  HomePage,
  "organizacao" | "object-info" | "device"
>;

type ActionOption = {
  label: string;
  page?: NavigableHomePage;
  tone?: "success" | "danger";
};

export type DeleteKind = "rack";

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
] as const;

const deviceOptions: readonly ActionOption[] = [
  { label: "Visualizar dispositivos", page: "devices" },
  { label: "Adicionar dispositivos", page: "add-device", tone: "success" },
  { label: "Fabricantes", page: "manufacturers" },
  { label: "Funções de dispositivos", page: "device-functions" },
  { label: "Tipos de dispositivos", page: "device-types" },
];

const rackOptions: readonly ActionOption[] = [
  { label: "Visualizar racks", page: "rack-info" },
  { label: "Adicionar rack", page: "add-rack", tone: "success" },
  { label: "Grupos de racks", page: "rack-groups" },
  { label: "Funções de racks", page: "rack-roles" },
];

const organizationOptions: readonly ActionOption[] = [
  { label: "Sites", page: "sites" },
  { label: "Locais", page: "locations" },
  { label: "Regiões", page: "regions" },
];

export default function Home({
  onLogout,
  devices,
  racks,
  onSelectDevice,
  onDelete,
  onOpenPage,
}: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<HomeAction | null>(null);
  const [deleteKind, setDeleteKind] = useState<DeleteKind | null>(null);
  const [deleteSelection, setDeleteSelection] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deviceSearchBy, setDeviceSearchBy] = useState<"name" | "id">("name");
  const [deviceSearchTerm, setDeviceSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const normalizedDeviceSearch = deviceSearchTerm
    .trim()
    .toLocaleLowerCase("pt-BR");
  const deviceSearchResults = normalizedDeviceSearch
    ? devices.filter((device) => {
        const value = deviceSearchBy === "id" ? device.id : device.name;
        return value
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedDeviceSearch);
      })
    : [];
  const deleteOptions = deleteKind === "rack"
    ? racks.map((item) => ({ id: item.id, label: item.name }))
    : [];
  const deleteSelectionLabel = deleteOptions.find((item) => String(item.id) === deleteSelection)?.label ?? "";

  const openActionOptions = (action: HomeAction) => {
    setSelectedAction(action);
  };

  const closeActionOptions = () => {
    setSelectedAction(null);
    setDeleteKind(null);
    setDeleteSelection("");
    setConfirmDelete(false);
    setDeleteMessage("");
    setDeleteError("");
    setDeviceSearchBy("name");
    setDeviceSearchTerm("");
  };

  const openDeleteSelection = (kind: DeleteKind) => {
    setDeleteKind(kind);
    setDeleteSelection("");
    setConfirmDelete(false);
    setDeleteMessage("");
    setDeleteError("");
  };

  const finishDeletion = async () => {
    if (!deleteKind || !deleteSelection) return;
    setIsDeleting(true); setDeleteError("");
    try {
      await onDelete(deleteKind, Number(deleteSelection));
      setConfirmDelete(false); setDeleteMessage("Item excluído com sucesso.");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Não foi possível excluir o item.");
    } finally { setIsDeleting(false); }
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
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setAboutOpen(true);
                }}
              >
                Sobre
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setHelpOpen(true);
                }}
              >
                Como usar
              </button>
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
            onClick={() => onOpenPage("scanner")}
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
                title: "Buscar dispositivo",
                text: "Pesquise pelo nome ou ID",
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
              action.key === "organizacao" ? (
                <span
                  className={`home__icon ${action.key === "rack-info" ? "home__icon--rack" : action.key === "organizacao" ? "home__icon--row" : "home__icon--large"}`}
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

      {aboutOpen ? (
        <div
          className="home__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAboutOpen(false);
          }}
        >
          <section
            className="home__modal home__about"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-about-title"
          >
            <span className="home__modal-handle" aria-hidden="true" />
            <button
              className="home__modal-close"
              type="button"
              aria-label="Fechar informações sobre o aplicativo"
              onClick={() => setAboutOpen(false)}
            >
              ×
            </button>
            <img className="home__about-logo" src={coidsLogo} alt="COIDS" />
            <h2 id="home-about-title">Sobre o aplicativo</h2>
            <p>
              O Gerenciador de Datacenter foi criado para facilitar o cadastro e
              a consulta de dispositivos, racks, sites e locais da
              infraestrutura do INPE.
            </p>
            <p>
              Pelo aplicativo, você pode organizar equipamentos, acompanhar a
              ocupação dos racks e consultar informações usando a busca ou o
              scanner de QR Code.
            </p>
            <p>
              O aplicativo permite realizar ações rápidas de cadastro no NetBox.
              Para operações mais complexas ou configurações avançadas, utilize
              diretamente o NetBox.
            </p>
            <button
              className="home__about-close"
              type="button"
              onClick={() => setAboutOpen(false)}
            >
              Fechar
            </button>
          </section>
        </div>
      ) : null}

      {helpOpen ? (
        <div
          className="home__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false);
          }}
        >
          <section
            className="home__modal home__help"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-help-title"
          >
            <span className="home__modal-handle" aria-hidden="true" />
            <button
              className="home__modal-close"
              type="button"
              aria-label="Fechar instruções de uso"
              onClick={() => setHelpOpen(false)}
            >
              ×
            </button>
            <span className="home__help-icon" aria-hidden="true">
              ?
            </span>
            <h2 id="home-help-title">Como usar</h2>
            <p className="home__help-intro">
              Use o aplicativo para cadastros rápidos. Campos marcados como
              obrigatórios precisam ser preenchidos antes de salvar.
            </p>

            <article className="home__help-card">
              <h3>Criar um rack</h3>
              <ol>
                <li>
                  Selecione o <strong>site</strong>. Esse campo é obrigatório.
                </li>
                <li>
                  Escolha um <strong>local</strong> vinculado ao site
                  selecionado, se necessário.
                </li>
                <li>Informe opcionalmente o grupo de racks e a descrição.</li>
                <li>
                  Digite o <strong>nome</strong> do rack.
                </li>
                <li>
                  Escolha a <strong>largura</strong>: 10, 19, 21 ou 23 inches. O
                  padrão é 19 inches.
                </li>
                <li>
                  Confira a <strong>unidade inicial</strong>, padrão 1, e a{" "}
                  <strong>altura</strong>, padrão 42U.
                </li>
              </ol>
              <p>
                Site, nome, largura, unidade inicial e altura são obrigatórios.
              </p>
            </article>

            <article className="home__help-card">
              <h3>Criar um dispositivo</h3>
              <ol>
                <li>Informe o nome e, se desejar, uma descrição.</li>
                <li>
                  Selecione a <strong>função</strong> e o{" "}
                  <strong>tipo do dispositivo</strong>.
                </li>
                <li>
                  Selecione o <strong>site</strong>. Os locais disponíveis serão
                  filtrados por ele.
                </li>
                <li>
                  Escolha o local e informe o rack e a posição, quando
                  aplicável.
                </li>
                <li>
                  Antes de salvar, confira se a posição desejada está livre no
                  rack.
                </li>
              </ol>
              <p>Função, tipo do dispositivo e site são obrigatórios.</p>
            </article>

            <aside className="home__help-note">
              Para operações mais complexas e configurações avançadas, utilize
              diretamente o NetBox.
            </aside>
            <button
              className="home__about-close"
              type="button"
              onClick={() => setHelpOpen(false)}
            >
              Entendi
            </button>
          </section>
        </div>
      ) : null}

      {selectedAction ? (
        <div
          className="home__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeActionOptions();
          }}
        >
          <section
            className={`home__modal${selectedAction.key === "object-info" ? " home__modal--device-search" : ""}`}
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
            <span className="home__modal-icon home__modal-icon--contained">
              <img src={selectedAction.icon} alt="" />
            </span>
            <h2 id="home-action-title">{selectedAction.title}</h2>
            <p>{selectedAction.text}</p>
            {deleteKind ? (
              <div className="home__delete-flow">
                {deleteMessage ? (
                  <div className="home__delete-message" role="status">
                    <span aria-hidden="true">✓</span>
                    <strong>{deleteMessage}</strong>
                    <button type="button" onClick={closeActionOptions}>
                      OK
                    </button>
                  </div>
                ) : confirmDelete ? (
                  <div
                    className="home__delete-confirmation"
                    role="alertdialog"
                    aria-labelledby="home-delete-title"
                  >
                    <strong id="home-delete-title">
                      Tem certeza que deseja excluir?
                    </strong>
                    <span>{deleteSelectionLabel}</span>
                    {deleteError ? <small className="home__delete-error" role="alert">{deleteError}</small> : null}
                    <div>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="home__delete-confirm"
                        type="button"
                        disabled={isDeleting}
                        onClick={() => void finishDeletion()}
                      >
                        {isDeleting ? "Excluindo…" : "Excluir"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="home__delete-select">
                      <span>
                        Selecione o item
                      </span>
                      <select
                        value={deleteSelection}
                        onChange={(event) =>
                          setDeleteSelection(event.target.value)
                        }
                      >
                        <option value="">Selecione uma opção</option>
                        {deleteOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="home__delete-controls">
                      <button type="button" onClick={() => setDeleteKind(null)}>
                        Voltar
                      </button>
                      <button
                        type="button"
                        disabled={!deleteSelection}
                        onClick={() => setConfirmDelete(true)}
                      >
                        OK
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : selectedAction.key === "object-info" ? (
              <div className="home__device-search">
                <div
                  className="home__device-search-modes"
                  role="group"
                  aria-label="Pesquisar dispositivo por"
                >
                  <button
                    className={
                      deviceSearchBy === "name"
                        ? "home__device-search-mode home__device-search-mode--active"
                        : "home__device-search-mode"
                    }
                    type="button"
                    aria-pressed={deviceSearchBy === "name"}
                    onClick={() => {
                      setDeviceSearchBy("name");
                      setDeviceSearchTerm("");
                    }}
                  >
                    Nome
                  </button>
                  <button
                    className={
                      deviceSearchBy === "id"
                        ? "home__device-search-mode home__device-search-mode--active"
                        : "home__device-search-mode"
                    }
                    type="button"
                    aria-pressed={deviceSearchBy === "id"}
                    onClick={() => {
                      setDeviceSearchBy("id");
                      setDeviceSearchTerm("");
                    }}
                  >
                    ID
                  </button>
                </div>
                <label className="home__device-search-field">
                  <span>{deviceSearchBy === "id" ? "ID" : "Nome"}</span>
                  <input
                    type="search"
                    inputMode={deviceSearchBy === "id" ? "numeric" : "search"}
                    autoFocus
                    value={deviceSearchTerm}
                    onChange={(event) =>
                      setDeviceSearchTerm(event.target.value)
                    }
                    placeholder={
                      deviceSearchBy === "id" ? "Digite o ID" : "Digite o nome"
                    }
                  />
                </label>
                {normalizedDeviceSearch ? (
                  <div
                    className="home__device-search-results"
                    aria-live="polite"
                  >
                    {deviceSearchResults.length > 0 ? (
                      deviceSearchResults.map((device) => (
                        <button
                          type="button"
                          key={device.id}
                          onClick={() => {
                            onSelectDevice(device);
                            closeActionOptions();
                          }}
                        >
                          <strong>
                            {deviceSearchBy === "id"
                              ? `ID ${device.id}`
                              : device.name}
                          </strong>
                          <small>
                            {deviceSearchBy === "id"
                              ? device.name
                              : `ID ${device.id}`}
                          </small>
                        </button>
                      ))
                    ) : (
                      <p>Nenhum dispositivo encontrado.</p>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="home__modal-actions">
                {selectedAction.key === "device" ||
                selectedAction.key === "rack-info" ||
                selectedAction.key === "organizacao"
                  ? (selectedAction.key === "device"
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
                          if (option.label === "Deletar rack") {
                            openDeleteSelection("rack");
                            return;
                          }
                          if (option.page) onOpenPage(option.page);
                          closeActionOptions();
                        }}
                      >
                        {option.label}
                      </button>
                    ))
                  : null}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
