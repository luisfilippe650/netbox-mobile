import { useMemo, useState } from "react";
import { PageShell } from "../../components/PageShell/PageShell";
import type { NetBoxRackGroup } from "../../services";
import "../organization/organization.css";

type RackGroupsProps = {
  items: readonly NetBoxRackGroup[];
  onAdd: () => void;
  onDelete: (ids: number[]) => Promise<void>;
  onBack: () => void;
};

export default function RackGroups({ items, onAdd, onDelete, onBack }: RackGroupsProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<NetBoxRackGroup | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.name ?? item.display} ${item.description ?? ""} ${item.slug ?? ""}`
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
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir os grupos de racks.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell className="organization-page" eyebrow="Racks" title="Grupos de racks" subtitle="Consulte e gerencie os agrupamentos de racks do datacenter.">
      <label className="organization__search">
        <span className="organization__search-icon" aria-hidden="true" />
        <span className="organization__search-label">Grupos de racks</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar grupo de racks" />
      </label>
      {error ? <p className="organization__error" role="alert">{error}</p> : null}

      <section className="organization__heading" aria-label="Resumo dos grupos de racks">
        <div><h2>Grupos cadastrados</h2><p>{filteredItems.length} grupo(s) encontrado(s)</p></div>
        <div className="organization__actions">
          <button className="organization__add" type="button" onClick={onAdd}><span aria-hidden="true">+</span>Adicionar</button>
          {selectedIds.size > 0 ? (
            <button className="organization__delete" type="button" onClick={() => setShowDeleteConfirmation(true)}>Excluir ({selectedIds.size})</button>
          ) : null}
        </div>
      </section>

      <div className="organization__list">
        {filteredItems.map((item) => {
          const name = item.name ?? item.display;
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
              <label className="organization__select" aria-label={`Selecionar ${name}`} onClick={(event) => event.stopPropagation()}>
                <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelection(item.id)} />
                <span aria-hidden="true" />
              </label>
              <span className="organization__avatar" aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase("pt-BR")}</span>
              <div className="organization__card-content">
                <div className="organization__card-title"><strong>{name}</strong><span>{item.id}</span></div>
                <p>{item.description || "Sem descrição"}</p>
                <small><span>{item.rack_count} rack(s)</span></small>
              </div>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <section className="organization__empty" role="status">
          <span aria-hidden="true">⌕</span><strong>Nenhum grupo de racks encontrado</strong><p>Tente buscar usando outro nome.</p>
        </section>
      ) : null}

      <button className="organization__back" type="button" onClick={onBack}>Voltar</button>

      {selectedItem ? (
        <div className="organization__modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
          <section className="organization__modal organization__details" role="dialog" aria-modal="true" aria-labelledby="rack-group-details-title">
            <span className="organization__modal-icon" aria-hidden="true">G</span>
            <div><h2 id="rack-group-details-title">Informações do grupo de racks</h2><p>ID {selectedItem.id}</p></div>
            <dl>
              <div><dt>Nome</dt><dd>{selectedItem.name ?? selectedItem.display}</dd></div>
              <div><dt>Slug</dt><dd>{selectedItem.slug || "Não informado"}</dd></div>
              <div><dt>Racks</dt><dd>{selectedItem.rack_count}</dd></div>
              <div><dt>Descrição</dt><dd>{selectedItem.description || "Não informada"}</dd></div>
            </dl>
            <button className="organization__details-close" type="button" onClick={() => setSelectedItem(null)}>Fechar</button>
          </section>
        </div>
      ) : null}

      {showDeleteConfirmation ? (
        <div className="organization__modal-backdrop" role="presentation">
          <section className="organization__modal" role="alertdialog" aria-modal="true" aria-labelledby="rack-group-delete-title">
            <span className="organization__modal-icon organization__modal-icon--danger" aria-hidden="true">!</span>
            <h2 id="rack-group-delete-title">Excluir grupo(s) de racks?</h2>
            <p>Você selecionou {selectedIds.size} item(ns). Essa ação não poderá ser desfeita.</p>
            <div className="organization__modal-actions">
              <button type="button" onClick={() => setShowDeleteConfirmation(false)}>Cancelar</button>
              <button className="organization__confirm-delete" type="button" disabled={isDeleting} onClick={() => void deleteSelected()}>{isDeleting ? "Excluindo…" : "Excluir"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
