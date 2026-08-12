import { PageShell } from '../shared/PageShell'
import './location-info.css'

type LocationInfoProps = {
  onBack: () => void
}

export default function LocationInfo({ onBack }: LocationInfoProps) {
  return (
    <PageShell eyebrow="Location" title="Locations e vínculos" subtitle="Uma base visual para o fluxo de navegação do app.">
      <section className="page-card location-info__card">
        <div className="location-info__list">
          <div className="page-section"><strong>Location A</strong><p className="page-section__text">Rows vinculadas: 2</p></div>
          <div className="page-section"><strong>Location B</strong><p className="page-section__text">Rows vinculadas: 1</p></div>
        </div>
      </section>
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
