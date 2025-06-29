import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import Favorites from './pages/Favorites'
import MovieCard from './components/MovieCard'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import { MovieProvider } from './contexts/MovieContext'

function App() {
  

  return (
    <MovieProvider>
      <div>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
      </div>
    </MovieProvider>
  );
}


export default App
