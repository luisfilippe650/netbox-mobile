import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './pages/login/Login'
import Home from './pages/home/Home'
import ScannerPage from './pages/scanner/Scanner'
import ObjectInfoPage from './pages/object-info/ObjectInfo'
import ObjectListPage from './pages/object-list/ObjectList'
import RackInfoPage from './pages/rack-info/RackInfo'
import RowInfoPage from './pages/row-info/RowInfo'
import LocationInfoPage from './pages/location-info/LocationInfo'
import './pages/shared/page-shell.css'
import './pages/shared/page-common.css'
import './utils/colors.css'

type Page =
  | 'login'
  | 'home'
  | 'scanner'
  | 'object-info'
  | 'object-list'
  | 'rack-info'
  | 'row-info'
  | 'location-info'

function App() {
  const [page, setPage] = useState<Page>('login')

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
    return <ObjectInfoPage onBack={() => setPage('home')} />
  }

  if (page === 'object-list') {
    return <ObjectListPage onBack={() => setPage('home')} />
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
