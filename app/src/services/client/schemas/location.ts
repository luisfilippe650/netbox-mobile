import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, entityIdSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const locationSchema = briefObjectSchema.extend({
  site: briefObjectSchema,
  parent: briefObjectSchema.nullable(),
  rack_count: z.number().int().nonnegative(),
  device_count: z.number().int().nonnegative(),
})

export const locationCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  status: z.string().min(1),
  site: entityIdSchema,
  description: descriptionSchema,
})
