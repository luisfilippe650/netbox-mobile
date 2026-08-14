import { PageShell } from "../../../components/PageShell/PageShell";
import deviceIcon from "../../../assets/icons/inserir_id_manualmente.png";
import { useState } from "react";
import { useAccess } from "../../../context/AccessContext";
import type { DeviceSummary } from "../shared/devices-data";
import "./Devices.css";

type DevicesProps = {
  onBack: () => void;
  onAdd: () => void;
  onSelect: (device: DeviceSummary) => void;
  items: readonly DeviceSummary[];
  onDelete: (ids: number[]) => Promise<void>;
};

export default function Devices({
  onBack,
  onAdd,
  onSelect,
  items,
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
  const [error, setError] = useState("");

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredItems = items.filter((item) => {
    if (!normalizedSearchTerm) return true;

    const value = searchBy === "id" ? item.id : item.name;
    return value.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm);
  });

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
    setError("");
    try {
      await onDelete(
        items
          .filter((item) => selectedIds.has(item.id))
          .map((item) => item.apiId),
      );
      setSelectedIds(new Set());
      setShowDeleteConfirmation(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir os dispositivos.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      className="devices-page"
      eyebrow="Dispositivos"
      title="Seus dispositivos"
      subtitle="Consulte os equipamentos cadastrados no datacenter."
    >
      <section
        className="devices__heading"
        aria-label="Resumo dos dispositivos"
      >
        <div>
          <h2>Dispositivos cadastrados</h2>
          <p>Equipamentos disponíveis para consulta</p>
        </div>
        <div className="devices__actions">
          {canAdd ? (
            <button
              className="devices__add-button"
              type="button"
              aria-label="Adicionar dispositivo"
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
      {error ? (
        <p className="devices__error" role="alert">
          {error}
        </p>
      ) : null}
      <section
        className="devices__search"
        aria-labelledby="devices-search-title"
      >
        <div className="devices__search-heading">
          <div>
            <h2 id="devices-search-title">Buscar dispositivo</h2>
            <p>Escolha como deseja pesquisar.</p>
          </div>
          {normalizedSearchTerm ? (
            <span>{filteredItems.length} resultado(s)</span>
          ) : null}
        </div>
        <div
          className="devices__search-modes"
          role="group"
          aria-label="Pesquisar dispositivo por"
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
            {searchBy === "id" ? "ID do dispositivo" : "Nome do dispositivo"}
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
      {filteredItems.map((item) => (
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
      {items.length === 0 ? (
        <p className="devices__empty">Nenhum dispositivo cadastrado.</p>
      ) : null}
      {items.length > 0 && filteredItems.length === 0 ? (
        <p className="devices__empty">
          Nenhum dispositivo encontrado por{" "}
          {searchBy === "id" ? "esse ID" : "esse nome"}.
        </p>
      ) : null}
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
            <h2 id="delete-title">Excluir dispositivos?</h2>
            <p>
              Você selecionou {selectedIds.size} dispositivo(s). Essa ação não
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
