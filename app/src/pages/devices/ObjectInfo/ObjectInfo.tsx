import { displayFallback, format, t } from "../../../i18n/language";
import { useEffect, useState, type SubmitEvent } from "react";
import QRCode from "qrcode";
import { saveQrCode } from "./save-qr-code";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useModalFocus } from "../../../hooks/useModalFocus";
import { useAccess } from "../../../context/AccessContext";
import type {
  ConnectionTermination,
  DeviceCustomFieldDefinition,
  NetBoxIpAddress,
  NetBoxRack,
} from "../../../services";
import type { OrganizationItem } from "../../organization/OrganizationList/OrganizationList";
import type { DeviceSummary } from "../shared/devices-data";
import CustomFieldInput from "./CustomFieldInput";
import DeviceConnections from "./DeviceConnections";
import {
  hasCustomFieldValue,
  normalizeCustomFieldValue,
} from "./custom-field-utils";
import "./ObjectInfo.css";

type ObjectInfoProps = {
  onBack: () => void;
  device: DeviceSummary;
  sites: readonly OrganizationItem[];
  racks: readonly NetBoxRack[];
  loadCustomFields: () => Promise<DeviceCustomFieldDefinition[]>;
  loadConnections: (deviceId: number) => Promise<ConnectionTermination[]>;
  loadIpAddresses: (deviceId: number) => Promise<NetBoxIpAddress[]>;
  onOpenConnection: (id: number) => void;
  onOpenDevice: (id: number) => void;
  onUpdate: (
    device: DeviceSummary,
    changedCustomFields: Record<string, unknown>,
  ) => Promise<DeviceSummary>;
};

