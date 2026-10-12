import { Routes, Route, useLocation } from 'react-router'
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
import Carrito from './pages/Carrito.jsx'

// Vistas de Administración (Módulos de Darling)
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminProductoForm from './pages/admin/AdminProductoForm.jsx'

import './App.css'

export default function App() {
  const location = useLocation()
  const esAdmin = location.pathname.startsWith('/admin')

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

  // MODIFICAR CANTIDAD DE UN PRODUCTO (+1 o -1)
  function modificarCantidad(id, cambio) {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Number(item.cantidad || 1) + cambio }
            : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  // ELIMINAR UN PRODUCTO DEL CARRITO
  function eliminarProducto(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    )
  }

  // VACIAR TODO EL CARRITO
  function vaciarCarrito() {
    setCarrito([])
  }

  // CANTIDAD TOTAL DE PRODUCTOS EN EL CARRITO
  const cantidadCarrito = carrito.reduce(
    (total, producto) => total + Number(producto.cantidad || 0),
    0
  )

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Barra de navegación de la tienda (se oculta en panel admin) */}
      {!esAdmin && <Navbar cantidadCarrito={cantidadCarrito} />}

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

          {/* CARRITO Y CHECKOUT */}
          <Route
            path="/carrito"
            element={
              <Carrito
                carrito={carrito}
                onModificarCantidad={modificarCantidad}
                onEliminarProducto={eliminarProducto}
                onVaciarCarrito={vaciarCarrito}
              />
            }
          />

          {/* MÓDULOS DE ADMINISTRACIÓN (DARLING) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/producto-form" element={<AdminProductoForm />} />
        </Routes>
      </main>

      {/* Pie de página de la tienda (se oculta en panel admin) */}
      {!esAdmin && <Footer />}
    </div>
  )
}
