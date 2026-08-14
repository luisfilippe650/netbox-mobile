import { z } from 'zod'
import {
  briefObjectSchema,
  choiceSchema,
  descriptionSchema,
  entityIdSchema,
  nullableIdSchema,
  requiredNameSchema,
  requiredSlugSchema,
} from '../client/client_dto'

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

export const deviceRoleSchema = briefObjectSchema.extend({
  color: z.string(),
  vm_role: z.boolean(),
  device_count: z.number().int().nonnegative(),
})

export const deviceRoleColors = [
  { label: 'Vermelho escuro', value: 'aa1409' },
  { label: 'Vermelho', value: 'f44336' },
  { label: 'Rosa', value: 'e91e63' },
  { label: 'Fúcsia', value: 'ff66ff' },
  { label: 'Roxo', value: '9c27b0' },
  { label: 'Roxo escuro', value: '673ab7' },
  { label: 'Índigo', value: '3f51b5' },
  { label: 'Azul', value: '2196f3' },
  { label: 'Azul claro', value: '03a9f4' },
  { label: 'Ciano', value: '00bcd4' },
  { label: 'Azul-petróleo', value: '009688' },
  { label: 'Aqua', value: '00ffff' },
  { label: 'Verde escuro', value: '2f6a31' },
  { label: 'Verde', value: '4caf50' },
  { label: 'Verde claro', value: '8bc34a' },
  { label: 'Verde-limão', value: 'cddc39' },
  { label: 'Amarelo', value: 'ffeb3b' },
  { label: 'Âmbar', value: 'ffc107' },
  { label: 'Laranja', value: 'ff9800' },
  { label: 'Laranja escuro', value: 'ff5722' },
  { label: 'Marrom', value: '795548' },
  { label: 'Cinza', value: '9e9e9e' },
  { label: 'Cinza claro', value: 'c0c0c0' },
  { label: 'Cinza escuro', value: '607d8b' },
  { label: 'Preto', value: '111111' },
  { label: 'Branco', value: 'ffffff' },
] as const

export type DeviceRoleColor = typeof deviceRoleColors[number]['value']

const deviceRoleColorValues = deviceRoleColors.map(({ value }) => value) as [DeviceRoleColor, ...DeviceRoleColor[]]
export const deviceRoleColorSchema = z.enum(deviceRoleColorValues)

export const deviceRoleCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  color: deviceRoleColorSchema,
  vm_role: z.boolean(),
  description: descriptionSchema,
})

export const manufacturerSchema = briefObjectSchema.extend({
  device_type_count: z.number().int().nonnegative().default(0),
})

export const manufacturerCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
})

export type NetBoxDevice = z.infer<typeof deviceSchema>
export type NetBoxDeviceType = z.infer<typeof deviceTypeSchema>
export type NetBoxDeviceRole = z.infer<typeof deviceRoleSchema>
export type NetBoxManufacturer = z.infer<typeof manufacturerSchema>
export type DeviceCreateDto = z.input<typeof deviceCreateSchema>
export type DeviceUpdateDto = z.input<typeof deviceUpdateSchema>
export type DeviceTypeCreateDto = z.input<typeof deviceTypeCreateSchema>
export type DeviceRoleCreateDto = z.input<typeof deviceRoleCreateSchema>
export type ManufacturerCreateDto = z.input<typeof manufacturerCreateSchema>
