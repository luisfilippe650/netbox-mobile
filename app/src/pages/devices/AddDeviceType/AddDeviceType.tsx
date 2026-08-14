import { useState, type FormEvent } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import coidsLogo from "../../../assets/logos/logo-coids.png";
import type { NetBoxManufacturer } from "../../../services";
import "./AddDeviceType.css";

export type DeviceTypeCreateInput = {
  manufacturerId: number;
  model: string;
  description: string;
  height: number;
};
type AddDeviceTypeProps = {
  onBack: () => void;
  manufacturers: readonly NetBoxManufacturer[];
  onCreate: (input: DeviceTypeCreateInput) => Promise<void>;
  onCreateManufacturer: (name: string) => Promise<void>;
};

export default function AddDeviceType({
  onBack,
  manufacturers,
  onCreate,
  onCreateManufacturer,
}: AddDeviceTypeProps) {
  const { can } = useAccess();
  const [showManufacturerForm, setShowManufacturerForm] = useState(false);
  const [newManufacturer, setNewManufacturer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createManufacturer = async () => {
    const name = newManufacturer.trim();
    if (!name) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onCreateManufacturer(name);
      setNewManufacturer("");
      setShowManufacturerForm(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o fabricante.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError("");
    try {
      await onCreate({
        manufacturerId: Number(data.get("manufacturer")),
        model: String(data.get("model") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        height: Number(data.get("height")),
      });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o tipo de equipamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      className="add-device-type-page"
      brand={{
        logo: coidsLogo,
        name: "Gerenciador",
        subtitle: "de Datacenter",
      }}
      eyebrow="Equipamentos"
      title="Tipo de equipamento"
      subtitle="Cadastre um novo tipo para organizar seus equipamentos."
    >
      {error ? (
        <p className="add-device-type__error" role="alert">
          {error}
        </p>
      ) : null}
      <form
        className="add-device-type__form"
        onSubmit={(event) => void submit(event)}
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
                  <option key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.name ?? manufacturer.display}
                  </option>
                ))}
              </select>
            </label>
            {can("dcim.manufacturer", "add") ? (
              <button
                className="add-device-type__create-manufacturer"
                type="button"
                onClick={() => setShowManufacturerForm((current) => !current)}
              >
                + Criar fabricante
              </button>
            ) : null}
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
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void createManufacturer()}
              >
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
              placeholder="Descreva este tipo de equipamento (opcional)"
            />
          </label>
          <label className="add-device-type__field">
            <span>
              Altura (U) <em>obrigatório</em>
            </span>
            <input
              type="number"
              name="height"
              min="0"
              step="0.5"
              defaultValue="1"
              required
            />
          </label>
        </section>
        <button
          className="add-device-type__save"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando…" : "Salvar tipo de equipamento"}
        </button>
      </form>
      <button className="add-device-type__back" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  );
}
