import { PageShell } from '../../components/PageShell/PageShell'
import './row-info.css'

type RowInfoProps = {
  onBack: () => void
}

export default function RowInfo({ onBack }: RowInfoProps) {
  return (
    <PageShell eyebrow="Row" title="Rows vinculadas" subtitle="Layout organizado em lista, mantendo leitura mobile.">
      <section className="page-card row-info__card">
        <div className="row-info__list">
          <div className="page-section"><strong>Row 01</strong><p className="page-section__text">Rack 12, Rack 13</p></div>
          <div className="page-section"><strong>Row 02</strong><p className="page-section__text">Rack 21, Rack 22</p></div>
          <div className="page-section"><strong>Row 03</strong><p className="page-section__text">Rack 31</p></div>
        </div>
      </section>
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
