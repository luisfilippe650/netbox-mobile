import { t } from "../../../i18n/language";
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
      onBack={onBack}
      className="add-rack-page"
      eyebrow={t("Racks")}
      title={t("Adicionar grupo de racks")}
      subtitle={t("Preencha as informações do novo grupo.")}
    >
      {error ? (
        <p className="add-rack__error" role="alert">
          {t(error)}
        </p>
      ) : null}
      <form className="add-rack__form" onSubmit={(event) => void submit(event)}>
        <section className="add-rack__section">
          <div className="add-rack__section-title">
            <h2>{t("Dados do grupo")}</h2>
            <p>{t("Informe a identificação do grupo de racks.")}</p>
          </div>
          <label className="add-rack__field">
            <span>{t("Nome ")}<em>{t("obrigatório")}</em>
            </span>
            <input
              type="text"
              name="name"
              required
              autoFocus
              placeholder={t("Ex.: Fileira principal")}
            />
          </label>
          <label className="add-rack__field">
            <span>{t("Descrição")}</span>
            <textarea
              name="description"
              rows={4}
              placeholder={t("Descrição do grupo de racks (opcional)")}
            />
          </label>
        </section>
        <button
          className="add-rack__save"
          type="submit"
          disabled={isSubmitting}
        >
          {t(isSubmitting ? "Salvando…" : "Salvar grupo de racks")}
        </button>
      </form>
      <button className="add-rack__back" type="button" onClick={onBack}>{t("Voltar")}</button>
    </PageShell>
  );
}
