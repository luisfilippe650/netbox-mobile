import { useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import type { NetBoxRack } from "../../../services";
import type { OrganizationItem } from "../../organization/OrganizationList/OrganizationList";
import type { DeviceSummary } from "../shared/devices-data";
import "./ObjectInfo.css";

type ObjectInfoProps = {
  onBack: () => void;
  device: DeviceSummary;
  sites: readonly OrganizationItem[];
  racks: readonly NetBoxRack[];
  onUpdate: (device: DeviceSummary) => Promise<DeviceSummary>;
};

export default function ObjectInfo({
  onBack,
  device,
  sites,
  racks,
  onUpdate,
}: ObjectInfoProps) {
  const { can } = useAccess();
  const canChange = can("dcim.device", "change");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DeviceSummary>({ ...device });
  const [savedMessage, setSavedMessage] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGeneratingQrCode, setIsGeneratingQrCode] = useState(false);
  const [qrCodeError, setQrCodeError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const updateField = <K extends keyof DeviceSummary>(
    field: K,
    value: DeviceSummary[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage(false);
  };

  const saveChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");
    try {
      const updated = await onUpdate({
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
      });
      setDraft(updated);
      setIsEditing(false);
      setSavedMessage(true);
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? saveFailure.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraft({ ...device });
    setIsEditing(false);
    setSavedMessage(false);
  };

  const generateQrCode = async () => {
    setIsGeneratingQrCode(true);
    setQrCodeError("");
    try {
      const imageUrl = await QRCode.toDataURL(device.id, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 640,
        color: { dark: "#0d0f1a", light: "#ffffff" },
      });
      setQrCodeUrl(imageUrl);
    } catch {
      setQrCodeError("Não foi possível gerar o QR Code. Tente novamente.");
    } finally {
      setIsGeneratingQrCode(false);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `dispositivo-${device.id}-qr-code.png`;
    link.click();
  };

  return (
    <PageShell
      className="object-info-page"
      eyebrow={`Dispositivo · ID ${device.id}`}
      title="Informações do dispositivo"
      subtitle="Consulte os dados do equipamento ou ative a personalização para editá-los."
    >
      <section className="object-info__toolbar">
        <div>
          <strong>
            {isEditing ? "Personalização ativada" : "Modo de consulta"}
          </strong>
          <span>
            {isEditing
              ? "Altere os campos e salve ao finalizar."
              : "Os dados estão protegidos contra alterações."}
          </span>
        </div>
        <div className="object-info__toolbar-actions">
          <button
            className="object-info__qr-button"
            type="button"
            disabled={isGeneratingQrCode}
            onClick={generateQrCode}
          >
            {isGeneratingQrCode ? "Gerando..." : "Gerar QR Code"}
          </button>
          {canChange ? (
            <button
              className={
                isEditing
                  ? "object-info__customize object-info__customize--active"
                  : "object-info__customize"
              }
              type="button"
              onClick={() => (isEditing ? cancelEditing() : setIsEditing(true))}
            >
              {isEditing ? "Cancelar" : "Personalizar"}
            </button>
          ) : null}
        </div>
      </section>

      {savedMessage ? (
        <p className="object-info__success" role="status">
          Alterações salvas com sucesso.
        </p>
      ) : null}
      {qrCodeError ? (
        <p className="object-info__error" role="alert">
          {qrCodeError}
        </p>
      ) : null}
      {saveError ? (
        <p className="object-info__error" role="alert">
          {saveError}
        </p>
      ) : null}

      <form
        className="object-info__form"
        onSubmit={(event) => void saveChanges(event)}
      >
        <section className="object-info__card">
          <div className="object-info__section-title">
            <h2>Identificação</h2>
            <p>Dados principais do equipamento.</p>
          </div>

          <label className="object-info__field">
            <span>Nome</span>
            <input
              required
              value={draft.name}
              readOnly={!isEditing}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>

          <label className="object-info__field">
            <span>Etiqueta</span>
            <input value={draft.label} readOnly aria-readonly="true" />
            <small>
              A etiqueta é usada para identificar o equipamento e não pode ser
              personalizada aqui.
            </small>
          </label>

          <label className="object-info__field">
            <span>Descrição</span>
            <textarea
              rows={3}
              value={draft.description}
              readOnly={!isEditing}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
          </label>
        </section>

        <section className="object-info__card">
          <div className="object-info__section-title">
            <h2>Localização</h2>
            <p>Posição atual do dispositivo na infraestrutura.</p>
          </div>

          <label className="object-info__field">
            <span>Site</span>
            <select
              required
              value={draft.siteId}
              disabled={!isEditing}
              onChange={(event) => {
                const site = sites.find(
                  (item) => item.id === event.target.value,
                );
                if (site)
                  setDraft((current) => ({
                    ...current,
                    siteId: Number(site.id),
                    site: site.name,
                    locationId: null,
                    region: site.region ?? "Sem local",
                    rackId: null,
                    rack: "Sem rack",
                    allocatedUnit: 0,
                  }));
              }}
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>

          <label className="object-info__field">
            <span>Região</span>
            <input value={draft.region} readOnly />
          </label>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>Rack</span>
              <select
                value={draft.rackId ?? ""}
                disabled={!isEditing}
                onChange={(event) => {
                  const rack = racks.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  setDraft((current) => ({
                    ...current,
                    rackId: rack?.id ?? null,
                    rack: rack?.name ?? "Sem rack",
                    allocatedUnit: rack ? current.allocatedUnit : 0,
                  }));
                }}
              >
                <option value="">Sem rack</option>
                {racks
                  .filter((rack) => rack.site.id === draft.siteId)
                  .map((rack) => (
                    <option key={rack.id} value={rack.id}>
                      {rack.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="object-info__field">
              <span>U alocado</span>
              <input
                type="number"
                min="0.5"
                max="999.5"
                step="0.5"
                value={draft.allocatedUnit || ""}
                readOnly={!isEditing}
                disabled={draft.rackId === null}
                onChange={(event) =>
                  updateField("allocatedUnit", Number(event.target.value))
                }
              />
            </label>
          </div>
        </section>

        {isEditing ? (
          <button
            className="object-info__save"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Salvando…" : "Salvar alterações"}
          </button>
        ) : null}
      </form>

      <button className="object-info__back" type="button" onClick={onBack}>
        Voltar
      </button>

      {qrCodeUrl ? (
        <div
          className="object-info__qr-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQrCodeUrl("");
          }}
        >
          <section
            className="object-info__qr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="object-qr-title"
          >
            <button
              className="object-info__qr-close"
              type="button"
              aria-label="Fechar QR Code"
              onClick={() => setQrCodeUrl("")}
            >
              ×
            </button>
            <span className="object-info__qr-icon" aria-hidden="true">
              ▦
            </span>
            <h2 id="object-qr-title">QR Code do dispositivo</h2>
            <p>
              O código contém o ID <strong>{device.id}</strong>.
            </p>
            <div className="object-info__qr-image">
              <img
                src={qrCodeUrl}
                alt={`QR Code do dispositivo ${device.id}`}
              />
            </div>
            <small>
              Use o scanner do aplicativo para identificar este dispositivo.
            </small>
            <div className="object-info__qr-actions">
              <button type="button" onClick={() => setQrCodeUrl("")}>
                Fechar
              </button>
              <button type="button" onClick={downloadQrCode}>
                Baixar QR Code
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
