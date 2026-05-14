import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
import { Home } from './pages/Home/Home'
import { About } from './pages/About/About'
import { NotFound } from './pages/NotFound/NotFound'
import './styles/global.css'

const s = {
  app: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    transition: 'background var(--transition-normal), color var(--transition-normal)',
  },
}

export default function App() {
  useEffect(() => {
    const handler = CapacitorApp.addListener('backButton', () => {
      if (window.location.pathname !== '/') {
        window.history.back()
      } else {
        CapacitorApp.exitApp()
      }
    })
    return () => handler.remove()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div style={s.app}>
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
