import { useMemo, useState } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import rackIcon from "../../../assets/icons/rack_medio.png";
import { getOccupiedUnits, type RackSummary } from "../shared/data";
import "../../organization/OrganizationList/OrganizationList.css";
import "./RackInfo.css";

type RackInfoProps = {
  onBack: () => void;
  onAdd: () => void;
  onDelete: (ids: number[]) => Promise<void>;
  onSelect: (rack: RackSummary) => void;
  items: readonly RackSummary[];
};

export default function RackInfo({
  onBack,
  onAdd,
  onDelete,
  onSelect,
  items,
}: RackInfoProps) {
  const { can } = useAccess();
  const canAdd = can("dcim.rack", "add");
  const canDelete = can("dcim.rack", "delete");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return items;
    return items.filter((rack) =>
      `${rack.name} ${rack.id} ${rack.site} ${rack.location} ${rack.group} ${rack.role}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedQuery),
    );
  }, [items, query]);

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
      await onDelete([...selectedIds]);
      setSelectedIds(new Set());
      setShowDeleteConfirmation(false);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir os racks.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      className="rack-list-page"
      eyebrow="Racks"
      title="Visualizar racks"
      subtitle="Selecione um rack para consultar sua ocupação e os equipamentos alocados."
    >
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">Racks</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, ID ou local"
        />
      </label>
      {error ? (
        <p className="rack-list__error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="organization__heading" aria-label="Resumo dos racks">
        <div>
          <h2>Racks cadastrados</h2>
          <p>{filteredItems.length} rack(s) encontrado(s)</p>
        </div>
        <div className="organization__actions">
          {canAdd ? (
            <button className="organization__add" type="button" onClick={onAdd}>
              <span aria-hidden="true">+</span>Adicionar
            </button>
          ) : null}
          {canDelete && selectedIds.size > 0 ? (
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

      <div className="rack-list">
        {filteredItems.map((rack) => {
          const occupiedUnits = getOccupiedUnits(rack);
          return (
            <article
              className="rack-list__card"
              key={rack.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(rack)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(rack);
                }
              }}
            >
              {canDelete ? (
                <label
                  className="rack-list__select"
                  aria-label={`Selecionar ${rack.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(rack.apiId)}
                    onChange={() => toggleSelection(rack.apiId)}
                  />
                  <span aria-hidden="true" />
                </label>
              ) : null}
              <span className="rack-list__icon">
                <img src={rackIcon} alt="" />
              </span>
              <span className="rack-list__content">
                <span className="rack-list__title">
                  <strong>{rack.name}</strong>
                  <small>{rack.id}</small>
                </span>
                <span className="rack-list__location">
                  {rack.location} · {rack.site}
                </span>
                <span className="rack-list__usage">
                  <span>
                    <i
                      style={{
                        width: `${(occupiedUnits / rack.height) * 100}%`,
                      }}
                    />
                  </span>
                  <small>
                    {occupiedUnits}U ocupadas de {rack.height}U
                  </small>
                </span>
              </span>
              <span className="rack-list__arrow" aria-hidden="true">
                ›
              </span>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <p className="rack-list__empty">Nenhum rack encontrado.</p>
      ) : null}
      <button className="rack-list__back" type="button" onClick={onBack}>
        Voltar
      </button>

      {showDeleteConfirmation ? (
        <div className="organization__modal-backdrop" role="presentation">
          <section
            className="organization__modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rack-delete-title"
          >
            <span
              className="organization__modal-icon organization__modal-icon--danger"
              aria-hidden="true"
            >
              !
            </span>
            <h2 id="rack-delete-title">Excluir rack(s)?</h2>
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
