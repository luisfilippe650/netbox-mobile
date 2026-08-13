import { z } from 'zod'
import { briefObjectSchema, descriptionSchema, requiredNameSchema, requiredSlugSchema } from './common'

export const deviceRoleSchema = briefObjectSchema.extend({
  color: z.string(),
  vm_role: z.boolean(),
  device_count: z.number().int().nonnegative(),
})

export const roleCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  color: z.string().regex(/^[0-9a-fA-F]{6}$/, 'Informe uma cor hexadecimal válida.'),
  vm_role: z.boolean(),
  description: descriptionSchema,
})
