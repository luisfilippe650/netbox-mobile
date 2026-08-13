import { NetBoxApiError, entityIdSchema, netboxClient } from '../../client'

export function deleteResource(resource: string, id: unknown) {
  const result = entityIdSchema.safeParse(id)
  if (!result.success) {
    throw new NetBoxApiError(
      `ID inválido para exclusão: ${result.error.issues[0]?.message}`,
      0,
      result.error.issues,
    )
  }
  return netboxClient.delete(`/dcim/${resource}/${result.data}/`)
}
