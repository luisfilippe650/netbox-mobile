import type { DeviceCustomFieldDefinition } from "../../../services";

export function hasCustomFieldValue(value: unknown) {
  return !(
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function relatedObjectId(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "id" in value)
    return Number((value as { id: unknown }).id);
  return value;
}

export function normalizeCustomFieldValue(
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
