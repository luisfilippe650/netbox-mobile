import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import type {
  DeviceCustomFieldDefinition,
  NetBoxRack,
} from "../../../services";
import type { OrganizationItem } from "../../organization/OrganizationList/OrganizationList";
import type { DeviceSummary } from "../shared/devices-data";
import CustomFieldInput from "./CustomFieldInput";
import { hasCustomFieldValue } from "./custom-field-utils";
import "./ObjectInfo.css";

type ObjectInfoProps = {
  onBack: () => void;
  device: DeviceSummary;
  sites: readonly OrganizationItem[];
  racks: readonly NetBoxRack[];
  loadCustomFields: () => Promise<DeviceCustomFieldDefinition[]>;
  onUpdate: (
    device: DeviceSummary,
    changedCustomFields: Record<string, unknown>,
  ) => Promise<DeviceSummary>;
};

function relatedObjectId(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "id" in value)
    return Number((value as { id: unknown }).id);
  return value;
}

function normalizeCustomFieldValue(
  field: DeviceCustomFieldDefinition,
  value: unknown,
) {
  if (!hasCustomFieldValue(value)) return null;
  if (field.type.value === "integer" || field.type.value === "decimal")
    return Number(value);
  if (field.type.value === "json" && typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      throw new Error(
        `O campo “${field.label || field.name}” não contém um JSON válido.`,
      );
    }
  }
  if (field.type.value === "datetime" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }
  if (field.type.value === "object") return relatedObjectId(value);
  if (field.type.value === "multiobject" && Array.isArray(value))
    return value.map(relatedObjectId);
  return value;
}

function valuesMatch(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export default function ObjectInfo({
  onBack,
  device,
  sites,
  racks,
  loadCustomFields,
  onUpdate,
}: ObjectInfoProps) {
  const { can } = useAccess();
  const canChange = can("dcim.device", "change");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DeviceSummary>({
    ...device,
    customFields: { ...device.customFields },
  });
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<
    DeviceCustomFieldDefinition[]
  >([]);
  const [isLoadingCustomFields, setIsLoadingCustomFields] = useState(true);
  const [customFieldsError, setCustomFieldsError] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGeneratingQrCode, setIsGeneratingQrCode] = useState(false);
  const [qrCodeError, setQrCodeError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoadingCustomFields(true);
    setCustomFieldsError("");
    void loadCustomFields()
      .then((fields) => {
        if (active) setCustomFieldDefinitions(fields);
      })
      .catch((error: unknown) => {
        if (active)
          setCustomFieldsError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os campos personalizados.",
          );
      })
      .finally(() => {
        if (active) setIsLoadingCustomFields(false);
      });
    return () => {
      active = false;
    };
  }, [loadCustomFields]);

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
      const changedCustomFields = Object.fromEntries(
        customFieldDefinitions.flatMap((field) => {
          if (field.ui_editable.value !== "yes") return [];
          const nextValue = normalizeCustomFieldValue(
            field,
            draft.customFields[field.name],
          );
          const previousValue = normalizeCustomFieldValue(
            field,
            device.customFields[field.name],
          );
          return valuesMatch(nextValue, previousValue)
            ? []
            : [[field.name, nextValue]];
        }),
      );
      const updated = await onUpdate({
        ...draft,
        name: draft.name.trim(),
        serial: draft.serial.trim(),
        assetTag: draft.assetTag.trim(),
        description: draft.description.trim(),
        customFields: {
          ...draft.customFields,
          ...changedCustomFields,
        },
      }, changedCustomFields);
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
    setDraft({ ...device, customFields: { ...device.customFields } });
    setIsEditing(false);
    setSavedMessage(false);
  };

  const startEditing = () => {
    setDraft({ ...device, customFields: { ...device.customFields } });
    setIsEditing(true);
    setSavedMessage(false);
  };

  const visibleCustomFields = customFieldDefinitions
    .filter((field) => field.ui_visible.value !== "hidden")
    .filter(
      (field) =>
        !(isEditing && field.ui_editable.value === "hidden") &&
        (isEditing ||
          field.ui_visible.value !== "if-set" ||
          hasCustomFieldValue(draft.customFields[field.name])),
    )
    .sort((left, right) => left.weight - right.weight);

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
              onClick={() => (isEditing ? cancelEditing() : startEditing())}
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

          <div className="object-info__field-stack">
            <label className="object-info__field">
              <span>Etiqueta de ativo</span>
              <input
                value={draft.assetTag}
                placeholder="Não informada"
                readOnly={!isEditing}
                onChange={(event) =>
                  updateField("assetTag", event.target.value)
                }
              />
            </label>
            <label className="object-info__field">
              <span>Número de série</span>
              <input
                value={draft.serial}
                placeholder="Não informado"
                readOnly={!isEditing}
                onChange={(event) => updateField("serial", event.target.value)}
              />
            </label>
          </div>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>Função</span>
              <input value={draft.role} readOnly />
            </label>
            <label className="object-info__field">
              <span>Status</span>
              <input value={draft.status} readOnly />
            </label>
          </div>

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
            <h2>Rede e tipo do dispositivo</h2>
            <p>Informações técnicas somente para consulta.</p>
          </div>

          <div className="object-info__field-stack">
            <label className="object-info__field">
              <span>IPv4 primário</span>
              <input value={draft.primaryIp4 ?? "Não informado"} readOnly />
            </label>
            <label className="object-info__field">
              <span>IPv6 primário</span>
              <input value={draft.primaryIp6 ?? "Não informado"} readOnly />
            </label>
          </div>

          <label className="object-info__field">
            <span>Tipo do dispositivo</span>
            <input value={draft.deviceType} readOnly />
            <small>O tipo é exibido apenas para consulta nesta tela.</small>
          </label>

          <label className="object-info__field">
            <span>Descrição do tipo</span>
            <textarea value={draft.deviceTypeDescription} rows={2} readOnly />
          </label>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>Fabricante</span>
              <input value={draft.manufacturer} readOnly />
            </label>
            <label className="object-info__field">
              <span>Altura</span>
              <input value={`${draft.height} U`} readOnly />
            </label>
          </div>
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

        {isLoadingCustomFields ? (
          <section className="object-info__card" aria-live="polite">
            <div className="object-info__section-title">
              <h2>Campos personalizados</h2>
              <p>Carregando configurações do NetBox…</p>
            </div>
          </section>
        ) : visibleCustomFields.length > 0 ? (
          <section className="object-info__card">
            <div className="object-info__section-title">
              <h2>Campos personalizados</h2>
              <p>Informações adicionais configuradas no NetBox.</p>
            </div>
            {visibleCustomFields.map((field, index) => {
              const previousGroup = visibleCustomFields[index - 1]?.group_name;
              return (
                <div className="object-info__custom-field" key={field.id}>
                  {field.group_name && field.group_name !== previousGroup ? (
                    <h3>{field.group_name}</h3>
                  ) : null}
                  <CustomFieldInput
                    field={field}
                    value={draft.customFields[field.name]}
                    isEditing={isEditing}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        customFields: {
                          ...current.customFields,
                          [field.name]: value,
                        },
                      }))
                    }
                  />
                </div>
              );
            })}
          </section>
        ) : customFieldsError ? (
          <p className="object-info__error" role="alert">
            Campos personalizados: {customFieldsError}
          </p>
        ) : null}

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
