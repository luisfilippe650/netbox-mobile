import { PageShell } from '../../components/PageShell/PageShell'
import './object-info.css'

type ObjectInfoProps = {
  onBack: () => void
}

const fields = [
  { label: 'Nome', value: 'Servidor principal' },
  { label: 'Asset tag', value: 'AST-001' },
  { label: 'Status', value: 'Ativo' },
  { label: 'Comentário', value: 'Visual limpo para tela mobile' },
]

export default function ObjectInfo({ onBack }: ObjectInfoProps) {
  return (
    <PageShell eyebrow="Detalhe" title="Informações do objeto" subtitle="Primeira versão focada só no visual.">
      <section className="page-card object-info__card">
        <div className="page-grid object-info__grid">
          {fields.map((field) => (
            <div key={field.label}>
              <div className="object-info__label">{field.label}</div>
              <div className="object-info__value">{field.value}</div>
            </div>
          ))}
        </div>
      </section>
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
