import { useEffect, useMemo, useState } from 'react'
import Login from './pages/login/Login'
import Home, { type DeleteKind } from './pages/home/Home'
import ScannerPage from './pages/scanner/Scanner'
import ObjectInfoPage from './pages/devices/ObjectInfo'
import DevicesPage from './pages/devices/Devices'
import type { DeviceSummary } from './pages/devices/devices-data'
import AddDevicePage, { type DeviceCreateInput } from './pages/devices/AddDevice'
import AddDeviceTypePage, { type DeviceTypeCreateInput } from './pages/devices/AddDeviceType'
import ManufacturersPage from './pages/devices/Manufacturers'
import DeviceFunctionsPage from './pages/devices/DeviceFunctions'
import RackInfoPage from './pages/rack-info/RackInfo'
import AddRackPage, { type RackCreateInput } from './pages/racks/AddRack'
import AddRackGroupPage from './pages/racks/AddRackGroup'
import RackDetailsPage from './pages/racks/RackDetails'
import type { RackSummary } from './pages/racks/data'
import SitesPage from './pages/organization/Sites'
import LocationsPage from './pages/organization/Locations'
import RegionsPage from './pages/organization/Regions'
import type { OrganizationCreateInput } from './pages/organization/OrganizationList'
import { loadNetBoxData, netbox, netboxClient, slugify, type NetBoxData } from './services/netbox'
import { mapDevice, mapDeviceRoles, mapLocations, mapManufacturers, mapRacks, mapRegions, mapSites } from './services/netbox/mappers'
import './utils/colors.css'

type Page = 'login' | 'home' | 'scanner' | 'object-info' | 'devices' | 'add-device' | 'add-device-type' | 'manufacturers' | 'device-functions' | 'rack-info' | 'rack-details' | 'add-rack' | 'add-rack-group' | 'sites' | 'locations' | 'regions'

