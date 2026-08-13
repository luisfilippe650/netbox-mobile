import { z } from 'zod'

export const requiredNameSchema = z.string()
  .trim()
  .min(1, 'Informe o nome.')
  .max(100, 'O nome deve ter no máximo 100 caracteres.')

export const requiredSlugSchema = z.string()
  .trim()
  .min(1, 'O slug não pode ficar vazio.')
  .max(100)
  .regex(/^[a-z0-9_-]+$/, 'O slug contém caracteres inválidos.')

export const entityIdSchema = z.number()
  .int('O identificador deve ser inteiro.')
  .positive('Selecione uma opção válida.')

export const nullableIdSchema = entityIdSchema.nullable().optional()

export const descriptionSchema = z.string()
  .trim()
  .max(200, 'A descrição deve ter no máximo 200 caracteres.')
  .default('')

export const briefObjectSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
})

export const choiceSchema = z.object({
  value: z.string(),
  label: z.string(),
})

export const emptyResponseSchema = z.null()

export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    count: z.number().int().nonnegative(),
    next: z.string().nullable(),
    results: z.array(itemSchema),
  })
}
