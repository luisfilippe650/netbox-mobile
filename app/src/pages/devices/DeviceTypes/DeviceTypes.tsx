import { useMemo, useState } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import type { NetBoxDeviceType } from "../../../services";
import "../../organization/OrganizationList/OrganizationList.css";

type DeviceTypesProps = {
  items: readonly NetBoxDeviceType[];
  onAdd: () => void;
  onDelete: (ids: number[]) => Promise<void>;
  onBack: () => void;
};

export default function DeviceTypes({
  items,
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

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return items;

    return items.filter((item) =>
      `${item.model} ${item.manufacturer.name ?? item.manufacturer.display} ${item.description} ${item.slug}`
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
          : "Não foi possível excluir os tipos de dispositivos.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell
      className="organization-page"
      eyebrow="Dispositivos"
      title="Tipos de dispositivos"
      subtitle="Consulte e gerencie os modelos disponíveis no datacenter."
    >
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">
          Tipos de dispositivos
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por modelo ou fabricante"
        />
      </label>
      {error ? (
        <p className="organization__error" role="alert">
          {error}
        </p>
      ) : null}

      <section
        className="organization__heading"
        aria-label="Resumo dos tipos de dispositivos"
      >
        <div>
          <h2>Tipos cadastrados</h2>
          <p>{filteredItems.length} tipo(s) encontrado(s)</p>
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

      <div className="organization__list">
        {filteredItems.map((item) => {
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
                  aria-label={`Selecionar ${item.model}`}
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
                <p>{item.description || "Sem descrição"}</p>
                <small>
                  <span>
                    {manufacturer} · {item.u_height}U · {item.device_count}{" "}
                    dispositivo(s)
                  </span>
                </small>
              </div>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <section className="organization__empty" role="status">
          <span aria-hidden="true">⌕</span>
          <strong>Nenhum tipo de dispositivo encontrado</strong>
          <p>Tente buscar usando outro modelo ou fabricante.</p>
        </section>
      ) : null}

      <button className="organization__back" type="button" onClick={onBack}>
        Voltar
      </button>

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
            <span className="organization__modal-icon" aria-hidden="true">
              T
            </span>
            <div>
              <h2 id="device-type-details-title">
                Informações do tipo de dispositivo
              </h2>
              <p>ID {selectedItem.id}</p>
            </div>
            <dl>
              <div>
                <dt>Modelo</dt>
                <dd>{selectedItem.model}</dd>
              </div>
              <div>
                <dt>Fabricante</dt>
                <dd>
                  {selectedItem.manufacturer.name ??
                    selectedItem.manufacturer.display}
                </dd>
              </div>
              <div>
                <dt>Slug</dt>
                <dd>{selectedItem.slug}</dd>
              </div>
              <div>
                <dt>Altura</dt>
                <dd>{selectedItem.u_height}U</dd>
              </div>
              <div>
                <dt>Dispositivos</dt>
                <dd>{selectedItem.device_count}</dd>
              </div>
              <div>
                <dt>Descrição</dt>
                <dd>{selectedItem.description || "Não informada"}</dd>
              </div>
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
            aria-labelledby="device-type-delete-title"
          >
            <span
              className="organization__modal-icon organization__modal-icon--danger"
              aria-hidden="true"
            >
              !
            </span>
            <h2 id="device-type-delete-title">
              Excluir tipo(s) de dispositivo?
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
