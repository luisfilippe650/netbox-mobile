import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "../../../components/PageShell/PageShell";
import { useAccess } from "../../../context/AccessContext";
import type {
  DeviceCustomFieldDefinition,
  DeviceRoleColor,
  NetBoxDeviceRole,
  NetBoxDeviceType,
  NetBoxRack,
} from "../../../services";
import type { OrganizationItem } from "../../organization/OrganizationList/OrganizationList";
import CustomFieldInput from "../ObjectInfo/CustomFieldInput";
import {
  hasCustomFieldValue,
  normalizeCustomFieldValue,
} from "../ObjectInfo/custom-field-utils";
import {
  defaultDeviceRoleColor,
  DeviceRoleColorPicker,
} from "../shared/DeviceRoleColorPicker";
import "./AddDevice.css";

export type DeviceCreateInput = {
  name: string;
  assetTag: string;
  serial: string;
  roleId: number;
  deviceTypeId: number;
  siteId: number;
  locationId: number | null;
  rackId: number | null;
  position: number | null;
  description: string;
  customFields: Record<string, unknown>;
};

type AddDeviceProps = {
  onBack: () => void;
  sites: readonly OrganizationItem[];
  locations: readonly OrganizationItem[];
  roles: readonly NetBoxDeviceRole[];
  deviceTypes: readonly NetBoxDeviceType[];
  racks: readonly NetBoxRack[];
  loadCustomFields: () => Promise<DeviceCustomFieldDefinition[]>;
  onCreate: (input: DeviceCreateInput) => Promise<void>;
  onCreateRole: (name: string, color: DeviceRoleColor) => Promise<void>;
  onCreateDeviceType: () => void;
};

