import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const regionSchema = briefObjectSchema.extend({
  parent: briefObjectSchema.nullable(),
  site_count: z.number().int().nonnegative(),
})

export const regionCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
})
