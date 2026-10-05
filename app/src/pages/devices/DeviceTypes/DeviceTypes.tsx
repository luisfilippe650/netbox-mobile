import { displayFallback, format, t } from "../../../i18n/language";
import { useEffect, useState } from "react";
import { Pagination } from "../../../components/Pagination/Pagination";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import { useModalFocus } from "../../../hooks/useModalFocus";
import {
  usePaginatedData,
  type PageRequest,
  type PageResult,
} from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult, NetBoxDeviceType } from "../../../services";
import "../../organization/OrganizationList/OrganizationList.css";

type DeviceTypesProps = {
  loadPage: (request: PageRequest) => Promise<PageResult<NetBoxDeviceType>>;
  onAdd: () => void;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
  onBack: () => void;
};

export default function DeviceTypes({
  loadPage,
  onAdd,
  onDelete,
  onBack,
}: DeviceTypesProps) {
  const { can } = useAccess();
  const canAdd = can("dcim.devicetype", "add");
  const canDelete = can("dcim.devicetype", "delete");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<NetBoxDeviceType | null>(
    null,
  );
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  useModalFocus(Boolean(selectedItem) || showDeleteConfirmation, () => {
    setSelectedItem(null);
    setShowDeleteConfirmation(false);
  });

  const pagination = usePaginatedData({ loadPage, query });
  const { items } = pagination;

  useEffect(() => {
    setSelectedIds(new Set());
    setShowDeleteConfirmation(false);
  }, [pagination.page, query]);

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    setIsDeleting(true);
    setError("");
    try {
      const result = await onDelete([...selectedIds]);
      setSelectedIds((current) => {
        const next = new Set(current);
        result.removedIds.forEach((id) => next.delete(id));
        return next;
      });
      pagination.reload();
      if (result.failedMessages.length > 0) {
        throw new Error(result.failedMessages.join("\n"));
      }
      setShowDeleteConfirmation(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir os tipos de equipamentos.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      onBack={onBack}
      className="organization-page"
      eyebrow={t("Equipamentos")}
      title={t("Tipos de equipamentos")}
      subtitle={t("Consulte e gerencie os modelos disponíveis no datacenter.")}
    >
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">{t("Tipos de equipamentos")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Buscar por modelo ou fabricante")}
        />
      </label>
      {error ? (
        <p className="organization__error" role="alert">
          {t(error)}
        </p>
      ) : null}

      <section
        className="organization__heading"
        aria-label={t("Resumo dos tipos de equipamentos")}
      >
        <div>
          <h2>{t("Tipos cadastrados")}</h2>
          <p>{pagination.total}{t(" tipo(s) encontrado(s)")}</p>
        </div>
        <div className="organization__actions">
          {canAdd ? (
            <button className="organization__add" type="button" onClick={onAdd}>
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
        {items.map((item) => {
          const manufacturer =
            item.manufacturer.name ?? item.manufacturer.display;
          return (
            <article
              className="organization__card organization__card--clickable"
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedItem(item)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedItem(item);
                }
              }}
            >
              {canDelete ? (
                <label
                  className="organization__select"
                  aria-label={format("Selecionar {0}", [item.model])}
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
                {item.model.slice(0, 1).toLocaleUpperCase("pt-BR")}
              </span>
              <div className="organization__card-content">
                <div className="organization__card-title">
                  <strong>{item.model}</strong>
                  <span>{item.id}</span>
                </div>
                <p>{displayFallback(item.description, "Sem descrição") || t("Sem descrição")}</p>
                <small>
                  <span>
                    {manufacturer} · {item.u_height}{t("U · ")}{item.device_count}{" "}{t("equipamento(s)")}</span>
                </small>
              </div>
            </article>
          );
        })}
      </div>

      {pagination.isLoading ? <p role="status">{t("Carregando…")}</p> : null}
      {pagination.error ? (
        <p className="organization__error" role="alert">
          {t(pagination.error)}
        </p>
      ) : null}
      {!pagination.isLoading && items.length === 0 ? (
        <section className="organization__empty" role="status">
          <span aria-hidden="true">⌕</span>
          <strong>{t("Nenhum tipo de equipamento encontrado")}</strong>
          <p>{t("Tente buscar usando outro modelo ou fabricante.")}</p>
        </section>
      ) : null}

      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        disabled={pagination.isLoading}
        onPageChange={pagination.setPage}
      />

      <button className="organization__back" type="button" onClick={onBack}>{t("Voltar")}</button>

      {selectedItem ? (
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
            aria-labelledby="device-type-details-title"
          >
            <span className="organization__modal-icon" aria-hidden="true">{t("T")}</span>
            <div>
              <h2 id="device-type-details-title">{t("Informações do tipo de equipamento")}</h2>
              <p>{t("ID ")}{selectedItem.id}</p>
            </div>
            <dl>
              <div>
                <dt>{t("Modelo")}</dt>
                <dd>{selectedItem.model}</dd>
              </div>
              <div>
                <dt>{t("Fabricante")}</dt>
                <dd>
                  {selectedItem.manufacturer.name ??
                    selectedItem.manufacturer.display}
                </dd>
              </div>
              <div>
                <dt>{t("Slug")}</dt>
                <dd>{selectedItem.slug}</dd>
              </div>
              <div>
                <dt>{t("Altura")}</dt>
                <dd>{selectedItem.u_height}{t("U")}</dd>
              </div>
              <div>
                <dt>{t("Equipamentos")}</dt>
                <dd>{selectedItem.device_count}</dd>
              </div>
              <div>
                <dt>{t("Descrição")}</dt>
                <dd>{selectedItem.description || t("Não informada")}</dd>
              </div>
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
            aria-labelledby="device-type-delete-title"
          >
            <span
              className="organization__modal-icon organization__modal-icon--danger"
              aria-hidden="true"
            >
              !
            </span>
            <h2 id="device-type-delete-title">{t("Excluir tipo(s) de equipamento?")}</h2>
            <p>{t("Você selecionou ")}{selectedIds.size}{t(" item(ns). Essa ação não poderá ser desfeita.")}</p>
            <div className="organization__modal-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
              >{t("Cancelar")}</button>
              <button
                className="organization__confirm-delete"
                type="button"
                disabled={isDeleting}
                onClick={() => void deleteSelected()}
              >
                {t(isDeleting ? "Excluindo…" : "Excluir")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
