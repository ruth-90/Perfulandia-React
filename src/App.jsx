
import { Routes, Route, Navigate, useLocation } from 'react-router'
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

// VISTAS DE ADMINISTRACIÓN (MÓDULOS DE DARLING)
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminProductoForm from './pages/admin/AdminProductoForm.jsx'

// VISTAS DE ADMINISTRACIÓN DE USUARIOS (RUTH)
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm.jsx'

import { obtenerProductoPorId } from './services/productosStorage.js'

import './App.css'

export default function App() {
  const location = useLocation()

  // IDENTIFICAR SI ESTAMOS EN UNA RUTA ADMINISTRATIVA
  const esAdmin = location.pathname.startsWith('/admin')

  // COMPROBAR SESIÓN DEL ADMINISTRADOR DE DEMOSTRACIÓN
  const adminActivo = sessionStorage.getItem('adminActivo') === 'true'

  // ESTADO DEL CLIENTE QUE INICIÓ SESIÓN
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    try {
      const cliente = localStorage.getItem('clienteActivo')
      return cliente ? JSON.parse(cliente) : null
    } catch {
      return null
    }
  })

  // ACTUALIZAR EL CLIENTE CUANDO INICIA O CIERRA SESIÓN
  function actualizarUsuarioActivo(usuario) {
    setUsuarioActivo(usuario)
  }

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

  // AGREGAR UN PRODUCTO AL CARRITO CON CONTROL DE STOCK
  function agregarAlCarrito(producto, cantidad = 1) {
    const cantidadAgregar =
      Number.isInteger(cantidad) && cantidad > 0 ? cantidad : 1

    const prodBd = obtenerProductoPorId(producto.id)

    const stockMaximo = prodBd
      ? Number(prodBd.stock ?? 0)
      : Number(producto.stock ?? 99)

    if (stockMaximo <= 0) {
      alert(`Lo sentimos, "${producto.nombre}" está agotado en inventario.`)
      return
    }

    setCarrito((carritoActual) => {
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      )

      if (productoExistente) {
        if (productoExistente.cantidad >= stockMaximo) {
          alert(
            `Ya tienes el stock máximo disponible (${stockMaximo} un.) de "${producto.nombre}" en el carrito.`
          )
          return carritoActual
        }

        const cantidadDeseada =
          Number(productoExistente.cantidad || 0) + cantidadAgregar

        const cantidadFinal = Math.min(
          cantidadDeseada,
          stockMaximo
        )

        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                cantidad: cantidadFinal,
                stock: stockMaximo
              }
            : item
        )
      }

      const cantidadInicial = Math.min(
        cantidadAgregar,
        stockMaximo
      )

      return [
        ...carritoActual,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen: producto.imagen,
          stock: stockMaximo,
          cantidad: cantidadInicial
        }
      ]
    })
  }

  // MODIFICAR CANTIDAD DE UN PRODUCTO (+1 O -1)
  function modificarCantidad(id, cambio) {
    const prodBd = obtenerProductoPorId(id)

    setCarrito((carritoActual) =>
      carritoActual
        .map((item) => {
          if (item.id === id) {
            const stockMaximo = prodBd
              ? Number(prodBd.stock ?? 0)
              : Number(item.stock ?? 99)

            const nuevaCantidad =
              Number(item.cantidad || 1) + cambio

            // IMPEDIR SUPERAR EL STOCK DISPONIBLE
            if (cambio > 0 && nuevaCantidad > stockMaximo) {
              return item
            }

            return {
              ...item,
              cantidad: nuevaCantidad,
              stock: stockMaximo
            }
          }

          return item
        })
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
    (total, producto) =>
      total + Number(producto.cantidad || 0),
    0
  )

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* BARRA DE NAVEGACIÓN DE LA TIENDA */}
      {!esAdmin && (
        <Navbar
          cantidadCarrito={cantidadCarrito}
          usuarioActivo={usuarioActivo}
          onCerrarSesion={() => actualizarUsuarioActivo(null)}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1">
        <Routes>

          {/* PÁGINA PRINCIPAL */}
          <Route
            path="/"
            element={<Inicio />}
          />

          {/* CATÁLOGO DE PRODUCTOS */}
          <Route
            path="/productos"
            element={
              <Productos
                onAgregarProducto={agregarAlCarrito}
              />
            }
          />

          {/* DETALLE DE PRODUCTO */}
          <Route
            path="/producto-detalle"
            element={
              <ProductoDetalle
                onAgregarProducto={agregarAlCarrito}
              />
            }
          />

          {/* NOSOTROS Y CONTACTO */}
          <Route
            path="/nosotros"
            element={<Nosotros />}
          />

          <Route
            path="/contacto"
            element={<Contacto />}
          />

          {/* INICIO DE SESIÓN */}
          <Route
            path="/login"
            element={
              <Login
                onLogin={actualizarUsuarioActivo}
              />
            }
          />

          {/* REGISTRO */}
          <Route
            path="/registro"
            element={<Registro />}
          />

          {/* BLOG */}
          <Route
            path="/blogs"
            element={<Blogs />}
          />

          {/* CARRITO */}
          <Route
            path="/carrito"
            element={
              <Carrito
                carrito={carrito}
                onModificarCantidad={modificarCantidad}
                onEliminarProducto={eliminarProducto}
                onVaciarCarrito={vaciarCarrito}
                usuarioActivo={usuarioActivo}
              />
            }
          />

          {/* ADMINISTRACIÓN: DASHBOARD */}
          <Route
            path="/admin"
            element={
              adminActivo
                ? <AdminDashboard />
                : <Navigate to="/login" replace />
            }
          />

          {/* ADMINISTRACIÓN: PRODUCTOS */}
          <Route
            path="/admin/productos"
            element={
              adminActivo
                ? <AdminProductos />
                : <Navigate to="/login" replace />
            }
          />

          {/* ADMINISTRACIÓN: CREAR Y EDITAR PRODUCTOS */}
          <Route
            path="/admin/producto-form"
            element={
              adminActivo
                ? <AdminProductoForm />
                : <Navigate to="/login" replace />
            }
          />

          {/* ADMINISTRACIÓN: USUARIOS */}
          <Route
            path="/admin/usuarios"
            element={
              adminActivo
                ? <AdminUsuarios />
                : <Navigate to="/login" replace />
            }
          />

          {/* ADMINISTRACIÓN: CREAR Y EDITAR USUARIOS */}
          <Route
            path="/admin/usuario-form"
            element={
              adminActivo
                ? <AdminUsuarioForm />
                : <Navigate to="/login" replace />
            }
          />

        </Routes>
      </main>

      {/* PIE DE PÁGINA DE LA TIENDA */}
      {!esAdmin && <Footer />}

    </div>
  )
}