function valuesMatch(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export default function ObjectInfo({
  onBack,
  device,
  sites,
  racks,
  loadCustomFields,
  loadConnections,
  loadIpAddresses,
  onOpenConnection,
  onOpenDevice,
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
  useModalFocus(Boolean(qrCodeUrl), () => setQrCodeUrl(""));
  const [isGeneratingQrCode, setIsGeneratingQrCode] = useState(false);
  const [qrCodeError, setQrCodeError] = useState("");
  const [isSavingQrCode, setIsSavingQrCode] = useState(false);
  const [qrCodeSaveMessage, setQrCodeSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [ipAddresses, setIpAddresses] = useState<NetBoxIpAddress[]>([]);
  const [isLoadingIpAddresses, setIsLoadingIpAddresses] = useState(false);
  const [ipAddressesError, setIpAddressesError] = useState("");

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

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    setIsLoadingIpAddresses(true);
    setIpAddressesError("");
    void loadIpAddresses(device.apiId)
      .then((addresses) => {
        if (active) setIpAddresses(addresses);
      })
      .catch((error: unknown) => {
        if (active)
          setIpAddressesError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os endereços IPv4.",
          );
      })
      .finally(() => {
        if (active) setIsLoadingIpAddresses(false);
      });
    return () => {
      active = false;
    };
  }, [device.apiId, isEditing, loadIpAddresses]);

  const updateField = <K extends keyof DeviceSummary>(
    field: K,
    value: DeviceSummary[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage(false);
  };

  const saveChanges = async (event: SubmitEvent<HTMLFormElement>) => {
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
      const updated = await onUpdate(
        {
          ...draft,
          name: draft.name.trim(),
          serial: draft.serial.trim(),
          assetTag: draft.assetTag.trim(),
          description: draft.description.trim(),
          customFields: {
            ...draft.customFields,
            ...changedCustomFields,
          },
        },
        changedCustomFields,
      );
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
    setQrCodeSaveMessage("");
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

  const downloadQrCode = async () => {
    if (!qrCodeUrl || isSavingQrCode) return;
    setIsSavingQrCode(true);
    setQrCodeError("");
    setQrCodeSaveMessage("");
    try {
      if (await saveQrCode(qrCodeUrl, device.id)) {
        setQrCodeSaveMessage("QR Code salvo com sucesso.");
      }
    } catch {
      setQrCodeError("Não foi possível salvar o QR Code. Tente novamente.");
    } finally {
      setIsSavingQrCode(false);
    }
  };

  return (
    <PageShell
      onBack={onBack}
      className="object-info-page"
      title={t("Informações do equipamento")}
      subtitle={t("Consulte os dados do equipamento ou ative a personalização para editá-los.")}
    >
      <section className="object-info__toolbar">
        <div>
          <strong>
            {t(isEditing ? "Personalização ativada" : "Modo de consulta")}
          </strong>
          <span>
            {t(isEditing
              ? "Altere os campos e salve ao finalizar."
              : "Os dados estão protegidos contra alterações.")}
          </span>
        </div>
        <div className="object-info__toolbar-actions">
          <button
            className="object-info__qr-button"
            type="button"
            disabled={isGeneratingQrCode}
            onClick={generateQrCode}
          >
            {t(isGeneratingQrCode ? "Gerando..." : "Gerar QR Code")}
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
              {t(isEditing ? "Cancelar" : "Personalizar")}
            </button>
          ) : null}
        </div>
      </section>

      {savedMessage ? (
        <p className="object-info__success" role="status">{t("Alterações salvas com sucesso.")}</p>
      ) : null}
      {qrCodeError ? (
        <p className="object-info__error" role="alert">
          {t(qrCodeError)}
        </p>
      ) : null}
      {saveError ? (
        <p className="object-info__error" role="alert">
          {t(saveError)}
        </p>
      ) : null}

      <form
        className="object-info__form"
        onSubmit={(event) => void saveChanges(event)}
      >
        <section className="object-info__card">
          <div className="object-info__section-title">
            <h2>{t("Identificação")}</h2>
            <p>{t("Dados principais do equipamento.")}</p>
          </div>

          <label className="object-info__field">
            <span>{t("Nome")}</span>
            <input
              required
              value={draft.name}
              readOnly={!isEditing}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>

          <div className="object-info__field-stack">
            <label className="object-info__field">
              <span>{t("Etiqueta de ativo")}</span>
              <input
                value={draft.assetTag}
                placeholder={t("Não informada")}
                readOnly={!isEditing}
                onChange={(event) =>
                  updateField("assetTag", event.target.value)
                }
              />
            </label>
            <label className="object-info__field">
              <span>{t("Número de série")}</span>
              <input
                value={draft.serial}
                placeholder={t("Não informado")}
                readOnly={!isEditing}
                onChange={(event) => updateField("serial", event.target.value)}
              />
            </label>
          </div>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>{t("Função")}</span>
              <input value={draft.role} readOnly />
            </label>
            <label className="object-info__field">
              <span>{t("Status")}</span>
              <input value={t(draft.status)} readOnly />
            </label>
          </div>

          <label className="object-info__field">
            <span>{t("Descrição")}</span>
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
            <h2>{t("Rede e tipo do equipamento")}</h2>
            <p>{t("Endereços e informações técnicas do equipamento.")}</p>
          </div>

          <div className="object-info__field-stack">
            <label className="object-info__field">
              <span>{t("IPv4 primário")}</span>
              {isEditing ? (
                <select
                  value={draft.primaryIp4Id ?? ""}
                  disabled={isLoadingIpAddresses || Boolean(ipAddressesError)}
                  onChange={(event) => {
                    const id = event.target.value
                      ? Number(event.target.value)
                      : null;
                    const selected = ipAddresses.find(
                      (address) => address.id === id,
                    );
                    setDraft((current) => ({
                      ...current,
                      primaryIp4Id: id,
                      primaryIp4: selected?.address ?? null,
                    }));
                    setSavedMessage(false);
                  }}
                >
                  <option value="">{t("Não informado")}</option>
                  {draft.primaryIp4Id !== null &&
                  !ipAddresses.some(
                    (address) => address.id === draft.primaryIp4Id,
                  ) ? (
                    <option value={draft.primaryIp4Id}>
                      {t(draft.primaryIp4 ?? `IPv4 atual (#${draft.primaryIp4Id})`)}
                    </option>
                  ) : null}
                  {ipAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {t(address.address)}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={draft.primaryIp4 ?? t("Não informado")} readOnly />
              )}
              {isEditing && isLoadingIpAddresses ? (
                <small>{t("Carregando endereços IPv4…")}</small>
              ) : null}
              {isEditing && ipAddressesError ? (
                <small className="object-info__field-error" role="alert">
                  {t(ipAddressesError)}
                </small>
              ) : null}
            </label>
            <label className="object-info__field">
              <span>{t("IPv6 primário")}</span>
              <input value={draft.primaryIp6 ?? t("Não informado")} readOnly />
            </label>
          </div>

          <label className="object-info__field">
            <span>{t("Tipo do equipamento")}</span>
            <input value={draft.deviceType} readOnly />
            <small>{t("O tipo é exibido apenas para consulta nesta tela.")}</small>
          </label>

          <label className="object-info__field">
            <span>{t("Descrição do tipo")}</span>
            <textarea value={displayFallback(draft.deviceTypeDescription, "Sem descrição")} rows={2} readOnly />
          </label>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>{t("Fabricante")}</span>
              <input value={displayFallback(draft.manufacturer, "Não informado")} readOnly />
            </label>
            <label className="object-info__field">
              <span>{t("Altura")}</span>
              <input value={`${draft.height} U`} readOnly />
            </label>
          </div>
        </section>

        <section className="object-info__card">
          <div className="object-info__section-title">
            <h2>{t("Localização")}</h2>
            <p>{t("Posição atual do equipamento na infraestrutura.")}</p>
          </div>

          <label className="object-info__field">
            <span>{t("Site")}</span>
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
            <span>{t("Região")}</span>
            <input value={draft.region} readOnly />
          </label>

          <div className="object-info__field-group">
            <label className="object-info__field">
              <span>{t("Rack")}</span>
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
                    // Remover apenas o rack não deve apagar a localização
                    // independente que já está associada ao equipamento.
                    locationId: rack
                      ? (rack.location?.id ?? null)
                      : current.locationId,
                    region: rack
                      ? (rack.location?.name ?? "Sem local")
                      : current.region,
                    allocatedUnit: rack ? current.allocatedUnit : 0,
                  }));
                }}
              >
                <option value="">{t("Sem rack")}</option>
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
              <span>{t("U alocado")}</span>
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
              <h2>{t("Campos personalizados")}</h2>
              <p>{t("Carregando configurações do NetBox…")}</p>
            </div>
          </section>
        ) : visibleCustomFields.length > 0 ? (
          <section className="object-info__card">
            <div className="object-info__section-title">
              <h2>{t("Campos personalizados")}</h2>
              <p>{t("Informações adicionais configuradas no NetBox.")}</p>
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
          <p className="object-info__error" role="alert">{t("Campos personalizados: ")}{t(customFieldsError)}
          </p>
        ) : null}

        {isEditing ? (
          <button
            className="object-info__save"
            type="submit"
            disabled={isSaving}
          >
            {t(isSaving ? "Salvando…" : "Salvar alterações")}
          </button>
        ) : null}
      </form>

      {can("dcim.interface", "view") ||
      can("dcim.frontport", "view") ||
      can("dcim.rearport", "view") ? (
        <DeviceConnections
          deviceId={device.apiId}
          load={loadConnections}
          onOpenCable={onOpenConnection}
          onOpenDevice={onOpenDevice}
        />
      ) : null}

      <button className="object-info__back" type="button" onClick={onBack}>{t("Voltar")}</button>

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
              aria-label={t("Fechar QR Code")}
              onClick={() => setQrCodeUrl("")}
            >{t("×")}</button>
            <span className="object-info__qr-icon" aria-hidden="true">
              ▦
            </span>
            <h2 id="object-qr-title">{t("QR Code do equipamento")}</h2>
            <p>{t("O código contém o ID ")}<strong>{device.id}</strong>.
            </p>
            <div className="object-info__qr-image">
              <img
                src={qrCodeUrl}
                alt={format("QR Code do equipamento {0}", [device.id])}
              />
            </div>
            <small>{t("Use o scanner do aplicativo para identificar este equipamento.")}</small>
            <div className="object-info__qr-actions">
              <button type="button" onClick={() => setQrCodeUrl("")}>{t("Fechar")}</button>
              <button type="button" disabled={isSavingQrCode} onClick={() => void downloadQrCode()}>
                {t(isSavingQrCode ? "Salvando…" : "Baixar QR Code")}
              </button>
            </div>
            {qrCodeError ? <p role="alert">{t(qrCodeError)}</p> : null}
            {qrCodeSaveMessage ? <p role="status">{t(qrCodeSaveMessage)}</p> : null}
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
