import { z } from 'zod'
import { briefObjectSchema, choiceSchema, entityIdSchema, nullableIdSchema } from './common'

export const deviceSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string().nullable(),
  device_type: briefObjectSchema.extend({
    model: z.string().optional(),
    u_height: z.number().optional(),
    manufacturer: briefObjectSchema.optional(),
  }),
  role: briefObjectSchema,
  site: briefObjectSchema.extend({ region: briefObjectSchema.nullable().optional() }),
  location: briefObjectSchema.nullable(),
  rack: briefObjectSchema.nullable(),
  position: z.number().nullable(),
  status: choiceSchema,
  serial: z.string(),
  asset_tag: z.string().nullable(),
  description: z.string(),
})

export const deviceCreateSchema = z.object({
  name: z.string().trim().max(64, 'O nome deve ter no máximo 64 caracteres.'),
  device_type: entityIdSchema,
  role: entityIdSchema,
  site: entityIdSchema,
  location: nullableIdSchema,
  rack: nullableIdSchema,
  position: z.number()
    .min(0.5, 'A posição deve ser no mínimo 0,5 U.')
    .lt(1000, 'A posição deve ser menor que 1000 U.')
    .nullable()
    .optional(),
  face: z.enum(['front', 'rear']).optional(),
  status: z.string().min(1),
  description: z.string().trim().max(200),
}).superRefine((value, context) => {
  if (value.position && !value.rack) {
    context.addIssue({ code: 'custom', path: ['position'], message: 'Selecione um rack antes de informar a posição.' })
  }
})

export const deviceUpdateSchema = z.object({
  name: z.string().trim().max(64).optional(),
  description: z.string().trim().max(200).optional(),
  site: entityIdSchema.optional(),
  location: nullableIdSchema,
  rack: nullableIdSchema,
  position: z.number()
    .min(0.5, 'A posição deve ser no mínimo 0,5 U.')
    .lt(1000, 'A posição deve ser menor que 1000 U.')
    .nullable()
    .optional(),
  face: z.enum(['front', 'rear']).optional(),
}).superRefine((value, context) => {
  if (value.position && value.rack === null) {
    context.addIssue({ code: 'custom', path: ['position'], message: 'Não é possível informar posição sem rack.' })
  }
})
