import { PageShell } from '../../components/PageShell/PageShell'
import type { DeviceSummary } from './Devices'
import './object-info.css'

type ObjectInfoProps = {
  onBack: () => void
  device?: DeviceSummary
}

export default function ObjectInfo({ onBack, device }: ObjectInfoProps) {
  const fields = [
    { label: 'Nome', value: device?.name ?? 'Servidor principal' },
    { label: 'ID', value: device?.id ?? '1001' },
    { label: 'Status', value: 'Ativo' },
    { label: 'Descrição', value: device?.meta ?? 'Visual limpo para tela mobile' },
  ]

  return (
    <PageShell className="object-info-page" eyebrow="Dispositivo" title="Informações do dispositivo" subtitle="Confira os dados do equipamento selecionado.">
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
