import { format, t, useLanguage } from "../../i18n/language";
import {PageShell} from "../../components/PageShell/PageShell";
import {useAccess} from "../../context/AccessContext";
import {useModalFocus} from "../../hooks/useModalFocus";
import {AppIcon, type AppIconName} from "../../components/AppIcon/AppIcon";
import {useEffect, useState} from "react";
import coidsLogo from "../../assets/logos/logo-coids.png";
import appLogo from "../../assets/logos/logoDatacenterManager.png";
import inpeLogo from "../../assets/logos/Logo_INPE_maior.png";
import type {NetBoxRack} from "../../services";
import type {DeviceSummary} from "../devices/shared/devices-data";
import "./Home.css";

type HomeProps = {
    onLogout: () => void;
    searchDevices: (
        searchBy: "name" | "asset_tag",
        query: string,
    ) => Promise<DeviceSummary[]>;
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
            | "regions"
            | "connections",
    ) => void;
};

type HomeAction = {
    key: HomePage;
    title: string;
    text: string;
    icon: AppIconName;
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
    | "regions"
    | "connections";

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
        title: "Equipamentos",
        text: "Gerencie os equipamentos",
        icon: "device",
    },
    {
        key: "rack-info",
        title: "Racks",
        text: "Gerencie os racks",
        icon: "rack",
    },
    {
        key: "organizacao",
        title: "Organização",
        text: "Gerencie o local do datacenter",
        icon: "organization",
    },
    {
        key: "connections",
        title: "Conexões",
        text: "Visualize os cabos físicos",
        icon: "connection",
    },
] as const;

const deviceOptions: readonly ActionOption[] = [
    {label: "Visualizar equipamentos", page: "devices"},
    {label: "Adicionar equipamento", page: "add-device", tone: "success"},
    {label: "Fabricantes", page: "manufacturers"},
    {label: "Funções de equipamentos", page: "device-functions"},
    {label: "Tipos de equipamentos", page: "device-types"},
];

const rackOptions: readonly ActionOption[] = [
    {label: "Visualizar racks", page: "rack-info"},
    {label: "Adicionar rack", page: "add-rack", tone: "success"},
    {label: "Grupos de racks", page: "rack-groups"},
    {label: "Funções de racks", page: "rack-roles"},
];

const organizationOptions: readonly ActionOption[] = [
    {label: "Sites", page: "sites"},
    {label: "Locais", page: "locations"},
    {label: "Regiões", page: "regions"},
];

const connectionOptions: readonly ActionOption[] = [
    {label: "Visualizar conexões", page: "connections"},
];