const emptyData: NetBoxData = { devices: [], deviceTypes: [], deviceRoles: [], manufacturers: [], racks: [], rackGroups: [], sites: [], locations: [], regions: [] }

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [data, setData] = useState<NetBoxData>(emptyData)
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null)
  const [selectedRack, setSelectedRack] = useState<RackSummary | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [appError, setAppError] = useState('')

  const devices = useMemo(() => data.devices.map(mapDevice), [data.devices])
  const sites = useMemo(() => mapSites(data.sites), [data.sites])
  const locations = useMemo(() => mapLocations(data.locations), [data.locations])
  const regions = useMemo(() => mapRegions(data.regions), [data.regions])
  const manufacturers = useMemo(() => mapManufacturers(data.manufacturers), [data.manufacturers])
  const deviceRoles = useMemo(() => mapDeviceRoles(data.deviceRoles), [data.deviceRoles])
  const racks = useMemo(() => mapRacks(data.racks, devices), [data.racks, devices])

  const refresh = async () => {
    const nextData = await loadNetBoxData()
    setData(nextData)
    return nextData
  }

  useEffect(() => {
    void (async () => {
      try {
        if (await netboxClient.restoreSession()) {
          await refresh()
          setPage('home')
        }
      } catch (error) {
        setAppError(error instanceof Error ? error.message : 'Não foi possível carregar o NetBox.')
      } finally {
        setCheckingSession(false)
      }
    })()
  }, [])

  const login = async (username: string, password: string) => {
    await netboxClient.login(username, password)
    try {
      await refresh()
      setAppError('')
      setPage('home')
    } catch (error) {
      netboxClient.clearSession()
      throw error
    }
  }

  const logout = async () => {
    try { await netboxClient.logout() } catch { netboxClient.clearSession() }
    setData(emptyData); setSelectedDevice(null); setSelectedRack(null); setPage('login')
  }

  const createRole = async (name: string, input?: OrganizationCreateInput) => {
    await netbox.deviceRoles.create({ name, slug: slugify(name), color: input?.color ?? '9e9e9e', vm_role: input?.vmRole ?? false, description: input?.description ?? '' })
    await refresh()
  }
  const createManufacturer = async (name: string, description = '') => {
    await netbox.manufacturers.create({ name, slug: slugify(name), description })
    await refresh()
  }

  const createDevice = async (input: DeviceCreateInput) => {
    await netbox.devices.create({ name: input.name, device_type: input.deviceTypeId, role: input.roleId, site: input.siteId,
      location: input.locationId, rack: input.rackId, position: input.rackId ? input.position : null,
      ...(input.rackId && input.position ? { face: 'front' } : {}), status: 'active', description: input.description })
    await refresh(); setPage('devices')
  }
  const createDeviceType = async (input: DeviceTypeCreateInput) => {
    await netbox.deviceTypes.create({ manufacturer: input.manufacturerId, model: input.model, slug: slugify(input.model), u_height: input.height, description: input.description })
    await refresh(); setPage('devices')
  }
  const updateDevice = async (draft: DeviceSummary) => {
    const response = await netbox.devices.update(draft.apiId, { name: draft.name, description: draft.description,
      site: draft.siteId, location: draft.locationId, rack: draft.rackId,
      position: draft.rackId && draft.allocatedUnit > 0 ? draft.allocatedUnit : null,
      ...(draft.rackId && draft.allocatedUnit > 0 ? { face: 'front' } : {}) })
    const updated = mapDevice(response)
    await refresh(); setSelectedDevice(updated)
    return updated
  }
  const deleteDevices = async (ids: number[]) => {
    await Promise.all(ids.map((id) => netbox.devices.delete(id)))
    await refresh()
  }

  const createRack = async (input: RackCreateInput) => {
    await netbox.racks.create({ name: input.name, site: input.siteId, location: input.locationId, group: input.groupId,
      status: 'active', width: input.width, u_height: input.height, starting_unit: input.startingUnit, description: input.description })
    await refresh(); setPage('rack-info')
  }
  const createRackGroup = async (name: string, description: string) => {
    await netbox.rackGroups.create({ name, slug: slugify(name), description })
    await refresh(); setPage('rack-info')
  }

  const createOrganization = async (kind: 'site' | 'location' | 'region' | 'manufacturer' | 'role', input: OrganizationCreateInput) => {
    if (kind === 'site') await netbox.sites.create({ name: input.name, slug: slugify(input.name), status: 'active', region: input.regionId ?? null, description: input.description })
    if (kind === 'location') await netbox.locations.create({ name: input.name, slug: slugify(input.name), status: 'active', site: input.siteId, description: input.description })
    if (kind === 'region') await netbox.regions.create({ name: input.name, slug: slugify(input.name), description: input.description })
    if (kind === 'manufacturer') await createManufacturer(input.name, input.description)
    if (kind === 'role') await createRole(input.name, input)
    if (kind !== 'manufacturer' && kind !== 'role') await refresh()
  }

  const deleteOrganization = async (kind: 'site' | 'location' | 'region' | 'manufacturer' | 'role', ids: number[]) => {
    const remove = { site: netbox.sites.delete, location: netbox.locations.delete, region: netbox.regions.delete, manufacturer: netbox.manufacturers.delete, role: netbox.deviceRoles.delete }[kind]
    await Promise.all(ids.map((id) => remove(id)))
    await refresh()
  }

  const deleteFromHome = async (kind: DeleteKind, id: number) => {
    if (kind === 'device') await netbox.devices.delete(id)
    if (kind === 'device-type') await netbox.deviceTypes.delete(id)
    if (kind === 'rack') await netbox.racks.delete(id)
    if (kind === 'rack-group') await netbox.rackGroups.delete(id)
    await refresh()
  }

  if (checkingSession) return <main className="app-state"><strong>Conectando ao NetBox…</strong></main>
  if (page === 'login') return <Login onLogin={login} />

  if (page === 'home') return <Home onLogout={() => void logout()} devices={devices} deviceTypes={data.deviceTypes}
    racks={data.racks} rackGroups={data.rackGroups} onDelete={deleteFromHome}
    onSelectDevice={(device) => { setSelectedDevice(device); setPage('object-info') }} onOpenPage={setPage} />

  if (page === 'scanner') return <ScannerPage onBack={() => setPage('home')} onOpenDevice={(id) => {
    const device = devices.find((item) => item.id === id)
    if (device) { setSelectedDevice(device); setPage('object-info') }
    else { setAppError(`Nenhum dispositivo com o ID ${id} foi encontrado.`); setPage('devices') }
  }} />

  if (page === 'object-info' && selectedDevice) return <ObjectInfoPage device={selectedDevice} sites={sites} racks={data.racks} onUpdate={updateDevice} onBack={() => setPage('devices')} />
  if (page === 'object-info') return <DevicesPage items={devices} onDelete={deleteDevices} onBack={() => setPage('home')} onAdd={() => setPage('add-device')} onSelect={(device) => { setSelectedDevice(device); setPage('object-info') }} />

  if (page === 'devices') return <><DevicesPage items={devices} onDelete={deleteDevices} onBack={() => { setAppError(''); setPage('home') }} onAdd={() => setPage('add-device')} onSelect={(device) => { setSelectedDevice(device); setPage('object-info') }} />{appError ? <p className="app-toast" role="alert">{appError}</p> : null}</>
  if (page === 'add-device') return <AddDevicePage sites={sites} locations={locations} roles={data.deviceRoles} deviceTypes={data.deviceTypes} racks={data.racks} onCreate={createDevice} onCreateRole={createRole} onBack={() => setPage('devices')} />
  if (page === 'add-device-type') return <AddDeviceTypePage manufacturers={data.manufacturers} onCreate={createDeviceType} onCreateManufacturer={createManufacturer} onBack={() => setPage('devices')} />
  if (page === 'manufacturers') return <ManufacturersPage items={manufacturers} onCreate={(input) => createOrganization('manufacturer', input)} onDelete={(ids) => deleteOrganization('manufacturer', ids)} onBack={() => setPage('home')} />
  if (page === 'device-functions') return <DeviceFunctionsPage items={deviceRoles} onCreate={(input) => createOrganization('role', input)} onDelete={(ids) => deleteOrganization('role', ids)} onBack={() => setPage('home')} />
  if (page === 'rack-info') return <RackInfoPage items={racks} onBack={() => setPage('home')} onSelect={(rack) => { setSelectedRack(rack); setPage('rack-details') }} />
  if (page === 'rack-details' && selectedRack) return <RackDetailsPage rack={selectedRack} onBack={() => setPage('rack-info')} />
  if (page === 'add-rack') return <AddRackPage sites={sites} locations={locations} groups={data.rackGroups} onCreate={createRack} onBack={() => setPage('home')} />
  if (page === 'add-rack-group') return <AddRackGroupPage onCreate={createRackGroup} onBack={() => setPage('home')} />
  if (page === 'sites') return <SitesPage items={sites} regions={regions} onCreate={(input) => createOrganization('site', input)} onDelete={(ids) => deleteOrganization('site', ids)} onBack={() => setPage('home')} />
  if (page === 'locations') return <LocationsPage items={locations} sites={sites} onCreate={(input) => createOrganization('location', input)} onDelete={(ids) => deleteOrganization('location', ids)} onBack={() => setPage('home')} />
  if (page === 'regions') return <RegionsPage items={regions} onCreate={(input) => createOrganization('region', input)} onDelete={(ids) => deleteOrganization('region', ids)} onBack={() => setPage('home')} />
  return null
}
