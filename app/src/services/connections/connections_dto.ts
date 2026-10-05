import { z } from "zod";
import { choiceSchema, entityIdSchema } from "../client";

export const terminationKindSchema = z.enum([
  "dcim.interface",
  "dcim.frontport",
  "dcim.rearport",
]);

export const terminationReferenceSchema = z.object({
  object_type: terminationKindSchema,
  object_id: entityIdSchema,
});

const urlSchema = z.string().url();
const nullableChoiceSchema = choiceSchema.nullable();

export const briefDeviceSchema = z.object({
  id: entityIdSchema,
  display: z.string(),
  name: z.string().nullable().optional(),
});

export const briefCableSchema = z.object({
  id: entityIdSchema,
  url: urlSchema.optional(),
  display: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
});

const cableOnTerminationSchema = z.union([
  entityIdSchema,
  briefCableSchema,
  z.null(),
]);

const mappingToRearSchema = z.object({
  position: z.number().int().positive(),
  rear_port: entityIdSchema,
  rear_port_position: z.number().int().positive().default(1),
});

const mappingToFrontSchema = z.object({
  position: z.number().int().positive(),
  front_port: entityIdSchema,
  front_port_position: z.number().int().positive().default(1),
});

export const portTerminationSchema = z.object({
  id: entityIdSchema,
  url: urlSchema.optional(),
  display: z.string(),
  device: briefDeviceSchema,
  name: z.string(),
  label: z.string().default(""),
  type: choiceSchema.optional(),
  enabled: z.boolean().optional(),
  mark_connected: z.boolean().default(false),
  cable: cableOnTerminationSchema.optional().default(null),
  cable_end: z.enum(["A", "B"]).nullable().optional(),
  link_peers: z.array(z.unknown()).default([]),
  link_peers_type: z.string().nullable().optional(),
  connected_endpoints: z.array(z.unknown()).nullable().optional(),
  connected_endpoints_type: z.string().nullable().optional(),
  connected_endpoints_reachable: z.boolean().optional(),
  wireless_link: z.unknown().nullable().optional(),
  rear_ports: z.array(mappingToRearSchema).optional(),
  front_ports: z.array(mappingToFrontSchema).optional(),
  positions: z.number().int().positive().optional(),
  _occupied: z.boolean(),
});

const genericTerminationSchema = terminationReferenceSchema.extend({
  object: portTerminationSchema.nullable(),
});

const cableStatusSchema = z.object({
  value: z.enum(["connected", "planned", "decommissioning"]),
  label: z.string(),
});

const tracedCableStatusSchema = z
  .union([
    cableStatusSchema,
    z.enum(["connected", "planned", "decommissioning"]),
  ])
  .transform((status) =>
    typeof status === "string"
      ? {
          value: status,
          label: {
            connected: "Connected",
            planned: "Planned",
            decommissioning: "Decommissioning",
          }[status],
        }
      : status,
  );

const optionalCableChoiceSchema = z.union([
  choiceSchema,
  z.string(),
  z.null(),
]);

export const cableSchema = z.object({
  id: entityIdSchema,
  url: urlSchema,
  display_url: urlSchema.optional(),
  display: z.string(),
  type: optionalCableChoiceSchema.optional(),
  a_terminations: z.array(genericTerminationSchema),
  b_terminations: z.array(genericTerminationSchema),
  status: cableStatusSchema,
  profile: optionalCableChoiceSchema.optional(),
  label: z.string().default(""),
  color: z.string().default(""),
  length: z.number().nullable().default(null),
  length_unit: nullableChoiceSchema.optional(),
  description: z.string().default(""),
  created: z.string().optional(),
  last_updated: z.string().optional(),
});

export const tracedCableSchema = z.object({
  id: entityIdSchema,
  url: urlSchema,
  display_url: urlSchema.optional(),
  type: optionalCableChoiceSchema.optional(),
  status: tracedCableStatusSchema,
  label: z.string().default(""),
  color: z.string().default(""),
  length: z.number().nullable().default(null),
  length_unit: nullableChoiceSchema.optional(),
  description: z.string().default(""),
});

export const traceTerminationSchema = portTerminationSchema;
export const traceSegmentSchema = z.tuple([
  z.array(traceTerminationSchema),
  tracedCableSchema.nullable(),
  z.array(traceTerminationSchema),
]);
export const traceResponseSchema = z.array(traceSegmentSchema);

export const cablePathSchema = z.object({
  id: entityIdSchema,
  path: z.array(z.array(z.record(z.string(), z.unknown()))),
  is_active: z.boolean(),
  is_complete: z.boolean(),
  is_split: z.boolean(),
});
export const cablePathListSchema = z.array(cablePathSchema);

const optionChoiceSchema = z.object({
  value: z.string(),
  display_name: z.string(),
});
const optionFieldSchema = z.object({
  required: z.boolean().optional(),
  read_only: z.boolean().optional(),
  choices: z.array(optionChoiceSchema).optional(),
});
export const cableOptionsSchema = z.object({
  actions: z.object({
    POST: z.record(z.string(), optionFieldSchema),
  }),
});

export const cableCreateSchema = z
  .object({
    a_terminations: z.array(terminationReferenceSchema).length(1),
    b_terminations: z.array(terminationReferenceSchema).length(1),
    status: z.enum(["connected", "planned", "decommissioning"]),
    type: z.string().optional(),
    label: z.string().max(100).optional(),
    color: z
      .union([z.literal(""), z.string().regex(/^[0-9a-f]{6}$/)])
      .optional(),
    length: z.number().positive().optional(),
    length_unit: z.enum(["km", "m", "cm", "mi", "ft", "in"]).optional(),
    description: z.string().max(200).optional(),
  })
  .superRefine((value, context) => {
    if (value.length !== undefined && value.length_unit === undefined) {
      context.addIssue({
        code: "custom",
        path: ["length_unit"],
        message: "Informe a unidade do comprimento.",
      });
    }
  });

export type TerminationKind = z.infer<typeof terminationKindSchema>;
export type TerminationReference = z.infer<typeof terminationReferenceSchema>;
export type ConnectionTermination = z.infer<typeof portTerminationSchema> & {
  kind: TerminationKind;
};
export type NetBoxCable = z.infer<typeof cableSchema>;
export type TracedCable = z.infer<typeof tracedCableSchema>;
export type TraceResponse = z.infer<typeof traceResponseSchema>;
export type CablePath = z.infer<typeof cablePathSchema>;
export type CableCreate = z.infer<typeof cableCreateSchema>;
export type CableOptions = z.infer<typeof cableOptionsSchema>;
