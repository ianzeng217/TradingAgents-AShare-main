import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Analysis from './pages/Analysis'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Portfolio from './pages/Portfolio'
import TrackingBoard from './pages/TrackingBoard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/analysis" replace />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/tracking-board" element={<TrackingBoard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
