import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import ConcertDetail from './pages/ConcertDetail.jsx'
import AddConcert from './pages/AddConcert.jsx'
import Login from './pages/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NavBar from './components/NavBar.jsx'

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/concierto/:id" element={<ConcertDetail />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/agregar"
            element={
              <ProtectedRoute>
                <AddConcert />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <footer className="mx-auto max-w-5xl px-6 pb-12">
        <p className="eyebrow border-t border-edge pt-6">
          Setlists de setlist.fm · Imágenes de Deezer
        </p>
      </footer>
    </div>
  )
}
