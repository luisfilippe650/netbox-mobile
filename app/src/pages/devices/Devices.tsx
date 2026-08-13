import { PageShell } from '../../components/PageShell/PageShell'
import deviceIcon from '../../assets/icons/inserir_id_manualmente.png'
import { useState } from 'react'
import type { DeviceSummary } from './devices-data'
import './devices.css'

type DevicesProps = {
  onBack: () => void
  onAdd: () => void
  onSelect: (device: DeviceSummary) => void
  items: readonly DeviceSummary[]
  onItemsChange: (items: DeviceSummary[]) => void
}

export default function Devices({ onBack, onAdd, onSelect, items, onItemsChange }: DevicesProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = () => {
    onItemsChange(items.filter((item) => !selectedIds.has(item.id)))
    setSelectedIds(new Set())
    setShowDeleteConfirmation(false)
  }

  return (
    <PageShell className="devices-page" eyebrow="Dispositivos" title="Seus dispositivos" subtitle="Consulte os equipamentos cadastrados no datacenter.">
      <section className="devices__heading" aria-label="Resumo dos dispositivos">
        <div>
          <h2>Dispositivos cadastrados</h2>
          <p>Equipamentos disponíveis para consulta</p>
        </div>
        <div className="devices__actions">
          <button className="devices__add-button" type="button" aria-label="Adicionar dispositivo" onClick={onAdd}>
            <span aria-hidden="true">+</span>
            Adicionar
          </button>
          {selectedIds.size > 0 ? (
            <button className="devices__delete-button" type="button" onClick={() => setShowDeleteConfirmation(true)}>
              Excluir ({selectedIds.size})
            </button>
          ) : null}
        </div>
      </section>
      {items.map((item) => (
        <article
          key={item.id}
          className="page-card devices__card"
          role="button"
          tabIndex={0}
          onClick={() => onSelect(item)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onSelect(item)
          }}
        >
          <label className="devices__select" aria-label={`Selecionar ${item.name}`} onClick={(event) => event.stopPropagation()}>
            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelection(item.id)} />
            <span aria-hidden="true" />
          </label>
          <div className="devices__card-top">
            <span className="devices__icon"><img src={deviceIcon} alt="" /></span>
            <div className="devices__card-info">
              <strong>{item.name}</strong>
              <span className="devices__id">ID {item.id}</span>
            </div>
            <span className="devices__status">Ativo</span>
          </div>
          <p className="page-section__text">{item.rack} · U{item.allocatedUnit} · {item.region}</p>
        </article>
      ))}
      {items.length === 0 ? <p className="devices__empty">Nenhum dispositivo cadastrado.</p> : null}
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>

      {showDeleteConfirmation ? (
        <div className="devices__confirmation-backdrop" role="presentation">
          <section className="devices__confirmation" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="devices__confirmation-icon" aria-hidden="true">!</span>
            <h2 id="delete-title">Excluir dispositivos?</h2>
            <p>Você selecionou {selectedIds.size} dispositivo(s). Essa ação não poderá ser desfeita.</p>
            <div className="devices__confirmation-actions">
              <button type="button" onClick={() => setShowDeleteConfirmation(false)}>Cancelar</button>
              <button className="devices__confirm-delete" type="button" onClick={deleteSelected}>Excluir</button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  )
}
