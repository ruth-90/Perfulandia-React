import { Routes, Route } from 'react-router'
import { useState, useEffect } from 'react'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Inicio from './pages/Inicio.jsx'
import Productos from './pages/Productos.jsx'
import ProductoDetalle from './pages/ProductoDetalle.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Contacto from './pages/Contacto.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Blogs from './pages/Blogs.jsx'

import './App.css'

// Vista temporal para rutas pendientes de diseño
function PaginaPendiente({ titulo }) {
  return (
    <div className="container py-5 text-center">
      <h2>{titulo}</h2>
      <p className="text-muted">Próximamente disponible en Perfulandia.</p>
    </div>
  )
}

export default function App() {
  // ESTADO DEL CARRITO CON PERSISTENCIA EN LOCALSTORAGE
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = JSON.parse(
        localStorage.getItem('carrito') || '[]'
      )
      return Array.isArray(guardado) ? guardado : []
    } catch {
      return []
    }
  })

  // GUARDAR CARRITO AUTOMÁTICAMENTE
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito))
  }, [carrito])

  // AGREGAR UN PRODUCTO AL CARRITO
  function agregarAlCarrito(producto, cantidad = 1) {
    const cantidadAgregar =
      Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 1

    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      )

      if (productoExistente) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: Number(item.cantidad || 0) + cantidadAgregar
              }
            : item
        )
      }

      return [
        ...carritoActual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: cantidadAgregar
        }
      ]
    })
  }

  // CANTIDAD TOTAL DE PRODUCTOS EN EL CARRITO
  const cantidadCarrito = carrito.reduce(
    (total, producto) => total + Number(producto.cantidad || 0),
    0
  )

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Barra de navegación con contador dinámico */}
      <Navbar cantidadCarrito={cantidadCarrito} />

      {/* Contenido principal según la ruta */}
      <main className="flex-grow-1">
        <Routes>
          {/* PÁGINA PRINCIPAL */}
          <Route path="/" element={<Inicio />} />

          {/* CATÁLOGO DE PRODUCTOS */}
          <Route
            path="/productos"
            element={<Productos onAgregarProducto={agregarAlCarrito} />}
          />

          {/* DETALLE DE PRODUCTO */}
          <Route
            path="/producto-detalle"
            element={<ProductoDetalle onAgregarProducto={agregarAlCarrito} />}
          />

          {/* NOSOTROS Y CONTACTO */}
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />

          {/* AUTENTICACIÓN */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* BLOG */}
          <Route path="/blogs" element={<Blogs />} />

          {/* RUTAS PENDIENTES */}
          <Route path="/carrito" element={<PaginaPendiente titulo="Carrito de Compras" />} />
        </Routes>
      </main>

      {/* Pie de página oficial de Perfulandia */}
      <Footer />
    </div>
  )
}
