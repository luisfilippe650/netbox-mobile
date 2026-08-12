import { PageShell } from '../shared/PageShell'
import './home.css'

type HomeProps = {
  onLogout: () => void
  onOpenPage: (page: 'scanner' | 'object-info' | 'object-list' | 'rack-info' | 'row-info' | 'location-info') => void
}

const actions = [
  { key: 'scanner', title: 'Scanner', text: 'Leitura rápida de QR code', icon: '/src/assets/icons/leitura_automatica.png' },
  { key: 'object-info', title: 'Objetos', text: 'Visual de cadastro e detalhes', icon: '/src/assets/icons/tipos_de_objetos.png' },
  { key: 'object-list', title: 'Lista', text: 'Lista de objetos em cards', icon: '/src/assets/icons/inserir_id_manualmente.png' },
  { key: 'rack-info', title: 'Racks', text: 'Occupação e status visual', icon: '/src/assets/icons/rack_cheio.png' },
  { key: 'row-info', title: 'Rows', text: 'Rows e vínculos por rack', icon: '/src/assets/icons/row_icone.png' },
  { key: 'location-info', title: 'Locations', text: 'Locations com rows ligadas', icon: '/src/assets/icons/locations.png' },
] as const

export default function Home({ onLogout, onOpenPage }: HomeProps) {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="Visuais do RackApp"
      subtitle="Base mobile-first com separação limpa de páginas e estilos."
    >
      <section className="page-card home__hero">
        <div className="page-pill">Fork visual em React</div>
        <p className="page-section__text">
          Aqui a ideia é reaproveitar a identidade visual das telas existentes, sem levar a lógica pesada do app nativo.
        </p>
      </section>

      <section className="page-section">
        <h2 className="page-section__title">Telas principais</h2>
        <div className="page-grid home__grid">
          {actions.map((action) => (
            <button key={action.key} className="home__card" type="button" onClick={() => onOpenPage(action.key)}>
              <img className="home__icon" src={action.icon} alt="" />
              <strong className="home__card-title">{action.title}</strong>
              <span className="page-section__text">{action.text}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="page-button page-button--secondary" type="button" onClick={onLogout}>
        Sair
      </button>
    </PageShell>
  )
}
