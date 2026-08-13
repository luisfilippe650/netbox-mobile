import { useState } from 'react'
import { PageShell } from '../../components/PageShell/PageShell'
import type { OrganizationItem } from '../organization/OrganizationList'
import './add-rack.css'

type AddRackProps = {
  sites: readonly OrganizationItem[]
  locations: readonly OrganizationItem[]
  onBack: () => void
}

const rackWidths = [10, 19, 21, 23] as const

export default function AddRack({ sites, locations, onBack }: AddRackProps) {
  const [selectedSite, setSelectedSite] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const availableLocations = locations.filter((location) => location.site === selectedSite)

  return (
    <PageShell
      className="add-rack-page"
      eyebrow="Racks"
      title="Adicionar rack"
      subtitle="Preencha as informações do novo rack."
    >
      <form className="add-rack__form" onSubmit={(event) => event.preventDefault()}>
        <section className="add-rack__section">
          <div className="add-rack__section-title">
            <h2>Localização</h2>
            <p>Defina onde o rack será instalado.</p>
          </div>

          <label className="add-rack__field">
            <span>Site <em>obrigatório</em></span>
            <select
              name="site"
              required
              value={selectedSite}
              onChange={(event) => {
                setSelectedSite(event.target.value)
                setSelectedLocation('')
              }}
            >
              <option value="" disabled>Selecione um site</option>
              {sites.map((site) => <option key={site.id} value={site.name}>{site.name}</option>)}
            </select>
          </label>

          <label className="add-rack__field">
            <span>Local</span>
            <select
              name="location"
              value={selectedLocation}
              disabled={!selectedSite || availableLocations.length === 0}
              onChange={(event) => setSelectedLocation(event.target.value)}
            >
              <option value="">
                {!selectedSite
                  ? 'Selecione o site primeiro'
                  : availableLocations.length === 0
                    ? 'Nenhum local neste site'
                    : 'Selecione um local'}
              </option>
              {availableLocations.map((location) => (
                <option key={location.id} value={location.name}>{location.name}</option>
              ))}
            </select>
          </label>

          <label className="add-rack__field">
            <span>Grupo de racks</span>
            <input type="text" name="rackGroup" placeholder="Ex.: Fileira principal" />
          </label>
        </section>

        <section className="add-rack__section">
          <div className="add-rack__section-title">
            <h2>Dados do rack</h2>
            <p>Informe a identificação e as dimensões.</p>
          </div>

          <label className="add-rack__field">
            <span>Nome <em>obrigatório</em></span>
            <input type="text" name="name" required placeholder="Ex.: Rack 01" />
          </label>

          <label className="add-rack__field">
            <span>Descrição</span>
            <textarea name="description" rows={3} placeholder="Descrição do rack (opcional)" />
          </label>

          <label className="add-rack__field">
            <span>Largura <em>obrigatório</em></span>
            <select name="width" required defaultValue="19">
              {rackWidths.map((width) => <option key={width} value={width}>{width} inches</option>)}
            </select>
          </label>

          <div className="add-rack__field-group">
            <label className="add-rack__field">
              <span>Unidade inicial <em>obrigatório</em></span>
              <input type="number" name="startingUnit" required min="1" step="1" defaultValue="1" />
            </label>
            <label className="add-rack__field">
              <span>Altura (U) <em>obrigatório</em></span>
              <input type="number" name="height" required min="1" step="1" defaultValue="42" />
            </label>
          </div>
        </section>

        <button className="add-rack__save" type="submit">Salvar rack</button>
      </form>

      <button className="add-rack__back" type="button" onClick={onBack}>Voltar</button>
    </PageShell>
  )
}
