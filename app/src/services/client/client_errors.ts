import { z } from "zod";

export class NetBoxApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "NetBoxApiError";
    this.status = status;
    this.details = details;
  }
}

function valueAtPath(value: unknown, path: PropertyKey[]): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (current === null || typeof current !== "object") return undefined;
    return (current as Record<PropertyKey, unknown>)[segment];
  }, value);
}

function isSensitivePath(path: PropertyKey[]) {
  return path.some((segment) =>
    /password|senha|token|authorization|secret|key/i.test(String(segment)),
  );
}

function describeValue(value: unknown, sensitive: boolean): string {
  if (sensitive) return "[valor oculto]";
  if (value === undefined) return "campo ausente";
  if (value === null) return "null";
  if (typeof value === "string") {
    const shortened = value.length > 120 ? `${value.slice(0, 117)}...` : value;
    return `texto ${JSON.stringify(shortened)}`;
  }
  if (typeof value === "number") return `número ${String(value)}`;
  if (typeof value === "boolean") return `booleano ${String(value)}`;
  if (Array.isArray(value)) return `lista com ${value.length} item(ns)`;
  if (typeof value === "object") {
    const serialized = JSON.stringify(value);
    const shortened =
      serialized.length > 160 ? `${serialized.slice(0, 157)}...` : serialized;
    return `objeto ${shortened}`;
  }
  return `valor do tipo ${typeof value}`;
}

function translateExpectedType(expected: string): string {
  const types: Record<string, string> = {
    string: "texto",
    number: "número",
    boolean: "booleano",
    object: "objeto",
    array: "lista",
    int: "número inteiro",
  };
  return types[expected] ?? expected;
}

function issueRequirement(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case "invalid_type":
      return `esperado ${translateExpectedType(issue.expected)}`;
    case "invalid_value":
      return `esperado um destes valores: ${issue.values.map(String).join(", ")}`;
    case "too_small":
    case "too_big":
    case "invalid_format":
    case "not_multiple_of":
    case "custom":
      return issue.message;
    case "invalid_union":
      return "o valor não corresponde a nenhum dos formatos aceitos";
    case "unrecognized_keys":
      return `campo(s) não reconhecido(s): ${issue.keys.join(", ")}`;
    default:
      return issue.message;
  }
}

function formatSchemaIssue(
  issue: z.core.$ZodIssue,
  value: unknown,
  context: string,
) {
  const field = issue.path.length > 0 ? issue.path.map(String).join(".") : context;
  const received = valueAtPath(value, issue.path);
  return `campo "${field}": ${issueRequirement(issue)}; recebido ${describeValue(received, isSensitivePath(issue.path))}`;
}

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
  context: string,
): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) =>
    formatSchemaIssue(issue, value, context),
  );
  throw new NetBoxApiError(
    `Falha de validação em ${context}: ${issues.join(" · ")}`,
    0,
    result.error.issues,
  );
}

function flattenApiDetails(
  value: unknown,
  path: string[] = [],
): string[] {
  if (typeof value === "string" && value.trim()) {
    const detail = isSensitivePath(path) ? "[valor oculto]" : value;
    return [path.length > 0 ? `${path.join(".")}: ${detail}` : detail];
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return [path.length > 0 ? `${path.join(".")}: ${String(value)}` : String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenApiDetails(item, path.length > 0 ? path : [String(index)]),
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([field, nested]) => flattenApiDetails(nested, [...path, field]),
    );
  }
  return [];
}

export function apiErrorMessage(payload: unknown, fallback: string): string {
  const serialized =
    JSON.stringify(payload)?.toLocaleLowerCase("en-US") ?? "";
  if (serialized.includes("unable to log in with provided credentials"))
    return "Usuário ou senha inválidos.";
  if (serialized.includes("authentication credentials were not provided"))
    return "Sua sessão não é válida. Entre novamente.";
  const details = flattenApiDetails(payload);
  return details.length > 0 ? details.join(" · ") : fallback;
}
