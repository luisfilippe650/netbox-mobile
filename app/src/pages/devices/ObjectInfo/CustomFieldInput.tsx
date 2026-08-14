import type {
  DeviceCustomFieldDefinition,
  NetBoxRelatedObject,
} from "../../../services";
import { hasCustomFieldValue } from "./custom-field-utils";

type CustomFieldInputProps = {
  field: DeviceCustomFieldDefinition;
  value: unknown;
  isEditing: boolean;
  onChange: (value: unknown) => void;
};

function objectId(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id: unknown }).id;
    return typeof id === "number" ? id : Number(id);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function objectLabel(value: unknown) {
  if (typeof value === "object" && value !== null) {
    if ("display" in value && typeof value.display === "string")
      return value.display;
    if ("name" in value && typeof value.name === "string") return value.name;
  }
  return String(value ?? "Não informado");
}

function formatValue(value: unknown, type: DeviceCustomFieldDefinition["type"]["value"]) {
  if (!hasCustomFieldValue(value)) return "Não informado";
  if (type === "boolean") return value ? "Sim" : "Não";
  if (type === "json") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  if (Array.isArray(value)) return value.map(objectLabel).join(", ");
  if (type === "object") return objectLabel(value);
  if (type === "datetime" && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("pt-BR");
  }
  return String(value);
}

function dateTimeInputValue(value: unknown) {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const localOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - localOffset).toISOString().slice(0, 16);
}

function currentRelatedObjects(value: unknown): NetBoxRelatedObject[] {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((item) => {
    const id = objectId(item);
    return id === null ? [] : [{ id, display: objectLabel(item) }];
  });
}

export default function CustomFieldInput({
  field,
  value,
  isEditing,
  onChange,
}: CustomFieldInputProps) {
  const label = field.label || field.name;
  const editable = isEditing && field.ui_editable.value === "yes";
  const helpId = `custom-field-${field.id}-help`;
  const describedBy = field.description ? helpId : undefined;

  if (!editable) {
    return (
      <div className="object-info__field">
        <span>
          {label}
          {field.required ? (
            <span className="object-info__required"> *</span>
          ) : null}
        </span>
        <div className="object-info__field-value">
          {field.type.value === "json" ? (
            <pre>{formatValue(value, field.type.value)}</pre>
          ) : (
            formatValue(value, field.type.value)
          )}
        </div>
        {field.description ? <small id={helpId}>{field.description}</small> : null}
      </div>
    );
  }

  const common = {
    required: field.required,
    "aria-describedby": describedBy,
  };
  const type = field.type.value;
  let control;

  if (type === "longtext" || type === "json") {
    const textValue =
      type === "json" && typeof value !== "string"
        ? hasCustomFieldValue(value)
          ? JSON.stringify(value, null, 2)
          : ""
        : String(value ?? "");
    control = (
      <textarea
        {...common}
        rows={type === "json" ? 6 : 3}
        value={textValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  } else if (type === "boolean") {
    control = (
      <select
        {...common}
        value={value === true ? "true" : value === false ? "false" : ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : event.target.value === "true")
        }
      >
        <option value="" disabled={field.required}>
          {field.required ? "Selecione uma opção" : "Não informado"}
        </option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
    );
  } else if (type === "select" || type === "multiselect") {
    const serialize = (choice: string | number | boolean) => JSON.stringify(choice);
    const deserialize = (choice: string) => JSON.parse(choice) as unknown;
    const currentChoices = (Array.isArray(value) ? value : [value]).flatMap(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
          ? ([[item, String(item)]] as const)
          : [],
    );
    const choices = [...currentChoices, ...field.choices].filter(
      (choice, index, all) =>
        all.findIndex((item) => serialize(item[0]) === serialize(choice[0])) ===
        index,
    );
    control = (
      <select
        {...common}
        multiple={type === "multiselect"}
        value={
          type === "multiselect"
            ? (Array.isArray(value) ? value : []).map((item) => serialize(item as string | number | boolean))
            : hasCustomFieldValue(value)
              ? serialize(value as string | number | boolean)
              : ""
        }
        onChange={(event) =>
          onChange(
            type === "multiselect"
              ? Array.from(event.target.selectedOptions, (option) => deserialize(option.value))
              : event.target.value === ""
                ? null
                : deserialize(event.target.value),
          )
        }
      >
        {type === "select" ? (
          <option value="" disabled={field.required}>
            {field.required ? "Selecione uma opção" : "Não informado"}
          </option>
        ) : null}
        {choices.map(([choiceValue, choiceLabel]) => (
          <option key={serialize(choiceValue)} value={serialize(choiceValue)}>
            {choiceLabel}
          </option>
        ))}
      </select>
    );
  } else if (type === "object" || type === "multiobject") {
    const selectedIds = (Array.isArray(value) ? value : [value])
      .map(objectId)
      .filter((id): id is number => id !== null);
    const options = [
      ...currentRelatedObjects(value),
      ...field.relatedObjects,
    ].filter((option, index, all) => all.findIndex((item) => item.id === option.id) === index);
    control = (
      <select
        {...common}
        multiple={type === "multiobject"}
        value={type === "multiobject" ? selectedIds.map(String) : String(selectedIds[0] ?? "")}
        onChange={(event) =>
          onChange(
            type === "multiobject"
              ? Array.from(event.target.selectedOptions, (option) => Number(option.value))
              : event.target.value
                ? Number(event.target.value)
                : null,
          )
        }
      >
        {type === "object" ? (
          <option value="" disabled={field.required}>
            {field.required ? "Selecione um objeto" : "Não informado"}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.display}
          </option>
        ))}
      </select>
    );
  } else {
    const inputType = {
      integer: "number",
      decimal: "number",
      date: "date",
      datetime: "datetime-local",
      url: "url",
      text: "text",
    }[type] ?? "text";
    control = (
      <input
        {...common}
        type={inputType}
        step={type === "integer" ? 1 : type === "decimal" ? "any" : undefined}
        min={field.validation_minimum ?? undefined}
        max={field.validation_maximum ?? undefined}
        pattern={field.validation_regex || undefined}
        value={type === "datetime" ? dateTimeInputValue(value) : String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <label className="object-info__field">
      <span>
        {label}
        {field.required ? <span className="object-info__required"> *</span> : null}
      </span>
      {control}
      {field.description ? <small id={helpId}>{field.description}</small> : null}
    </label>
  );
}
