import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const rackGroupSchema = briefObjectSchema.extend({
  rack_count: z.number().int().nonnegative().default(0),
})

export const rackGroupCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
})
