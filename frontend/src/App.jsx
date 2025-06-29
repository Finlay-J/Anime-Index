import './css/App.css'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import ProtectedRoute from './components/ProtectedRoute'
import { Routes, Route } from 'react-router-dom'
import { AnimeProvider } from './contexts/AnimeContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  

  return (
    <AuthProvider>
      <AnimeProvider>
        <div>
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </AnimeProvider>
    </AuthProvider>
  );
}


export default App
