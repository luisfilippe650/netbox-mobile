import { z } from 'zod'
import {
  briefObjectSchema,
  descriptionSchema,
  entityIdSchema,
  nullableIdSchema,
  requiredNameSchema,
  requiredSlugSchema,
} from '../client/client_dto'

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

export const regionSchema = briefObjectSchema.extend({
  parent: briefObjectSchema.nullable(),
  site_count: z.number().int().nonnegative(),
})

export const regionCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
})

export type NetBoxSite = z.infer<typeof siteSchema>
export type NetBoxLocation = z.infer<typeof locationSchema>
export type NetBoxRegion = z.infer<typeof regionSchema>
export type SiteCreateDto = z.input<typeof siteCreateSchema>
export type LocationCreateDto = z.input<typeof locationCreateSchema>
export type RegionCreateDto = z.input<typeof regionCreateSchema>
