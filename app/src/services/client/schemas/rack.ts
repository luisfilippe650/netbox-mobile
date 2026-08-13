import { z } from 'zod'
import { briefObjectSchema, choiceSchema, descriptionSchema, entityIdSchema, nullableIdSchema, requiredNameSchema } from './common'

export const rackSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string(),
  site: briefObjectSchema,
  location: briefObjectSchema.nullable(),
  group: briefObjectSchema.nullable(),
  width: z.number().int().positive(),
  u_height: z.number().int().positive(),
  starting_unit: z.number().int().positive(),
  description: z.string(),
  status: choiceSchema,
  device_count: z.number().int().nonnegative(),
})

export const rackCreateSchema = z.object({
  name: requiredNameSchema,
  site: entityIdSchema,
  location: nullableIdSchema,
  group: nullableIdSchema,
  status: z.string().min(1),
  width: z.union([z.literal(10), z.literal(19), z.literal(21), z.literal(23)]),
  u_height: z.number().int().positive(),
  starting_unit: z.number().int().positive(),
  description: descriptionSchema,
})
