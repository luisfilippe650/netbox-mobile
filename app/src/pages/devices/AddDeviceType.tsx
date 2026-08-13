import { useState } from "react";
import { PageShell } from "../../components/PageShell/PageShell";
import coidsLogo from "../../assets/logos/logo-coids.png";
import "./add-device-type.css";

type AddDeviceTypeProps = {
  onBack: () => void;
};

export default function AddDeviceType({ onBack }: AddDeviceTypeProps) {
  const [manufacturers, setManufacturers] = useState([
    "Dell",
    "Cisco",
    "Lenovo",
  ]);
  const [showManufacturerForm, setShowManufacturerForm] = useState(false);
  const [newManufacturer, setNewManufacturer] = useState("");

  const createManufacturer = () => {
    const manufacturerName = newManufacturer.trim();
    if (!manufacturerName) return;
    setManufacturers((current) => [...current, manufacturerName]);
    setNewManufacturer("");
    setShowManufacturerForm(false);
  };

  return (
    <PageShell
      className="add-device-type-page"
      brand={{
        logo: coidsLogo,
        name: "Gerenciador",
        subtitle: "de Datacenter",
      }}
      eyebrow="Dispositivos"
      title="Tipo de dispositivo"
      subtitle="Cadastre um novo tipo para organizar seus equipamentos."
    >
      <form
        className="add-device-type__form"
        onSubmit={(event) => event.preventDefault()}
      >
        <section className="add-device-type__section">
          <div className="add-device-type__icon" aria-hidden="true">
            ▦
          </div>
          <div className="add-device-type__heading">
            <h2>Informações do tipo</h2>
            <p>Informe o fabricante, modelo e altura do equipamento.</p>
          </div>

          <div className="add-device-type__manufacturer">
            <label className="add-device-type__field">
              <span>
                Fabricante <em>obrigatório</em>
              </span>
              <select name="manufacturer" required defaultValue="">
                <option value="" disabled>
                  Selecione um fabricante
                </option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </label>
            <button
              className="add-device-type__create-manufacturer"
              type="button"
              onClick={() => setShowManufacturerForm((current) => !current)}
            >
              + Criar fabricante
            </button>
          </div>

          {showManufacturerForm ? (
            <div className="add-device-type__new-manufacturer">
              <label className="add-device-type__field">
                <span>Novo fabricante</span>
                <input
                  autoFocus
                  value={newManufacturer}
                  onChange={(event) => setNewManufacturer(event.target.value)}
                  placeholder="Ex.: HPE"
                />
              </label>
              <button type="button" onClick={createManufacturer}>
                Adicionar fabricante
              </button>
            </div>
          ) : null}

          <label className="add-device-type__field">
            <span>
              Modelo <em>obrigatório</em>
            </span>
            <input
              type="text"
              name="model"
              placeholder="Ex.: PowerEdge R740"
              required
            />
          </label>

          <label className="add-device-type__field">
            <span>Descrição</span>
            <textarea
              name="description"
              rows={4}
              placeholder="Descreva este tipo de dispositivo (opcional)"
            />
          </label>

          <label className="add-device-type__field">
            <span>
              Altura (U) <em>obrigatório</em>
            </span>
            <input
              type="number"
              name="height"
              min="0.1"
              step="0.1"
              placeholder="Ex.: 1.0 ou 1.5"
              required
            />
          </label>
        </section>

        <button className="add-device-type__save" type="submit">
          Salvar tipo de dispositivo
        </button>
      </form>

      <button className="add-device-type__back" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  );
}
