import { displayFallback, format, t } from "../../../i18n/language";
import { useEffect, useState, type SubmitEvent } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { Pagination } from "../../../components/Pagination/Pagination";
import {
  defaultDeviceRoleColor,
  DeviceRoleColorPicker,
} from "../../devices/shared/DeviceRoleColorPicker";
import { useAccess } from "../../../context/AccessContext";
import { useModalFocus } from "../../../hooks/useModalFocus";
import {
  usePaginatedData,
  type PageRequest,
  type PageResult,
} from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";
import "./OrganizationList.css";

export type OrganizationItem = {
  id: string;
  name: string;
  description: string;
  detail: string;
  region?: string;
  regionId?: number | null;
  tenant?: string;
  timezone?: string;
  site?: string;
  siteId?: number;
  vmRole?: boolean;
  color?: string;
};

export type OrganizationCreateInput = {
  name: string;
  description: string;
  siteId?: number;
  regionId?: number;
  vmRole?: boolean;
  color?: string;
};

type OrganizationListProps = {
  objectType: string;
  singular: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  searchLabel: string;
  emptyMessage: string;
  loadPage: (request: PageRequest) => Promise<PageResult<OrganizationItem>>;
  siteOptions?: readonly OrganizationItem[];
  regionOptions?: readonly OrganizationItem[];
  onCreate: (input: OrganizationCreateInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
  onBack: () => void;
};

export function OrganizationList({
  objectType,
  singular,
  title,
  subtitle,
  sectionTitle,
  searchLabel,
  emptyMessage,
  loadPage,
  siteOptions = [],
  regionOptions = [],
  onCreate,
  onDelete,
  onBack,
}: OrganizationListProps) {
  const { can } = useAccess();
  const canAdd = can(objectType, "add");
  const canDelete = can(objectType, "delete");
  const [query, setQuery] = useState("");
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
  const [newDeviceRoleColor, setNewDeviceRoleColor] = useState(
    defaultDeviceRoleColor,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isSitePage = singular === "Site";
  const isLocationPage = singular === "Local";
  const isDeviceFunctionPage = singular === "Função de equipamento";
  const isRackFunctionPage = singular === "Função de rack";
  const hasRoleColor = isDeviceFunctionPage || isRackFunctionPage;
  const hasDetails = isSitePage || isLocationPage;
  useModalFocus(
    showAddForm || Boolean(selectedItem && hasDetails) || showDeleteConfirmation,
    () => {
      setShowAddForm(false);
      setSelectedItem(null);
      setShowDeleteConfirmation(false);
    },
  );
  const pagination = usePaginatedData({ loadPage, query });
  const items = pagination.items;

  useEffect(() => {
    setSelectedIds(new Set());
    setShowDeleteConfirmation(false);
  }, [pagination.page, query]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const result = await onDelete([...selectedIds].map(Number));
      const removedIds = new Set(result.removedIds.map(String));
      setSelectedIds(
        (current) => new Set([...current].filter((id) => !removedIds.has(id))),
      );
      pagination.reload();
      if (result.failedMessages.length > 0)
        throw new Error(result.failedMessages.join(" · "));
      setShowDeleteConfirmation(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir os itens.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await onCreate({
        name: newName.trim(),
        description: newDescription.trim(),
        ...(isSitePage && newRegion ? { regionId: Number(newRegion) } : {}),
        ...(isLocationPage ? { siteId: Number(newSite) } : {}),
        ...(hasRoleColor ? { color: newDeviceRoleColor } : {}),
        ...(isDeviceFunctionPage ? { vmRole: newVmRole === "true" } : {}),
      });
      pagination.reload();
      setNewName("");
      setNewRegion("");
      setNewSite("");
      setNewDescription("");
      setNewVmRole("false");
      setNewDeviceRoleColor(defaultDeviceRoleColor);
      setShowAddForm(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      onBack={onBack}
      className="organization-page"
      eyebrow={t("Organização")}
      title={title}
      subtitle={subtitle}
    >
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">{t(searchLabel)}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={format("Buscar {0}", [t(searchLabel.toLocaleLowerCase("pt-BR"))])}
        />
      </label>
      {error || pagination.error ? (
        <p className="organization__error" role="alert">
          {t(error || pagination.error)}
        </p>
      ) : null}

      <section
        className="organization__heading"
        aria-label={format("Resumo de {0}", [t(sectionTitle.toLocaleLowerCase("pt-BR"))])}
      >
        <div>
          <h2>{t(sectionTitle)}</h2>
          <p>
            {pagination.total}{" "}
            {t(pagination.total === 1
              ? singular.toLocaleLowerCase("pt-BR")
              : "itens")}{" "}{t("encontrado(s)")}</p>
        </div>
        <div className="organization__actions">
          {canAdd ? (
            <button
              className="organization__add"
              type="button"
              onClick={() => setShowAddForm(true)}
            >
              <span aria-hidden="true">+</span>{t("Adicionar")}</button>
          ) : null}
          {canDelete && selectedIds.size > 0 ? (
            <button
              className="organization__delete"
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
            >{t("Excluir (")}{selectedIds.size})
            </button>
          ) : null}
        </div>
      </section>

      <div className="organization__list">
        {pagination.isLoading ? (
          <p className="organization__empty">{t("Carregando itens…")}</p>
        ) : null}
        {items.map((item) => (
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
            {canDelete ? (
              <label
                className="organization__select"
                aria-label={format("Selecionar {0}", [item.name])}
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
                <span aria-hidden="true" />
              </label>
            ) : null}
            <span className="organization__avatar" aria-hidden="true">
              {item.name.slice(0, 1).toLocaleUpperCase("pt-BR")}
            </span>
            <div className="organization__card-content">
              <div className="organization__card-title">
                <strong>{item.name}</strong>
                <span>{item.id}</span>
              </div>
              <p>{displayFallback(item.description, "Sem descrição")}</p>
              <small>
                <span>{t(item.detail)}</span>
                {item.color ? (
                  <span
                    className="organization__role-color"
                    aria-label={t("Cor da função")}
                  >
                    <i
                      style={{ backgroundColor: `#${item.color}` }}
                      aria-hidden="true"
                    />
                  </span>
                ) : null}
              </small>
            </div>
          </article>
        ))}
      </div>

      {!pagination.isLoading && items.length === 0 ? (
        <section className="organization__empty" role="status">
          <span aria-hidden="true">⌕</span>
          <strong>{t(emptyMessage)}</strong>
          <p>{t("Tente buscar usando outro nome.")}</p>
        </section>
      ) : null}

      <Pagination
        disabled={pagination.isLoading}
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={pagination.setPage}
      />

      <button className="organization__back" type="button" onClick={onBack}>{t("Voltar")}</button>

      {showAddForm ? (
        <div
          className="organization__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            className="organization__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-add-title"
            onSubmit={addItem}
          >
            <span className="organization__modal-icon" aria-hidden="true">
              +
            </span>
            <h2 id="organization-add-title">{t("Adicionar ")}{t(singular.toLocaleLowerCase("pt-BR"))}</h2>
            <p>{t("Preencha as informações do novo cadastro.")}</p>
            {error ? (
              <p className="organization__error" role="alert">
                {t(error)}
              </p>
            ) : null}
            {isLocationPage ? (
              <label>
                <span>{t("Site")}</span>
                <select
                  required
                  value={newSite}
                  onChange={(event) => setNewSite(event.target.value)}
                >
                  <option value="">{t("Selecione um site")}</option>
                  {siteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              <span>{t("Nome")}</span>
              <input
                data-modal-initial-focus
                required
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={format("Nome do {0}", [t(singular.toLocaleLowerCase("pt-BR"))])}
              />
            </label>
            {isSitePage ? (
              <label>
                <span>{t("Região")}</span>
                <select
                  value={newRegion}
                  onChange={(event) => setNewRegion(event.target.value)}
                >
                  <option value="">{t("Sem região")}</option>
                  {regionOptions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {isDeviceFunctionPage ? (
              <label>
                <span>{t("Função da VM")}</span>
                <select
                  value={newVmRole}
                  onChange={(event) => setNewVmRole(event.target.value)}
                >
                  <option value="false">{t("Não")}</option>
                  <option value="true">{t("Sim")}</option>
                </select>
              </label>
            ) : null}
            <label>
              <span>{t("Descrição")}</span>
              <input
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder={t("Descrição opcional")}
              />
            </label>
            {hasRoleColor ? (
              <DeviceRoleColorPicker
                value={newDeviceRoleColor}
                onChange={setNewDeviceRoleColor}
                disabled={isSubmitting}
              />
            ) : null}
            <div className="organization__modal-actions">
              <button type="button" onClick={() => setShowAddForm(false)}>{t("Cancelar")}</button>
              <button
                className="organization__confirm-add"
                type="submit"
                disabled={isSubmitting}
              >
                {t(isSubmitting ? "Salvando…" : "Adicionar")}
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
              {t(isSitePage ? t("S") : t("L"))}
            </span>
            <div>
              <h2 id="site-details-title">{t("Informações do ")}{t(singular.toLocaleLowerCase("pt-BR"))}
              </h2>
              <p>{selectedItem.id}</p>
            </div>
            <dl>
              {isLocationPage ? (
                <div>
                  <dt>{t("Site")}</dt>
                  <dd>{selectedItem.site ?? t("Não informado")}</dd>
                </div>
              ) : null}
              <div>
                <dt>{t("Nome")}</dt>
                <dd>{selectedItem.name}</dd>
              </div>
              {isLocationPage ? (
                <div>
                  <dt>{t("Descrição")}</dt>
                  <dd>{selectedItem.description || t(t("Não informada"))}</dd>
                </div>
              ) : (
                <>
                  <div>
                    <dt>{t("Região")}</dt>
                    <dd>{selectedItem.region ?? t("Não informada")}</dd>
                  </div>
                  <div>
                    <dt>{t("Inquilino")}</dt>
                    <dd>{selectedItem.tenant ?? t("Não informado")}</dd>
                  </div>
                  <div>
                    <dt>{t("Timezone")}</dt>
                    <dd>{selectedItem.timezone ?? t("Não informado")}</dd>
                  </div>
                </>
              )}
            </dl>
            <button
              className="organization__details-close"
              type="button"
              onClick={() => setSelectedItem(null)}
            >{t("Fechar")}</button>
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
            <h2 id="organization-delete-title">{t("Excluir")}{" "}
              {t(selectedIds.size === 1
                ? singular.toLocaleLowerCase("pt-BR")
                : "itens")}
              ?
            </h2>
            <p>{t("Você selecionou ")}{selectedIds.size}{t(" item(ns). Essa ação não poderá ser desfeita.")}</p>
            <div className="organization__modal-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
              >{t("Cancelar")}</button>
              <button
                className="organization__confirm-delete"
                type="button"
                disabled={isSubmitting}
                onClick={() => void deleteSelected()}
              >
                {t(isSubmitting ? "Excluindo…" : "Excluir")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
