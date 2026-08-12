import { PageShell } from '../../components/PageShell/PageShell'
import './rack-info.css'

type RackInfoProps = {
  onBack: () => void
}

export default function RackInfo({ onBack }: RackInfoProps) {
  return (
    <PageShell eyebrow="Rack" title="Capacidade e ocupação" subtitle="Mesmo espírito do RackApp, mas sem carregar a lógica agora.">
      <section className="page-card rack-info__card">
        <div className="rack-info__header">
          <img src="/src/assets/icons/rack_cheio.png" alt="" />
          <div>
            <strong>Rack 12</strong>
            <p className="page-section__text">Status visual de ocupação e métricas resumidas.</p>
          </div>
        </div>
        <div className="rack-info__metrics">
          <div className="page-section"><strong>42U</strong><p className="page-section__text">Altura</p></div>
          <div className="page-section"><strong>30U</strong><p className="page-section__text">Ocupado</p></div>
          <div className="page-section"><strong>12U</strong><p className="page-section__text">Livre</p></div>
        </div>
      </section>
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
