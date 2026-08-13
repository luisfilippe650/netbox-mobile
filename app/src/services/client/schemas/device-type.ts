import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, entityIdSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const deviceTypeSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  model: z.string(),
  slug: z.string(),
  manufacturer: briefObjectSchema,
  u_height: z.number(),
  description: z.string(),
  device_count: z.number().int().nonnegative(),
})

export const deviceTypeCreateSchema = z.object({
  manufacturer: entityIdSchema,
  model: requiredNameSchema,
  slug: requiredSlugSchema,
  u_height: z.number().nonnegative(),
  description: descriptionSchema,
})
