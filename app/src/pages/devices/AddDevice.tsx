import { PageShell } from '../../components/PageShell/PageShell'
import { useState } from 'react'
import './add-device.css'

type AddDeviceProps = {
  onBack: () => void
}

export default function AddDevice({ onBack }: AddDeviceProps) {
  const [functions, setFunctions] = useState(['Servidor', 'Rede', 'Armazenamento'])
  const [showFunctionForm, setShowFunctionForm] = useState(false)
  const [newFunction, setNewFunction] = useState('')

  const createFunction = () => {
    const functionName = newFunction.trim()
    if (!functionName) return
    setFunctions((current) => [...current, functionName])
    setNewFunction('')
    setShowFunctionForm(false)
  }

  return (
    <PageShell
      className="add-device-page"
      eyebrow="Dispositivos"
      title="Adicionar dispositivo"
      subtitle="Preencha as informações do novo equipamento."
    >
      <form className="add-device__form" onSubmit={(event) => event.preventDefault()}>
        <section className="add-device__section">
          <div className="add-device__section-title">
            <div>
              <h2>Dados do dispositivo</h2>
              <p>Informe os dados principais do equipamento.</p>
            </div>
          </div>

          <label className="add-device__field">
            <span>Nome do dispositivo</span>
            <input type="text" name="deviceName" placeholder="Ex.: Servidor principal" />
          </label>

          <div className="add-device__field-group">
            <label className="add-device__field">
              <span>Função do dispositivo <em>obrigatório</em></span>
              <select name="deviceFunction" required defaultValue="">
                <option value="" disabled>Selecione uma função</option>
                {functions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <button className="add-device__create-function" type="button" onClick={() => setShowFunctionForm((current) => !current)}>
              + Criar função
            </button>
          </div>

          {showFunctionForm ? (
            <div className="add-device__new-function">
              <label className="add-device__field">
                <span>Nova função</span>
                <input autoFocus value={newFunction} onChange={(event) => setNewFunction(event.target.value)} placeholder="Ex.: Firewall" />
              </label>
              <button type="button" onClick={createFunction}>Adicionar função</button>
            </div>
          ) : null}

          <label className="add-device__field">
            <span>Descrição</span>
            <textarea name="description" rows={3} placeholder="Descreva o dispositivo (opcional)" />
          </label>

          <label className="add-device__field">
            <span>Tipo de dispositivo <em>obrigatório</em></span>
            <select name="deviceType" required defaultValue="">
              <option value="" disabled>Selecione um tipo</option>
              <option>Servidor</option>
              <option>Switch</option>
              <option>Roteador</option>
              <option>Storage</option>
            </select>
          </label>
        </section>

        <section className="add-device__section">
          <div className="add-device__section-title">
            <div>
              <h2>Localização</h2>
              <p>Vincule o dispositivo ao local físico.</p>
            </div>
          </div>

          <label className="add-device__field">
            <span>Site <em>obrigatório</em></span>
            <select name="site" required defaultValue="">
              <option value="" disabled>Selecione um site</option>
              <option>Site principal</option>
              <option>Site secundário</option>
            </select>
          </label>

          <div className="add-device__field-group add-device__field-group--two">
            <label className="add-device__field">
              <span>Local</span>
              <input type="text" name="location" placeholder="Ex.: Sala A" />
            </label>
            <label className="add-device__field">
              <span>Rack</span>
              <input type="text" name="rack" placeholder="Ex.: Rack 01" />
            </label>
          </div>

          <label className="add-device__field">
            <span>Posição</span>
            <input type="text" name="position" placeholder="Ex.: U12 - U14" />
          </label>
        </section>

        <button className="add-device__save" type="submit">Salvar dispositivo</button>
      </form>

      <button className="page-button page-button--secondary add-device__back" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  )
}
