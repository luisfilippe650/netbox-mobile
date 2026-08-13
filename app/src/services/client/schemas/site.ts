import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, nullableIdSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const siteSchema = briefObjectSchema.extend({
  region: briefObjectSchema.nullable(),
  tenant: briefObjectSchema.nullable(),
  time_zone: z.string().nullable(),
  rack_count: z.number().int().nonnegative(),
  device_count: z.number().int().nonnegative(),
})

export const siteCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  status: z.string().min(1),
  region: nullableIdSchema,
  description: descriptionSchema,
})
