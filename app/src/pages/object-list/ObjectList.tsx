import { PageShell } from '../shared/PageShell'
import './object-list.css'

type ObjectListProps = {
  onBack: () => void
}

const items = [
  { id: '1001', name: 'Servidor principal', meta: 'Objeto ativo - sala A' },
  { id: '1002', name: 'Switch core', meta: 'Objeto com rack vinculado' },
  { id: '1003', name: 'UPS', meta: 'Cadastro visual simplificado' },
]

export default function ObjectList({ onBack }: ObjectListProps) {
  return (
    <PageShell eyebrow="Objetos" title="Lista visual" subtitle="Cards simples para reaproveitar o desenho do app nativo.">
      {items.map((item) => (
        <article key={item.id} className="page-card object-list__card">
          <div className="object-list__meta-row">
            <span className="page-pill">ID {item.id}</span>
            <strong>{item.name}</strong>
          </div>
          <p className="page-section__text">{item.meta}</p>
        </article>
      ))}
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
