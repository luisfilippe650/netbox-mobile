import { useState, type SubmitEvent } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import "../AddRack/AddRack.css";

type AddRackGroupProps = {
  onBack: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
};
export default function AddRackGroup({ onBack, onCreate }: AddRackGroupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError("");
    try {
      await onCreate(
        String(data.get("name") ?? "").trim(),
        String(data.get("description") ?? "").trim(),
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o grupo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <PageShell
      className="add-rack-page"
      eyebrow="Racks"
      title="Adicionar grupo de racks"
      subtitle="Preencha as informações do novo grupo."
    >
      {error ? (
        <p className="add-rack__error" role="alert">
          {error}
        </p>
      ) : null}
      <form className="add-rack__form" onSubmit={(event) => void submit(event)}>
        <section className="add-rack__section">
          <div className="add-rack__section-title">
            <h2>Dados do grupo</h2>
            <p>Informe a identificação do grupo de racks.</p>
          </div>
          <label className="add-rack__field">
            <span>
              Nome <em>obrigatório</em>
            </span>
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
        <button
          className="add-rack__save"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando…" : "Salvar grupo de racks"}
        </button>
      </form>
      <button className="add-rack__back" type="button" onClick={onBack}>
        Voltar
      </button>
    </PageShell>
  );
}
