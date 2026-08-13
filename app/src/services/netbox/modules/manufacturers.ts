import { manufacturerCreateSchema, manufacturerSchema, netboxClient } from '../../client'
import { deleteResource } from './shared'

const endpoint = '/dcim/manufacturers/'

export const manufacturersModule = {
  list: () => netboxClient.list(endpoint, manufacturerSchema),
  create: (body: unknown) => netboxClient.create(endpoint, body, manufacturerCreateSchema, manufacturerSchema),
  delete: (id: number) => deleteResource('manufacturers', id),
}
