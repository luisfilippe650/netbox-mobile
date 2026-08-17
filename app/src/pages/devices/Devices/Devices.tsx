import { PageShell } from "../../../components/PageShell/PageShell";
import { Pagination } from "../../../components/Pagination/Pagination";
import deviceIcon from "../../../assets/icons/inserir_id_manualmente.png";
import { useEffect, useState } from "react";
import { useAccess } from "../../../context/AccessContext";
import {
  usePaginatedData,
  type PageRequest,
  type PageResult,
} from "../../../hooks/usePaginatedData";
import type { BatchDeleteResult } from "../../../services";
import type { DeviceSummary } from "../shared/devices-data";
import "./Devices.css";

type DevicesProps = {
  onBack: () => void;
  onAdd: () => void;
  onSelect: (device: DeviceSummary) => void;
  loadPage: (
    request: PageRequest & { searchBy: "name" | "id" },
  ) => Promise<PageResult<DeviceSummary>>;
  onDelete: (ids: number[]) => Promise<BatchDeleteResult>;
};

export default function Devices({
  onBack,
  onAdd,
  onSelect,
  loadPage,
  onDelete,
}: DevicesProps) {
  const { can } = useAccess();
  const canAdd = can("dcim.device", "add");
  const canDelete = can("dcim.device", "delete");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [searchBy, setSearchBy] = useState<"name" | "id">("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const pagination = usePaginatedData({
    loadPage: (request) => loadPage({ ...request, searchBy }),
    query: searchTerm,
    requestKey: searchBy,
  });
  const items = pagination.items;
  const normalizedSearchTerm = searchTerm.trim();

  useEffect(() => {
    setSelectedIds(new Set());
    setShowDeleteConfirmation(false);
  }, [pagination.page, searchBy, searchTerm]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    setIsDeleting(true);
    setActionError("");
    try {
      const result = await onDelete(
        items
          .filter((item) => selectedIds.has(item.id))
          .map((item) => item.apiId),
      );
      const removedIds = new Set(result.removedIds.map(String));
      setSelectedIds((current) =>
        new Set([...current].filter((id) => !removedIds.has(id))),
      );
      pagination.reload();
      if (result.failedMessages.length > 0)
        throw new Error(result.failedMessages.join(" · "));
      setShowDeleteConfirmation(false);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir os equipamentos.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      className="devices-page"
      eyebrow="Equipamentos"
      title="Seus equipamentos"
      subtitle="Consulte os equipamentos cadastrados no datacenter."
    >
      <section
        className="devices__heading"
        aria-label="Resumo dos equipamentos"
      >
        <div>
          <h2>Equipamentos cadastrados</h2>
          <p>Equipamentos disponíveis para consulta</p>
        </div>
        <div className="devices__actions">
          {canAdd ? (
            <button
              className="devices__add-button"
              type="button"
              aria-label="Adicionar equipamento"
              onClick={onAdd}
            >
              <span aria-hidden="true">+</span>
              Adicionar
            </button>
          ) : null}
          {canDelete && selectedIds.size > 0 ? (
            <button
              className="devices__delete-button"
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
            >
              Excluir ({selectedIds.size})
            </button>
          ) : null}
        </div>
      </section>
      {actionError || pagination.error ? (
        <p className="devices__error" role="alert">
          {actionError || pagination.error}
        </p>
      ) : null}
      <section
        className="devices__search"
        aria-labelledby="devices-search-title"
      >
        <div className="devices__search-heading">
          <div>
            <h2 id="devices-search-title">Buscar equipamento</h2>
            <p>Escolha como deseja pesquisar.</p>
          </div>
          {normalizedSearchTerm ? (
            <span>{pagination.total} resultado(s)</span>
          ) : null}
        </div>
        <div
          className="devices__search-modes"
          role="group"
          aria-label="Pesquisar equipamento por"
        >
          <button
            className={
              searchBy === "name"
                ? "devices__search-mode devices__search-mode--active"
                : "devices__search-mode"
            }
            type="button"
            aria-pressed={searchBy === "name"}
            onClick={() => setSearchBy("name")}
          >
            Nome
          </button>
          <button
            className={
              searchBy === "id"
                ? "devices__search-mode devices__search-mode--active"
                : "devices__search-mode"
            }
            type="button"
            aria-pressed={searchBy === "id"}
            onClick={() => setSearchBy("id")}
          >
            ID
          </button>
        </div>
        <label className="devices__search-field">
          <span className="devices__search-icon" aria-hidden="true" />
          <span className="devices__search-label">
            {searchBy === "id" ? "ID do equipamento" : "Nome do equipamento"}
          </span>
          <input
            type="search"
            inputMode={searchBy === "id" ? "numeric" : "search"}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchBy === "id" ? "Digite o ID" : "Digite o nome"}
          />
        </label>
      </section>
      {pagination.isLoading ? (
        <p className="devices__empty">Carregando equipamentos…</p>
      ) : null}
      {items.map((item) => (
        <article
          key={item.id}
          className="page-card devices__card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onSelect(item);
          }}
        >
          {canDelete ? (
            <label
              className="devices__select"
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
          ) : null}
          <div className="devices__card-top">
            <span className="devices__icon">
              <img src={deviceIcon} alt="" />
            </span>
            <div className="devices__card-info">
              <strong>{item.name}</strong>
              <span className="devices__id">ID {item.id}</span>
            </div>
            <span className="devices__status">{item.status}</span>
          </div>
          <p className="page-section__text">
            {item.rack} ·{" "}
            {item.allocatedUnit > 0 ? `U${item.allocatedUnit}` : "Sem posição"}{" "}
            · {item.region}
          </p>
        </article>
      ))}
      {!pagination.isLoading && items.length === 0 ? (
        <p className="devices__empty">Nenhum equipamento cadastrado.</p>
      ) : null}
      <Pagination
        disabled={pagination.isLoading}
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={pagination.setPage}
      />
      <button
        className="page-button page-button--secondary"
        type="button"
        onClick={onBack}
      >
        Voltar
      </button>

      {showDeleteConfirmation ? (
        <div className="devices__confirmation-backdrop" role="presentation">
          <section
            className="devices__confirmation"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <span className="devices__confirmation-icon" aria-hidden="true">
              !
            </span>
            <h2 id="delete-title">Excluir equipamentos?</h2>
            <p>
              Você selecionou {selectedIds.size} equipamento(s). Essa ação não
              poderá ser desfeita.
            </p>
            <div className="devices__confirmation-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </button>
              <button
                className="devices__confirm-delete"
                type="button"
                disabled={isDeleting}
                onClick={() => void deleteSelected()}
              >
                {isDeleting ? "Excluindo…" : "Excluir"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
