
import { Routes, Route } from 'react-router'

import Navbar from './components/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'

import './App.css'

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>

          {/* PÁGINA PRINCIPAL */}
          <Route path="/" element={<Inicio />} />

          {/* INICIO DE SESIÓN */}
          <Route path="/login" element={<Login />} />

          {/* REGISTRO DE CLIENTES */}
          <Route path="/registro" element={<Registro />} />

        </Routes>
      </main>
    </>
  )
}

export default App
