import { z } from "zod";
import {
  briefObjectSchema,
  choiceSchema,
  descriptionSchema,
  entityIdSchema,
  nullableIdSchema,
  requiredNameSchema,
  requiredSlugSchema,
} from "../client/client_dto";

// O NetBox serializa campos com choices como { value, label } em algumas
// versões/endpoints. A largura do rack é numericamente equivalente nos dois
// formatos, então a camada de DTO a normaliza antes de expor o dado ao app.
const rackWidthResponseSchema = z.union([
  z.number().int().positive(),
  z
    .object({
      value: z.number().int().positive(),
      label: z.string(),
    })
    .transform(({ value }) => value),
]);

export const rackSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string(),
  site: briefObjectSchema,
  location: briefObjectSchema.nullable(),
  group: briefObjectSchema.nullable(),
  role: briefObjectSchema.nullable(),
  width: rackWidthResponseSchema,
  u_height: z.number().int().positive(),
  starting_unit: z.number().int().positive(),
  description: z.string(),
  status: choiceSchema,
  device_count: z.number().int().nonnegative(),
});

export const rackCreateSchema = z.object({
  name: requiredNameSchema,
  site: entityIdSchema,
  location: nullableIdSchema,
  group: nullableIdSchema,
  role: nullableIdSchema,
  status: z.string().min(1),
  width: z.union([z.literal(10), z.literal(19), z.literal(21), z.literal(23)]),
  u_height: z.number().int().positive(),
  starting_unit: z.number().int().positive(),
  description: descriptionSchema,
});

export const rackGroupSchema = briefObjectSchema.extend({
  rack_count: z.number().int().nonnegative().default(0),
});

export const rackGroupCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  description: descriptionSchema,
});

export const rackRoleSchema = briefObjectSchema.extend({
  color: z.string(),
  rack_count: z.number().int().nonnegative().default(0),
});

export const rackRoleCreateSchema = z.object({
  name: requiredNameSchema,
  slug: requiredSlugSchema,
  color: z.string().regex(/^[0-9a-f]{6}$/),
  description: descriptionSchema,
});

export type NetBoxRack = z.infer<typeof rackSchema>;
export type NetBoxRackGroup = z.infer<typeof rackGroupSchema>;
export type NetBoxRackRole = z.infer<typeof rackRoleSchema>;
export type RackCreateDto = z.input<typeof rackCreateSchema>;
export type RackGroupCreateDto = z.input<typeof rackGroupCreateSchema>;
export type RackRoleCreateDto = z.input<typeof rackRoleCreateSchema>;
