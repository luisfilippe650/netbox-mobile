import { z } from "zod";

export const requiredNameSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

export const requiredSlugSchema = z
  .string()
  .trim()
  .min(1, "O slug não pode ficar vazio.")
  .max(100)
  .regex(/^[a-z0-9_-]+$/, "O slug contém caracteres inválidos.");

export const entityIdSchema = z
  .number()
  .int("O identificador deve ser inteiro.")
  .positive("Selecione uma opção válida.");

export const nullableIdSchema = entityIdSchema.nullable().optional();

export const descriptionSchema = z
  .string()
  .trim()
  .max(200, "A descrição deve ter no máximo 200 caracteres.")
  .default("");

export const briefObjectSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export const choiceSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const emptyResponseSchema = z.null();

export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    count: z.number().int().nonnegative(),
    next: z.string().nullable(),
    results: z.array(itemSchema),
  });
}

export const tokenSchema = z.object({
  id: entityIdSchema,
  version: z.union([z.literal(1), z.literal(2)]),
  key: z.string(),
  token: z.string().min(1),
  write_enabled: z.boolean(),
});

export const objectPermissionSchema = z.object({
  id: entityIdSchema,
  name: z.string(),
  enabled: z.boolean().default(true),
  object_types: z.array(z.string()),
  actions: z.array(z.string()),
  constraints: z.unknown().optional(),
});

export const authenticationCheckSchema = z.object({
  id: entityIdSchema,
  username: z.string().min(1),
  display: z.string(),
  first_name: z.string().default(""),
  last_name: z.string().default(""),
  email: z.string().default(""),
  groups: z
    .array(
      z.object({
        id: entityIdSchema,
        name: z.string(),
        permissions: z.array(objectPermissionSchema).default([]),
      }),
    )
    .default([]),
  permissions: z.array(objectPermissionSchema).default([]),
});

export const loginInputSchema = z.object({
  username: z.string().trim().min(1, "Informe o usuário."),
  password: z.string().min(1, "Informe a senha."),
});

export type NetBoxToken = z.infer<typeof tokenSchema>;
export type AuthenticatedUser = z.infer<typeof authenticationCheckSchema>;
export type NetBoxObjectPermission = z.infer<typeof objectPermissionSchema>;
export type LoginDto = z.infer<typeof loginInputSchema>;