export default function AddDevice({
  onBack,
  sites,
  locations,
  roles,
  deviceTypes,
  racks,
  loadCustomFields,
  onCreate,
  onCreateRole,
  onCreateDeviceType,
}: AddDeviceProps) {
  const { can } = useAccess();
  const [showFunctionForm, setShowFunctionForm] = useState(false);
  const [newFunction, setNewFunction] = useState("");
  const [newFunctionColor, setNewFunctionColor] = useState<DeviceRoleColor>(
    defaultDeviceRoleColor,
  );
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<
    DeviceCustomFieldDefinition[]
  >([]);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [isLoadingCustomFields, setIsLoadingCustomFields] = useState(true);
  const [customFieldsError, setCustomFieldsError] = useState("");
  const availableLocations = locations.filter(
    (location) => String(location.siteId) === selectedSite,
  );
  const availableRacks = racks.filter(
    (rack) =>
      rack.site.id === Number(selectedSite) &&
      (!selectedLocation || rack.location?.id === Number(selectedLocation)),
  );
  const visibleCustomFields = customFieldDefinitions
    .filter(
      (field) =>
        field.ui_visible.value !== "hidden" &&
        field.ui_editable.value !== "hidden",
    )
    .sort((left, right) => left.weight - right.weight);
  const requiredCustomFields = visibleCustomFields.filter(
    (field) => field.required,
  );
  const requiredEditableCustomFields = requiredCustomFields.filter(
    (field) => field.ui_editable.value === "yes",
  );
  const unavailableRequiredCustomFields = customFieldDefinitions.filter(
    (field) =>
      field.required &&
      (field.ui_visible.value === "hidden" ||
        field.ui_editable.value !== "yes") &&
      !hasCustomFieldValue(customFields[field.name]),
  );
  const customFieldsConfigurationError =
    unavailableRequiredCustomFields.length > 0
      ? `Os campos obrigatórios ${unavailableRequiredCustomFields
          .map((field) => `“${field.label || field.name}”`)
          .join(", ")} estão ocultos ou não editáveis e não possuem valor padrão. Ajuste a configuração no NetBox.`
      : "";

  useEffect(() => {
    let active = true;
    setIsLoadingCustomFields(true);
    setCustomFieldsError("");
    void loadCustomFields()
      .then((fields) => {
        if (!active) return;
        setCustomFieldDefinitions(fields);
        setCustomFields(
          Object.fromEntries(
            fields.map((field) => [
              field.name,
              field.default !== undefined
                ? field.default
                : field.type.value === "multiselect" ||
                    field.type.value === "multiobject"
                  ? []
                  : null,
            ]),
          ),
        );
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setCustomFieldsError(
          loadError instanceof Error
            ? loadError.message
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

  const createFunction = async () => {
    const name = newFunction.trim();
    if (!name) return;
    setIsSubmitting(true);
    setError("");
    try {
      await onCreateRole(name, newFunctionColor);
      setNewFunction("");
      setNewFunctionColor(defaultDeviceRoleColor);
      setShowFunctionForm(false);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar a função.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    try {
      if (customFieldsError)
        throw new Error(
          "Não é possível criar o equipamento sem verificar os campos personalizados.",
        );
      if (customFieldsConfigurationError)
        throw new Error(customFieldsConfigurationError);
      const missingRequiredFields = requiredEditableCustomFields.filter(
        (field) => !hasCustomFieldValue(customFields[field.name]),
      );
      if (missingRequiredFields.length > 0) {
        const names = missingRequiredFields
          .map((field) => `“${field.label || field.name}”`)
          .join(", ");
        throw new Error(
          `Preencha os campos personalizados obrigatórios: ${names}.`,
        );
      }
      const normalizedCustomFields = Object.fromEntries(
        visibleCustomFields.flatMap((field) =>
          field.ui_editable.value === "yes"
            ? [
                [
                  field.name,
                  normalizeCustomFieldValue(field, customFields[field.name]),
                ],
              ]
            : [],
        ),
      );
      setIsSubmitting(true);
      await onCreate({
        name: String(data.get("deviceName") ?? "").trim(),
        assetTag: String(data.get("assetTag") ?? "").trim(),
        serial: String(data.get("serial") ?? "").trim(),
        roleId: Number(data.get("deviceFunction")),
        deviceTypeId: Number(data.get("deviceType")),
        siteId: Number(data.get("site")),
        locationId: selectedLocation ? Number(selectedLocation) : null,
        rackId: data.get("rack") ? Number(data.get("rack")) : null,
        position: data.get("position") ? Number(data.get("position")) : null,
        description: String(data.get("description") ?? "").trim(),
        customFields: normalizedCustomFields,
      });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Não foi possível criar o equipamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell
      className="add-device-page"
      eyebrow="Equipamentos"
      title="Adicionar equipamento"
      subtitle="Preencha as informações do novo equipamento."
    >
      {error ? (
        <p className="add-device__error" role="alert">
          {error}
        </p>
      ) : null}
      <form
        className="add-device__form"
        onSubmit={(event) => void submit(event)}
      >
        <section className="add-device__section">
          <div className="add-device__section-title">
            <div>
              <h2>Dados do equipamento</h2>
              <p>Informe os dados principais do equipamento.</p>
            </div>
          </div>
          <label className="add-device__field">
            <span>Nome do equipamento</span>
            <input
              type="text"
              name="deviceName"
              placeholder="Ex.: Servidor principal"
            />
          </label>
          <label className="add-device__field">
            <span>Etiqueta de ativo</span>
            <input
              type="text"
              name="assetTag"
              maxLength={50}
              placeholder="Ex.: PAT-000123"
            />
          </label>
          <label className="add-device__field">
            <span>Número de série</span>
            <input
              type="text"
              name="serial"
              maxLength={50}
              placeholder="Ex.: SN123456789"
            />
          </label>
          <div className="add-device__field-group">
            <label className="add-device__field">
              <span>
                Função do equipamento <em>obrigatório</em>
              </span>
              <select name="deviceFunction" required defaultValue="">
                <option value="" disabled>
                  Selecione uma função
                </option>
                {roles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name ?? item.display}
                  </option>
                ))}
              </select>
            </label>
            {can("dcim.devicerole", "add") ? (
              <button
                className="add-device__create-related"
                type="button"
                onClick={() => setShowFunctionForm((current) => !current)}
              >
                + Criar função
              </button>
            ) : null}
          </div>
          {showFunctionForm ? (
            <div className="add-device__new-function">
              <label className="add-device__field">
                <span>Nova função</span>
                <input
                  autoFocus
                  value={newFunction}
                  onChange={(event) => setNewFunction(event.target.value)}
                  placeholder="Ex.: Firewall"
                />
              </label>
              <DeviceRoleColorPicker
                value={newFunctionColor}
                onChange={setNewFunctionColor}
                disabled={isSubmitting}
              />
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void createFunction()}
              >
                Adicionar função
              </button>
            </div>
          ) : null}
          <label className="add-device__field">
            <span>Descrição</span>
            <textarea
              name="description"
              rows={3}
              placeholder="Descreva o equipamento (opcional)"
            />
          </label>
          <div className="add-device__field-group">
            <label className="add-device__field">
              <span>
                Tipo de equipamento <em>obrigatório</em>
              </span>
              <select name="deviceType" required defaultValue="">
                <option value="" disabled>
                  Selecione um tipo
                </option>
                {deviceTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.model}
                  </option>
                ))}
              </select>
            </label>
            {can("dcim.devicetype", "add") ? (
              <button
                className="add-device__create-related"
                type="button"
                onClick={onCreateDeviceType}
              >
                + Criar tipo de equipamento
              </button>
            ) : null}
          </div>
        </section>
        <section className="add-device__section">
          <div className="add-device__section-title">
            <div>
              <h2>Localização</h2>
              <p>Vincule o equipamento ao local físico.</p>
            </div>
          </div>
          <label className="add-device__field">
            <span>
              Site <em>obrigatório</em>
            </span>
            <select
              name="site"
              required
              value={selectedSite}
              onChange={(event) => {
                setSelectedSite(event.target.value);
                setSelectedLocation("");
              }}
            >
              <option value="" disabled>
                Selecione um site
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <div className="add-device__field-group add-device__field-group--two">
            <label className="add-device__field">
              <span>Local</span>
              <select
                name="location"
                value={selectedLocation}
                disabled={!selectedSite || availableLocations.length === 0}
                onChange={(event) => setSelectedLocation(event.target.value)}
              >
                <option value="">
                  {!selectedSite
                    ? "Selecione o site primeiro"
                    : availableLocations.length === 0
                      ? "Nenhum local neste site"
                      : "Selecione um local"}
                </option>
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="add-device__field">
              <span>Rack</span>
              <select name="rack" defaultValue="">
                <option value="">Sem rack</option>
                {availableRacks.map((rack) => (
                  <option key={rack.id} value={rack.id}>
                    {rack.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="add-device__field">
            <span>Posição (U)</span>
            <input
              type="number"
              min="0.5"
              max="999.5"
              step="0.5"
              name="position"
              placeholder="Ex.: 12,5"
            />
          </label>
        </section>
        <section className="add-device__section">
          <div className="add-device__section-title">
            <div>
              <h2>Campos personalizados</h2>
              <p>Campos adicionais configurados para equipamentos no NetBox.</p>
            </div>
          </div>
          {isLoadingCustomFields ? (
            <p className="add-device__custom-fields-status" aria-live="polite">
              Carregando campos personalizados…
            </p>
          ) : customFieldsError ? (
            <p className="add-device__error" role="alert">
              Campos personalizados: {customFieldsError}
            </p>
          ) : (
            <>
              {customFieldsConfigurationError ? (
                <p className="add-device__error" role="alert">
                  {customFieldsConfigurationError}
                </p>
              ) : null}
              {visibleCustomFields.length === 0 ? (
                <p className="add-device__custom-fields-status">
                  Nenhum campo personalizado disponível para preenchimento.
                </p>
              ) : (
                <>
                  {requiredCustomFields.length > 0 ? (
                    <p className="add-device__required-notice" role="status">
                      {requiredCustomFields.length === 1
                        ? "Há 1 campo personalizado obrigatório."
                        : `Há ${requiredCustomFields.length} campos personalizados obrigatórios.`}{" "}
                      Preencha todos os campos editáveis indicados com *.
                    </p>
                  ) : null}
                  {visibleCustomFields.map((field, index) => {
                    const previousGroup =
                      visibleCustomFields[index - 1]?.group_name;
                    return (
                      <div className="add-device__custom-field" key={field.id}>
                        {field.group_name &&
                        field.group_name !== previousGroup ? (
                          <h3>{field.group_name}</h3>
                        ) : null}
                        <CustomFieldInput
                          field={field}
                          value={customFields[field.name]}
                          isEditing
                          onChange={(value) =>
                            setCustomFields((current) => ({
                              ...current,
                              [field.name]: value,
                            }))
                          }
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </section>
        <button
          className="add-device__save"
          type="submit"
          disabled={
            isSubmitting ||
            isLoadingCustomFields ||
            Boolean(customFieldsError) ||
            Boolean(customFieldsConfigurationError)
          }
        >
          {isSubmitting ? "Salvando…" : "Salvar equipamento"}
        </button>
      </form>
      <button
        className="page-button page-button--secondary add-device__back"
        type="button"
        onClick={onBack}
      >
        Voltar
      </button>
    </PageShell>
  );
}
