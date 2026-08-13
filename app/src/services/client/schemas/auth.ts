import { z } from 'zod'
import { entityIdSchema } from './common'

export const tokenSchema = z.object({
  id: entityIdSchema,
  version: z.union([z.literal(1), z.literal(2)]),
  key: z.string(),
  token: z.string().min(1),
  write_enabled: z.boolean(),
})

export const authenticationCheckSchema = z.object({
  id: entityIdSchema,
  username: z.string().min(1),
  display: z.string(),
})

export const loginInputSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário.'),
  password: z.string().min(1, 'Informe a senha.'),
})
