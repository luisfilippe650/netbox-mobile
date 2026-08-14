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

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
  context: string,
): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : context;
    return `${field}: ${issue.message}`;
  });
  throw new NetBoxApiError(
    `Dados inválidos em ${context}: ${issues.join(" · ")}`,
    0,
    result.error.issues,
  );
}

export function apiErrorMessage(payload: unknown, fallback: string): string {
  const serialized = JSON.stringify(payload).toLocaleLowerCase("en-US");
  if (serialized.includes("unable to log in with provided credentials"))
    return "Usuário ou senha inválidos.";
  if (serialized.includes("authentication credentials were not provided"))
    return "Sua sessão não é válida. Entre novamente.";
  if (typeof payload === "string" && payload.trim()) return payload;
  if (!payload || typeof payload !== "object") return fallback;

  const record = payload as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;

  const details = Object.entries(record).flatMap(([field, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    return messages
      .filter((message): message is string => typeof message === "string")
      .map((message) => `${field}: ${message}`);
  });
  return details.length > 0 ? details.join(" · ") : fallback;
}
