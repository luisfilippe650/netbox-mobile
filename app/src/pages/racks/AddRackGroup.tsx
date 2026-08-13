import { PageShell } from '../../components/PageShell/PageShell'
import './add-rack.css'

type AddRackGroupProps = {
  onBack: () => void
}

export default function AddRackGroup({ onBack }: AddRackGroupProps) {
  return (
    <PageShell
      className="add-rack-page"
      eyebrow="Racks"
      title="Adicionar grupo de racks"
      subtitle="Preencha as informações do novo grupo."
    >
      <form className="add-rack__form" onSubmit={(event) => event.preventDefault()}>
        <section className="add-rack__section">
          <div className="add-rack__section-title">
            <h2>Dados do grupo</h2>
            <p>Informe a identificação do grupo de racks.</p>
          </div>

          <label className="add-rack__field">
            <span>Nome <em>obrigatório</em></span>
            <input
              type="text"
              name="name"
              required
              autoFocus
              placeholder="Ex.: Fileira principal"
            />
          </label>

          <label className="add-rack__field">
            <span>Descrição</span>
            <textarea
              name="description"
              rows={4}
              placeholder="Descrição do grupo de racks (opcional)"
            />
          </label>
        </section>

        <button className="add-rack__save" type="submit">Salvar grupo de racks</button>
      </form>

      <button className="add-rack__back" type="button" onClick={onBack}>Voltar</button>
    </PageShell>
  )
}
