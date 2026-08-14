export function hasCustomFieldValue(value: unknown) {
  return !(
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}
