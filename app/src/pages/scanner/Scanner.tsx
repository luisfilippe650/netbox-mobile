import { PageShell } from '../shared/PageShell'
import './scanner.css'

type ScannerProps = {
  onBack: () => void
}

export default function Scanner({ onBack }: ScannerProps) {
  return (
    <PageShell eyebrow="Scanner" title="Ler QR code" subtitle="Layout visual mantido como referência para mobile.">
      <section className="scanner__panel">
        <div className="scanner__frame">
          <div className="scanner__frame-inner">
            <img src="/src/assets/images/qr-code.jpg" alt="Leitor QR" />
          </div>
        </div>
      </section>
      <button className="page-button page-button--secondary" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