export default function Home({
                                 onLogout,
                                 searchDevices,
                                 racks,
                                 onSelectDevice,
                                 onDelete,
                                 onOpenPage,
                             }: HomeProps) {
    const {can, isUnrestricted, user} = useAccess();
    const {language, setLanguage} = useLanguage();
    const [languagesOpen, setLanguagesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<HomeAction | null>(null);
    const [deleteKind, setDeleteKind] = useState<DeleteKind | null>(null);
    const [deleteSelection, setDeleteSelection] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deviceSearchBy, setDeviceSearchBy] = useState<"name" | "asset_tag">("name");
    const [deviceSearchTerm, setDeviceSearchTerm] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [deviceSearchResults, setDeviceSearchResults] = useState<
        DeviceSummary[]
    >([]);
    const [isSearchingDevices, setIsSearchingDevices] = useState(false);

    const canOpenPage = (page: NavigableHomePage) => {
        const accessByPage: Partial<
            Record<NavigableHomePage, [string, "view" | "add"]>
        > = {
            scanner: ["dcim.device", "view"],
            devices: ["dcim.device", "view"],
            "add-device": ["dcim.device", "add"],
            "add-device-type": ["dcim.devicetype", "add"],
            "device-types": ["dcim.devicetype", "view"],
            manufacturers: ["dcim.manufacturer", "view"],
            "device-functions": ["dcim.devicerole", "view"],
            "rack-info": ["dcim.rack", "view"],
            "add-rack": ["dcim.rack", "add"],
            "add-rack-group": ["dcim.rackgroup", "add"],
            "rack-groups": ["dcim.rackgroup", "view"],
            "rack-roles": ["dcim.rackrole", "view"],
            sites: ["dcim.site", "view"],
            locations: ["dcim.location", "view"],
            regions: ["dcim.region", "view"],
            connections: ["dcim.cable", "view"],
        };
        const access = accessByPage[page];
        return !access || can(access[0], access[1]);
    };

    const canOpenAction = (key: HomePage) => {
        if (key === "device")
            return deviceOptions.some(
                (option) => option.page && canOpenPage(option.page),
            );
        if (key === "rack-info")
            return rackOptions.some(
                (option) => option.page && canOpenPage(option.page),
            );
        if (key === "organizacao")
            return organizationOptions.some(
                (option) => option.page && canOpenPage(option.page),
            );
        if (key === "connections") return canOpenPage("connections");
        return true;
    };
    const optionsForAction = (key: HomePage) =>
        key === "device"
            ? deviceOptions
            : key === "rack-info"
                ? rackOptions
                : key === "organizacao"
                    ? organizationOptions
                    : connectionOptions;
    const managedObjectTypes = [
        "dcim.device",
        "dcim.devicetype",
        "dcim.devicerole",
        "dcim.manufacturer",
        "dcim.rack",
        "dcim.rackgroup",
        "dcim.rackrole",
        "dcim.site",
        "dcim.location",
        "dcim.region",
        "dcim.cable",
    ];
    const hasWriteAccess = managedObjectTypes.some(
        (objectType) =>
            can(objectType, "add") ||
            can(objectType, "change") ||
            can(objectType, "delete"),
    );

    const normalizedDeviceSearch = deviceSearchTerm
        .trim()
        .toLocaleLowerCase("pt-BR");
    useEffect(() => {
        if (!normalizedDeviceSearch) {
            setDeviceSearchResults([]);
            setIsSearchingDevices(false);
            return;
        }
        let active = true;
        const timer = window.setTimeout(() => {
            setIsSearchingDevices(true);
            void searchDevices(deviceSearchBy, deviceSearchTerm.trim())
                .then((results) => {
                    if (active) setDeviceSearchResults(results);
                })
                .catch(() => {
                    if (active) setDeviceSearchResults([]);
                })
                .finally(() => {
                    if (active) setIsSearchingDevices(false);
                });
        }, 250);
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [deviceSearchBy, deviceSearchTerm, normalizedDeviceSearch, searchDevices]);
    const deleteOptions =
        deleteKind === "rack"
            ? racks.map((item) => ({id: item.id, label: item.name}))
            : [];
    const deleteSelectionLabel =
        deleteOptions.find((item) => String(item.id) === deleteSelection)?.label ??
        "";

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

    useModalFocus(aboutOpen || helpOpen || languagesOpen || Boolean(selectedAction), () => {
        if (confirmDelete) {
            setConfirmDelete(false);
            return;
        }
        setAboutOpen(false);
        setHelpOpen(false);
        setLanguagesOpen(false);
        closeActionOptions();
    });

    const openDeleteSelection = (kind: DeleteKind) => {
        setDeleteKind(kind);
        setDeleteSelection("");
        setConfirmDelete(false);
        setDeleteMessage("");
        setDeleteError("");
    };

    const finishDeletion = async () => {
        if (!deleteKind || !deleteSelection) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await onDelete(deleteKind, Number(deleteSelection));
            setConfirmDelete(false);
            setDeleteMessage("Item excluído com sucesso.");
        } catch (error) {
            setDeleteError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o item.",
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <PageShell
            className="home-page"
            brand={{
                logo: appLogo,
                name: "Datacenter",
                subtitle: "Manager",
            }}
            headerAction={
                <div className="home__menu">
                    <button
                        className="home__menu-button"
                        type="button"
                        aria-label={t("Abrir menu")}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span/>
                        <span/>
                        <span/>
                    </button>
                    {menuOpen ? (
                        <div className="home__menu-popover">
                            <div className="home__menu-user">
                                <strong>{user?.display ?? t("Usuário")}</strong>
                                <small>
                                    {t(isUnrestricted
                                        ? "Acesso administrativo"
                                        : !hasWriteAccess
                                            ? "Somente leitura"
                                            : user?.groups.map((group) => group.name).join(", ") ||
                                            "Acesso personalizado")}
                                </small>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setAboutOpen(true);
                                }}
                            >{t("Sobre")}</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setHelpOpen(true);
                                }}
                            >{t("Como usar")}</button>
                            <button type="button" onClick={() => {
                                setMenuOpen(false);
                                setLanguagesOpen(true);
                            }}>{t("Linguagens")}</button>
                            <button type="button" onClick={onLogout}>{t("Sair")}</button>
                        </div>
                    ) : null}
                </div>
            }
        >
            <section className="home__quick-section" aria-label={t("Ações rápidas")}>
                <h2 className="home__quick-title">{t("Ações rápidas")}</h2>
                <div className="home__quick-actions">
                    {can("dcim.device", "view") ? (
                        <button
                            className="home__quick-action home__quick-action--primary"
                            type="button"
                            onClick={() => onOpenPage("scanner")}
                        >
              <span className="home__quick-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <path
                      d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3M5 12h14"/>
                </svg>
              </span>
                            <span>
                <strong>{t("Scanner")}</strong>
                <small>{t("Leia um QR code")}</small>
              </span>
                        </button>
                    ) : null}
                    {can("dcim.device", "view") ? (
                        <button
                            className="home__quick-action"
                            type="button"
                            onClick={() =>
                                openActionOptions({
                                    key: "object-info",
                                    title: "Buscar equipamento",
                                    text: "Pesquise pelo nome ou Service Tag",
                                    icon: "search",
                                })
                            }
                        >
              <span className="home__quick-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round">
                  <circle cx="10.8" cy="10.8" r="6.3"/>
                  <path d="m16 16 4.2 4.2"/>
                </svg>
              </span>
                            <span>
                <strong>{t("Buscar equipamento")}</strong>
                <small>{t("Consulte detalhes")}</small>
              </span>
                        </button>
                    ) : null}
                </div>
            </section>

            <section className="page-section home__section" aria-label={t("Explorar o datacenter")}>
                <div className="home__section-heading">
                    <div>
                        <h2 className="page-section__title">{t("Explorar")}</h2>
                    </div>
                </div>
                <div className="page-grid home__grid">
                    {actions
                        .filter((action) => canOpenAction(action.key))
                        .map((action) => {
                            const actionOptions = optionsForAction(action.key);
                            const availableOptions = actionOptions.filter(
                                (option) => !option.page || canOpenPage(option.page),
                            );
                            const primaryPage = actionOptions[0]?.page;
                            const canOpenPrimaryPage =
                                primaryPage && canOpenPage(primaryPage);
                            const hasMoreOptions = availableOptions.length > 1;
                            return (
                                <div key={action.key} className="home__card">
                                    <button
                                        className="home__card-main"
                                        type="button"
                                        aria-label={
                                            t(canOpenPrimaryPage
                                                ? `Abrir ${action.title.toLowerCase()}`
                                                : `Opções de ${action.title}`)
                                        }
                                        onClick={() =>
                                            canOpenPrimaryPage && primaryPage
                                                ? onOpenPage(primaryPage)
                                                : openActionOptions(action)
                                        }
                                    >
                                        <span className="home__icon"><AppIcon name={action.icon}/></span>
                                        <span className="home__card-content">
                      <strong className="home__card-title">{t(action.title)}</strong>
                      <span className="page-section__text">{t(action.text)}</span>
                    </span>
                                        <span className="home__card-arrow" aria-hidden="true">
                      ›
                    </span>
                                    </button>
                                    {canOpenPrimaryPage && hasMoreOptions ? (
                                        <button
                                            className="home__card-more"
                                            type="button"
                                            aria-label={format("Mais opções de {0}", [t(action.title)])}
                                            onClick={() => openActionOptions(action)}
                                        >{t("Mais opções")}</button>
                                    ) : null}
                                </div>
                            );
                        })}
                </div>
            </section>

            {languagesOpen ? (
                <div className="home__modal-backdrop" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setLanguagesOpen(false);
                }}>
                    <section className="home__modal home__languages" role="dialog" aria-modal="true" aria-labelledby="home-languages-title">
                        <button className="home__modal-close" type="button" aria-label={t("Fechar linguagens")} onClick={() => setLanguagesOpen(false)}>×</button>
                        <h2 id="home-languages-title">{t("Linguagens")}</h2>
                        <p>{t("Escolha o idioma do aplicativo.")}</p>
                        <div className="home__language-options">
                            <button type="button" lang="pt-BR" aria-pressed={language === "pt"} onClick={() => setLanguage("pt")}>Português</button>
                            <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>English</button>
                        </div>
                        <button className="home__about-close" type="button" onClick={() => setLanguagesOpen(false)}>{t("Fechar")}</button>
                    </section>
                </div>
            ) : null}

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
                        <span className="home__modal-handle" aria-hidden="true"/>
                        <button
                            className="home__modal-close"
                            type="button"
                            aria-label={t("Fechar informações sobre o aplicativo")}
                            onClick={() => setAboutOpen(false)}
                        >{t("×")}</button>
                        <img className="home__about-logo" src={coidsLogo} alt={t("COIDS")}/>
                        <h2 id="home-about-title">{t("Sobre o aplicativo")}</h2>
                        <p>{t("Aplicativo móvel integrado ao NetBox para facilitar a consulta e o gerenciamento da infraestrutura de datacenter.")}</p>
                        <p>{t("Consulte equipamentos, racks, sites e locais, acompanhe a ocupação dos racks e encontre informações por busca ou leitura de QR Code. Realize também operações de cadastro diretamente pelo celular.")}</p>
                        <p>{t("Para configurações avançadas, utilize a interface web do NetBox.")}</p>
                        <h3>{t("Desenvolvimento e origem")}</h3>
                        <p>{t("Desenvolvido por Luis Filippe Reis Nogueira, no contexto de suas atividades de estágio na Divisão de Infraestrutura de Dados e Supercomputação (COIDS), do INPE — Instituto Nacional de Pesquisas Espaciais.")}</p>
                        <p>{t("O projeto surgiu das necessidades de gerenciamento de datacenter, com o objetivo de tornar a consulta e a atualização das informações de infraestrutura mais práticas e acessíveis pelo celular.")}</p>
                        <p>{t("Esta versão disponibiliza o aplicativo à comunidade para uso, adaptação e colaboração, conforme a licença do projeto.")}</p>
                        <h3>{t("Integração com o NetBox")}</h3>
                        <p>{t("Este aplicativo é um cliente móvel independente que utiliza a API do NetBox. Não é um produto oficial do projeto NetBox nem da NetBox Labs.")}</p>
                        <h3>{t("Contribua")}</h3>
                        <p>{t("Acesse o ")}<a href="https://github.com/luisfilippe650/netbox-mobile" target="_blank" rel="noopener noreferrer">{t("repositório do projeto")}</a>{t(" para consultar o código-fonte, reportar problemas e sugerir melhorias.")}</p>
                        <img className="home__about-inpe-logo" src={inpeLogo} alt={t("Logo do INPE")}/>
                        <span className="home__about-inpe-name">{t("INPE | Instituto Nacional de Pesquisas Espaciais")}</span>
                        <button
                            className="home__about-close"
                            type="button"
                            onClick={() => setAboutOpen(false)}
                        >{t("Fechar")}</button>
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
                        <span className="home__modal-handle" aria-hidden="true"/>
                        <button
                            className="home__modal-close"
                            type="button"
                            aria-label={t("Fechar instruções de uso")}
                            onClick={() => setHelpOpen(false)}
                        >{t("×")}</button>
                        <span className="home__help-icon" aria-hidden="true">
              ?
            </span>
                        <h2 id="home-help-title">{t("Como usar")}</h2>
                        <p className="home__help-intro">{t("Use o aplicativo para cadastros rápidos. Campos marcados como obrigatórios precisam ser preenchidos antes de salvar.")}</p>

                        <article className="home__help-card">
                            <h3>{t("Criar um rack")}</h3>
                            <ol>
                                <li>{t("Selecione o ")}<strong>{t("site")}</strong>{t(". Esse campo é obrigatório.")}</li>
                                <li>{t("Escolha um ")}<strong>{t("local")}</strong>{t(" vinculado ao site selecionado, se necessário.")}</li>
                                <li>{t("Informe opcionalmente o grupo de racks e a descrição.")}</li>
                                <li>{t("Digite o ")}<strong>{t("nome")}</strong>{t(" do rack.")}</li>
                                <li>{t("Escolha a ")}<strong>{t("largura")}</strong>{t(": 10, 19, 21 ou 23 inches. O padrão é 19 inches.")}</li>
                                <li>{t("Confira a ")}<strong>{t("unidade inicial")}</strong>{t(", padrão 1, e a")}{" "}
                                    <strong>{t("altura")}</strong>{t(", padrão 42U.")}</li>
                            </ol>
                            <p>{t("Site, nome, largura, unidade inicial e altura são obrigatórios.")}</p>
                        </article>

                        <article className="home__help-card">
                            <h3>{t("Criar um equipamento")}</h3>
                            <ol>
                                <li>{t("Informe o nome e, se desejar, uma descrição.")}</li>
                                <li>{t("Selecione a ")}<strong>{t("função")}</strong>{t(" e o")}{" "}
                                    <strong>{t("tipo do equipamento")}</strong>.
                                </li>
                                <li>{t("Selecione o ")}<strong>{t("site")}</strong>{t(". Os locais disponíveis serão filtrados por ele.")}</li>
                                <li>{t("Escolha o local e informe o rack e a posição, quando aplicável.")}</li>
                                <li>{t("Antes de salvar, confira se a posição desejada está livre no rack.")}</li>
                            </ol>
                            <p>{t("Função, tipo do equipamento e site são obrigatórios.")}</p>
                        </article>

                        <aside className="home__help-note">{t("Para operações mais complexas e configurações avançadas, utilize diretamente o NetBox.")}</aside>
                        <button
                            className="home__about-close"
                            type="button"
                            onClick={() => setHelpOpen(false)}
                        >{t("Entendi")}</button>
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
                        <span className="home__modal-handle" aria-hidden="true"/>
                        <button
                            className="home__modal-close"
                            type="button"
                            aria-label={t("Fechar opções")}
                            onClick={closeActionOptions}
                        >{t("×")}</button>
                        <span className="home__modal-icon home__modal-icon--contained">
              <AppIcon name={selectedAction.icon}/>
            </span>
                        <h2 id="home-action-title">{t(selectedAction.title)}</h2>
                        <p>{t(selectedAction.text)}</p>
                        {deleteKind ? (
                            <div className="home__delete-flow">
                                {deleteMessage ? (
                                    <div className="home__delete-message" role="status">
                                        <span aria-hidden="true">✓</span>
                                        <strong>{t(deleteMessage)}</strong>
                                        <button type="button" onClick={closeActionOptions}>{t("OK")}</button>
                                    </div>
                                ) : confirmDelete ? (
                                    <div
                                        className="home__delete-confirmation"
                                        role="alertdialog"
                                        aria-labelledby="home-delete-title"
                                    >
                                        <strong id="home-delete-title">{t("Tem certeza que deseja excluir?")}</strong>
                                        <span>{t(deleteSelectionLabel)}</span>
                                        {deleteError ? (
                                            <small className="home__delete-error" role="alert">
                                                {t(deleteError)}
                                            </small>
                                        ) : null}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDelete(false)}
                                            >{t("Cancelar")}</button>
                                            <button
                                                className="home__delete-confirm"
                                                type="button"
                                                disabled={isDeleting}
                                                onClick={() => void finishDeletion()}
                                            >
                                                {t(isDeleting ? "Excluindo…" : "Excluir")}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <label className="home__delete-select">
                                            <span>{t("Selecione o item")}</span>
                                            <select
                                                value={deleteSelection}
                                                onChange={(event) =>
                                                    setDeleteSelection(event.target.value)
                                                }
                                            >
                                                <option value="">{t("Selecione uma opção")}</option>
                                                {deleteOptions.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <div className="home__delete-controls">
                                            <button type="button" onClick={() => setDeleteKind(null)}>{t("Voltar")}</button>
                                            <button
                                                type="button"
                                                disabled={!deleteSelection}
                                                onClick={() => setConfirmDelete(true)}
                                            >{t("OK")}</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : selectedAction.key === "object-info" ? (
                            <div className="home__device-search">
                                <div
                                    className="home__device-search-modes"
                                    role="group"
                                    aria-label={t("Pesquisar equipamento por")}
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
                                    >{t("Nome")}</button>
                                    <button
                                        className={
                                            deviceSearchBy === "asset_tag"
                                                ? "home__device-search-mode home__device-search-mode--active"
                                                : "home__device-search-mode"
                                        }
                                        type="button"
                                        aria-pressed={deviceSearchBy === "asset_tag"}
                                        onClick={() => {
                                            setDeviceSearchBy("asset_tag");
                                            setDeviceSearchTerm("");
                                        }}
                                    >{t("Service Tag")}</button>
                                </div>
                                <label className="home__device-search-field">
                                    <span>{t(deviceSearchBy === "asset_tag" ? "Service Tag" : "Nome")}</span>
                                    <input
                                        type="search"
                                        inputMode="search"
                                        data-modal-initial-focus
                                        value={deviceSearchTerm}
                                        onChange={(event) =>
                                            setDeviceSearchTerm(event.target.value)
                                        }
                                        placeholder={
                                            t(deviceSearchBy === "asset_tag" ? "Digite o Service Tag" : "Digite o nome")
                                        }
                                    />
                                </label>
                                {normalizedDeviceSearch ? (
                                    <div
                                        className="home__device-search-results"
                                        aria-live="polite"
                                    >
                                        {isSearchingDevices ? (
                                            <p>{t("Buscando equipamentos…")}</p>
                                        ) : deviceSearchResults.length > 0 ? (
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
                                                        {deviceSearchBy === "asset_tag"
                                                            ? `Service Tag: ${device.assetTag || t("Não informada")}`
                                                            : device.name}
                                                    </strong>
                                                    <small>
                                                        {deviceSearchBy === "asset_tag"
                                                            ? device.name
                                                            : `Service Tag: ${device.assetTag || t("Não informada")}`}
                                                    </small>
                                                </button>
                                            ))
                                        ) : (
                                            <p>{t("Nenhum equipamento encontrado.")}</p>
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
                                    )
                                        .filter(
                                            (option) => !option.page || canOpenPage(option.page),
                                        )
                                        .map((option, index) => (
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
                                                {t(option.label)}
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
