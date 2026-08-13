import type { z } from 'zod'
import type { briefObjectSchema, choiceSchema, deviceRoleSchema, deviceSchema, deviceTypeSchema, locationSchema, manufacturerSchema, rackGroupSchema, rackSchema, regionSchema, siteSchema } from '../client/schemas'

export type BriefObject = z.infer<typeof briefObjectSchema>
export type Choice = z.infer<typeof choiceSchema>
export type NetBoxDevice = z.infer<typeof deviceSchema>
export type NetBoxDeviceType = z.infer<typeof deviceTypeSchema>
export type NetBoxDeviceRole = z.infer<typeof deviceRoleSchema>
export type NetBoxManufacturer = z.infer<typeof manufacturerSchema>
export type NetBoxRack = z.infer<typeof rackSchema>
export type NetBoxRackGroup = z.infer<typeof rackGroupSchema>
export type NetBoxSite = z.infer<typeof siteSchema>
export type NetBoxLocation = z.infer<typeof locationSchema>
export type NetBoxRegion = z.infer<typeof regionSchema>

export type NetBoxData = {
  devices: NetBoxDevice[]
  deviceTypes: NetBoxDeviceType[]
  deviceRoles: NetBoxDeviceRole[]
  manufacturers: NetBoxManufacturer[]
  racks: NetBoxRack[]
  rackGroups: NetBoxRackGroup[]
  sites: NetBoxSite[]
  locations: NetBoxLocation[]
  regions: NetBoxRegion[]
}
