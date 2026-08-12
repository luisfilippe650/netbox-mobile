import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import ScannerPage from './pages/scanner/Scanner'
import ObjectInfoPage from './pages/devices/ObjectInfo'
import DevicesPage from './pages/devices/Devices'
import type { DeviceSummary } from './pages/devices/Devices'
import AddDevicePage from './pages/devices/AddDevice'
import AddDeviceTypePage from './pages/devices/AddDeviceType'
import RackInfoPage from './pages/rack-info/RackInfo'
import RowInfoPage from './pages/row-info/RowInfo'
import LocationInfoPage from './pages/location-info/LocationInfo'
import './utils/colors.css'

type Page =
  | 'login'
  | 'home'
  | 'scanner'
  | 'object-info'
  | 'devices'
  | 'add-device'
  | 'add-device-type'
  | 'device'
  | 'rack-info'
  | 'row-info'
  | 'location-info'

function App() {
  const [page, setPage] = useState<Page>('login')
  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null)

  if (page === 'login') {
    return <Login onLogin={() => setPage('home')} />
  }

  if (page === 'home') {
    return (
      <Home
        onLogout={() => setPage('login')}
        onOpenPage={(nextPage) => setPage(nextPage)}
      />
    )
  }

  if (page === 'scanner') {
    return <ScannerPage onBack={() => setPage('home')} />
  }

  if (page === 'object-info') {
    return <ObjectInfoPage device={selectedDevice ?? undefined} onBack={() => setPage('devices')} />
  }

  if (page === 'devices' || page === 'device') {
    return <DevicesPage onBack={() => setPage('home')} onAdd={() => setPage('add-device')} onSelect={(device) => { setSelectedDevice(device); setPage('object-info') }} />
  }

  if (page === 'add-device') {
    return <AddDevicePage onBack={() => setPage('devices')} />
  }

  if (page === 'add-device-type') {
    return <AddDeviceTypePage onBack={() => setPage('devices')} />
  }

  if (page === 'rack-info') {
    return <RackInfoPage onBack={() => setPage('home')} />
  }

  if (page === 'row-info') {
    return <RowInfoPage onBack={() => setPage('home')} />
  }

  return <LocationInfoPage onBack={() => setPage('home')} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
