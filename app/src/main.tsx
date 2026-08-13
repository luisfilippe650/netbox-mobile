import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import ScannerPage from './pages/scanner/Scanner'
import ObjectInfoPage from './pages/devices/ObjectInfo'
import DevicesPage from './pages/devices/Devices'
import { initialDevices, type DeviceSummary } from './pages/devices/devices-data'
import AddDevicePage from './pages/devices/AddDevice'
import AddDeviceTypePage from './pages/devices/AddDeviceType'
import ManufacturersPage from './pages/devices/Manufacturers'
import { initialManufacturers } from './pages/devices/manufacturers-data'
import DeviceFunctionsPage from './pages/devices/DeviceFunctions'
import { initialDeviceFunctions } from './pages/devices/device-functions-data'
import RackInfoPage from './pages/rack-info/RackInfo'
import AddRackPage from './pages/racks/AddRack'
import AddRackGroupPage from './pages/racks/AddRackGroup'
import RackDetailsPage from './pages/racks/RackDetails'
import type { RackSummary } from './pages/racks/data'
import SitesPage from './pages/organization/Sites'
import LocationsPage from './pages/organization/Locations'
import RegionsPage from './pages/organization/Regions'
import type { OrganizationItem } from './pages/organization/OrganizationList'
import { initialLocations, initialSites } from './pages/organization/data'
import './utils/colors.css'

type Page =
  | 'login'
  | 'home'
  | 'scanner'
  | 'object-info'
  | 'devices'
  | 'add-device'
  | 'add-device-type'
  | 'manufacturers'
  | 'device-functions'
  | 'rack-info'
  | 'rack-details'
  | 'add-rack'
  | 'add-rack-group'
  | 'sites'
  | 'locations'
  | 'regions'

function App() {
  const [page, setPage] = useState<Page>('login')
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null)
  const [devices, setDevices] = useState<DeviceSummary[]>([...initialDevices])
  const [manufacturers, setManufacturers] = useState<OrganizationItem[]>([...initialManufacturers])
  const [deviceFunctions, setDeviceFunctions] = useState<OrganizationItem[]>([...initialDeviceFunctions])
  const [selectedRack, setSelectedRack] = useState<RackSummary | null>(null)
  const [sites, setSites] = useState<OrganizationItem[]>([...initialSites])
  const [locations, setLocations] = useState<OrganizationItem[]>([...initialLocations])

  if (page === 'login') {
    return <Login onLogin={() => setPage('home')} />
  }

  if (page === 'home') {
    return (
      <Home
        onLogout={() => setPage('login')}
        devices={devices}
        onSelectDevice={(device) => {
          setSelectedDevice(device)
          setPage('object-info')
        }}
        onOpenPage={(nextPage) => setPage(nextPage)}
      />
    )
  }

  if (page === 'scanner') {
    return <ScannerPage onBack={() => setPage('home')} />
  }

  if (page === 'object-info') {
    if (!selectedDevice) return <DevicesPage items={devices} onItemsChange={setDevices} onBack={() => setPage('home')} onAdd={() => setPage('add-device')} onSelect={(device) => { setSelectedDevice(device); setPage('object-info') }} />
    return (
      <ObjectInfoPage
        device={selectedDevice}
        sites={sites}
        onUpdate={(updatedDevice) => {
          setDevices((current) => current.map((item) => item.id === updatedDevice.id ? updatedDevice : item))
          setSelectedDevice(updatedDevice)
        }}
        onBack={() => setPage('devices')}
      />
    )
  }

  if (page === 'devices') {
    return <DevicesPage items={devices} onItemsChange={setDevices} onBack={() => setPage('home')} onAdd={() => setPage('add-device')} onSelect={(device) => { setSelectedDevice(device); setPage('object-info') }} />
  }

  if (page === 'add-device') {
    return <AddDevicePage sites={sites} locations={locations} onBack={() => setPage('devices')} />
  }

  if (page === 'add-device-type') {
    return <AddDeviceTypePage onBack={() => setPage('devices')} />
  }

  if (page === 'manufacturers') {
    return <ManufacturersPage items={manufacturers} onItemsChange={setManufacturers} onBack={() => setPage('home')} />
  }

  if (page === 'device-functions') {
    return <DeviceFunctionsPage items={deviceFunctions} onItemsChange={setDeviceFunctions} onBack={() => setPage('home')} />
  }

  if (page === 'rack-info') {
    return <RackInfoPage onBack={() => setPage('home')} onSelect={(rack) => { setSelectedRack(rack); setPage('rack-details') }} />
  }

  if (page === 'rack-details' && selectedRack) {
    return <RackDetailsPage rack={selectedRack} onBack={() => setPage('rack-info')} />
  }

  if (page === 'add-rack') {
    return <AddRackPage sites={sites} locations={locations} onBack={() => setPage('home')} />
  }

  if (page === 'add-rack-group') {
    return <AddRackGroupPage onBack={() => setPage('home')} />
  }

  if (page === 'sites') {
    return <SitesPage items={sites} onItemsChange={setSites} onBack={() => setPage('home')} />
  }

  if (page === 'locations') {
    return <LocationsPage items={locations} sites={sites} onItemsChange={setLocations} onBack={() => setPage('home')} />
  }

  if (page === 'regions') {
    return <RegionsPage onBack={() => setPage('home')} />
  }

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
