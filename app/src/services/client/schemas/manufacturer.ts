import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const manufacturerSchema = briefObjectSchema.extend({
  device_type_count: z.number().int().nonnegative().default(0),
})

export const manufacturerCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
})
