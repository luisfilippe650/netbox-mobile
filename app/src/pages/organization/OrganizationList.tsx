import { useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../../components/PageShell/PageShell";
import "./organization.css";

export type OrganizationItem = {
  id: string;
  name: string;
  description: string;
  detail: string;
  region?: string;
  tenant?: string;
  timezone?: string;
  site?: string;
  vmRole?: boolean;
  color?: string;
};

type OrganizationListProps = {
  singular: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  searchLabel: string;
  emptyMessage: string;
  items: readonly OrganizationItem[];
  siteOptions?: readonly OrganizationItem[];
  onItemsChange?: (items: OrganizationItem[]) => void;
  onBack: () => void;
};

export function OrganizationList({
  singular,
  title,
  subtitle,
  sectionTitle,
  searchLabel,
  emptyMessage,
  items,
  siteOptions = [],
  onItemsChange,
  onBack,
}: OrganizationListProps) {
  const [query, setQuery] = useState("");
  const [localItems, setLocalItems] = useState<OrganizationItem[]>([...items]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrganizationItem | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newSite, setNewSite] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVmRole, setNewVmRole] = useState("false");
  const isSitePage = singular === "Site";
  const isLocationPage = singular === "Local";
  const isDeviceFunctionPage = singular === "Função de dispositivo";
  const hasDetails = isSitePage || isLocationPage;
  const organizationItems = onItemsChange ? items : localItems;

  const updateItems = (
    update: (current: readonly OrganizationItem[]) => OrganizationItem[],
  ) => {
    if (onItemsChange) onItemsChange(update(items));
    else setLocalItems(update);
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return organizationItems;

    return organizationItems.filter((item) =>
      `${item.name} ${item.description} ${item.detail}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery),
    );
  }, [organizationItems, query]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    updateItems((current) =>
      current.filter((item) => !selectedIds.has(item.id)),
    );
    setSelectedIds(new Set());
    setShowDeleteConfirmation(false);
  };

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextNumber =
      organizationItems.reduce((largest, item) => {
        const number = Number(item.id.match(/\d+$/)?.[0] ?? 0);
        return Math.max(largest, number);
      }, 0) + 1;
    const prefix =
      items[0]?.id.split("-")[0] ??
      singular.slice(0, 3).toLocaleUpperCase("pt-BR");

    updateItems((current) => [
      ...current,
      {
        id: `${prefix}-${String(nextNumber).padStart(2, "0")}`,
        name: newName.trim(),
        description: newDescription.trim() || `${singular} cadastrado`,
        detail: "Nenhum vínculo cadastrado",
        ...(isSitePage
          ? {
              region: newRegion.trim() || "Não informada",
              tenant: "Não informado",
              timezone: "America/Sao_Paulo",
            }
          : {}),
        ...(isLocationPage ? { site: newSite } : {}),
        ...(isDeviceFunctionPage
          ? {
              vmRole: newVmRole === "true",
              color: "Cinza",
              detail: `Função da VM: ${newVmRole === "true" ? "Sim" : "Não"} · Cor: Cinza`,
            }
          : {}),
      },
    ]);
    setNewName("");
    setNewRegion("");
    setNewSite("");
    setNewDescription("");
    setNewVmRole("false");
    setShowAddForm(false);
  };

  return (
    <PageShell
      className="organization-page"
      eyebrow="Organização"
      title={title}
      subtitle={subtitle}
    >
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">{searchLabel}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Buscar ${searchLabel.toLocaleLowerCase("pt-BR")}`}
        />
      </label>

      <section
        className="organization__heading"
        aria-label={`Resumo de ${sectionTitle.toLocaleLowerCase("pt-BR")}`}
      >
        <div>
          <h2>{sectionTitle}</h2>
          <p>
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? singular.toLocaleLowerCase("pt-BR")
              : "itens"}{" "}
            encontrado(s)
          </p>
        </div>
        <div className="organization__actions">
          <button
            className="organization__add"
            type="button"
            onClick={() => setShowAddForm(true)}
          >
            <span aria-hidden="true">+</span>
            Adicionar
          </button>
          {selectedIds.size > 0 ? (
            <button
              className="organization__delete"
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Excluir ({selectedIds.size})
            </button>
          ) : null}
        </div>
      </section>

      <div className="organization__list">
        {filteredItems.map((item) => (
          <article
            className={`organization__card${hasDetails ? " organization__card--clickable" : ""}`}
            key={item.id}
            role={hasDetails ? "button" : undefined}
            tabIndex={hasDetails ? 0 : undefined}
            onClick={() => {
              if (hasDetails) setSelectedItem(item);
            }}
            onKeyDown={(event) => {
              if (hasDetails && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                setSelectedItem(item);
              }
            }}
          >
            <label
              className="organization__select"
              aria-label={`Selecionar ${item.name}`}
              onClick={(event) => event.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.id)}
                onChange={() => toggleSelection(item.id)}
              />
              <span aria-hidden="true" />
            </label>
            <span className="organization__avatar" aria-hidden="true">
              {item.name.slice(0, 1).toLocaleUpperCase("pt-BR")}
            </span>
            <div className="organization__card-content">
              <div className="organization__card-title">
                <strong>{item.name}</strong>
                <span>{item.id}</span>
              </div>
              <p>{item.description}</p>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <section className="organization__empty" role="status">
          <span aria-hidden="true">⌕</span>
          <strong>{emptyMessage}</strong>
          <p>Tente buscar usando outro nome.</p>
        </section>
      ) : null}

      <button className="organization__back" type="button" onClick={onBack}>
        Voltar
      </button>

      {showAddForm ? (
        <div
          className="organization__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddForm(false);
          }}
        >
          <form className="organization__modal" onSubmit={addItem}>
            <span className="organization__modal-icon" aria-hidden="true">
              +
            </span>
            <h2>Adicionar {singular.toLocaleLowerCase("pt-BR")}</h2>
            <p>Preencha as informações do novo cadastro.</p>
            {isLocationPage ? (
              <label>
                <span>Site</span>
                <select
                  required
                  value={newSite}
                  onChange={(event) => setNewSite(event.target.value)}
                >
                  <option value="">Selecione um site</option>
                  {siteOptions.map((site) => (
                    <option key={site.id} value={site.name}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>Nome</span>
              <input
                autoFocus
                required
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={`Nome do ${singular.toLocaleLowerCase("pt-BR")}`}
              />
            </label>
            {isSitePage ? (
              <label>
                <span>Região</span>
                <input
                  value={newRegion}
                  onChange={(event) => setNewRegion(event.target.value)}
                  placeholder="Região do site"
                />
              </label>
            ) : null}
            {isDeviceFunctionPage ? (
              <label>
                <span>Função da VM</span>
                <select
                  value={newVmRole}
                  onChange={(event) => setNewVmRole(event.target.value)}
                >
                  <option value="false">Falso</option>
                  <option value="true">Verdadeiro</option>
                </select>
              </label>
            ) : null}
            <label>
              <span>Descrição</span>
              <input
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Descrição opcional"
              />
            </label>
            {isDeviceFunctionPage ? (
              <label>
                <span>Cor</span>
                <input value="Cinza" readOnly aria-readonly="true" />
              </label>
            ) : null}
            <div className="organization__modal-actions">
              <button type="button" onClick={() => setShowAddForm(false)}>
                Cancelar
              </button>
              <button className="organization__confirm-add" type="submit">
                Adicionar
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {selectedItem && hasDetails ? (
        <div
          className="organization__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <section
            className="organization__modal organization__details"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-details-title"
          >
            <span className="organization__modal-icon" aria-hidden="true">
              {isSitePage ? "S" : "L"}
            </span>
            <div>
              <h2 id="site-details-title">
                Informações do {singular.toLocaleLowerCase("pt-BR")}
              </h2>
              <p>{selectedItem.id}</p>
            </div>
            <dl>
              {isLocationPage ? (
                <div>
                  <dt>Site</dt>
                  <dd>{selectedItem.site ?? "Não informado"}</dd>
                </div>
              ) : null}
              <div>
                <dt>Nome</dt>
                <dd>{selectedItem.name}</dd>
              </div>
              {isLocationPage ? (
                <div>
                  <dt>Descrição</dt>
                  <dd>{selectedItem.description || "Não informada"}</dd>
                </div>
              ) : (
                <>
                  <div>
                    <dt>Região</dt>
                    <dd>{selectedItem.region ?? "Não informada"}</dd>
                  </div>
                  <div>
                    <dt>Inquilino</dt>
                    <dd>{selectedItem.tenant ?? "Não informado"}</dd>
                  </div>
                  <div>
                    <dt>Timezone</dt>
                    <dd>{selectedItem.timezone ?? "Não informado"}</dd>
                  </div>
                </>
              )}
            </dl>
            <button
              className="organization__details-close"
              type="button"
              onClick={() => setSelectedItem(null)}
            >
              Fechar
            </button>
          </section>
        </div>
      ) : null}

      {showDeleteConfirmation ? (
        <div className="organization__modal-backdrop" role="presentation">
          <section
            className="organization__modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="organization-delete-title"
          >
            <span
              className="organization__modal-icon organization__modal-icon--danger"
              aria-hidden="true"
            >
              !
            </span>
            <h2 id="organization-delete-title">
              Excluir{" "}
              {selectedIds.size === 1
                ? singular.toLocaleLowerCase("pt-BR")
                : "itens"}
              ?
            </h2>
            <p>
              Você selecionou {selectedIds.size} item(ns). Essa ação não poderá
              ser desfeita.
            </p>
            <div className="organization__modal-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="organization__confirm-delete"
                type="button"
                onClick={deleteSelected}
              >
                Excluir
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
