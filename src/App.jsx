
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
import Pedidos from './pages/Pedidos.jsx'

// VISTAS DE ADMINISTRACIÓN (MÓDULOS DE DARLING)
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProductos from './pages/admin/AdminProductos.jsx'
import AdminProductoForm from './pages/admin/AdminProductoForm.jsx'

// VISTAS DE ADMINISTRACIÓN DE USUARIOS (RUTH)
import AdminUsuarios from './pages/admin/AdminUsuarios.jsx'
import AdminUsuarioForm from './pages/admin/AdminUsuarioForm.jsx'

// CONEXIÓN CON EL BACKEND SPRING BOOT
import { productosApi } from './services/api.js'
import { eventoSesion, guardarSesion, leerSesion } from './services/sesion.js'
import { obtenerProductosApi } from './services/productosApi.js'

import './App.css'

export default function App() {

  const location = useLocation()

  // IDENTIFICAR SI ESTAMOS EN UNA RUTA ADMINISTRATIVA
  const esAdmin = location.pathname.startsWith('/admin')

  const [usuarioActivo, setUsuarioActivo] = useState(leerSesion)
  const adminActivo = usuarioActivo?.rol === 'ADMINISTRADOR'

  useEffect(() => {
    const actualizarSesion = () => setUsuarioActivo(leerSesion())
    window.addEventListener(eventoSesion, actualizarSesion)
    return () => window.removeEventListener(eventoSesion, actualizarSesion)
  }, [])

  function actualizarUsuarioActivo(usuario) {
    if (!usuario) guardarSesion(null)
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

    localStorage.setItem(
      'carrito',
      JSON.stringify(carrito)
    )

  }, [carrito])


  // VALIDAR LOS PRODUCTOS GUARDADOS DEL CARRITO
  // EVITAMOS MEZCLAR LOS ID ANTIGUOS CON LOS ID DE H2
  useEffect(() => {

    let activo = true

    async function validarCarritoGuardado() {

      try {

        const productosBackend = await obtenerProductosApi()

        if (!activo) return

        setCarrito((carritoActual) => {

          return carritoActual
            .filter((item) => {

              // BUSCAR EL PRODUCTO POR ID EN H2
              const productoReal = productosBackend.find(
                (producto) => producto.id === item.id
              )

              // VERIFICAR TAMBIÉN EL NOMBRE
              // PARA DESCARTAR PRODUCTOS ANTIGUOS
              return (
                productoReal &&
                productoReal.nombre === item.nombre
              )
            })
            .map((item) => {

              const productoReal = productosBackend.find(
                (producto) => producto.id === item.id
              )

              const stockReal = Number(
                productoReal.stock ?? 0
              )

              return {
                ...item,
                nombre: productoReal.nombre,
                precio: productoReal.precio,
                imagen: productoReal.imagen,
                stock: stockReal,
                cantidad: Math.min(
                  Number(item.cantidad || 1),
                  stockReal
                )
              }
            })
            .filter((item) => item.cantidad > 0)
        })

      } catch (error) {

        console.error(
          'No se pudo validar el carrito con H2:',
          error
        )
      }
    }

    validarCarritoGuardado()

    return () => {
      activo = false
    }

  }, [])


  // BUSCAR UN PRODUCTO EN SPRING BOOT POR SU ID
  async function consultarProductoBackend(id) {

    const respuesta = await productosApi.get(
      `/productos/${id}`
    )

    return respuesta.data
  }


  // AGREGAR UN PRODUCTO AL CARRITO CON CONTROL DE STOCK
  async function agregarAlCarrito(producto, cantidad = 1) {

    const cantidadAgregar =
      Number.isInteger(cantidad) && cantidad > 0
        ? cantidad
        : 1

    try {

      // CONSULTAR EL PRODUCTO REAL EN H2
      const productoBd = await consultarProductoBackend(
        producto.id
      )

      // VERIFICAR QUE NO SEA UN PRODUCTO ANTIGUO
      if (productoBd.nombre !== producto.nombre) {

        alert(
          'El producto seleccionado no coincide con el catálogo actual.'
        )

        return
      }

      const stockMaximo = Number(
        productoBd.stock ?? 0
      )

      // IMPEDIR AGREGAR PRODUCTOS AGOTADOS
      if (stockMaximo <= 0) {

        alert(
          `Lo sentimos, "${productoBd.nombre}" está agotado en inventario.`
        )

        return
      }

      setCarrito((carritoActual) => {

        const productoExistente = carritoActual.find(
          (item) => item.id === productoBd.id
        )

        // SI EL PRODUCTO YA ESTÁ EN EL CARRITO
        if (productoExistente) {

          // EVITAR SUPERAR EL STOCK DISPONIBLE
          if (productoExistente.cantidad >= stockMaximo) {

            return carritoActual
          }

          const cantidadDeseada =
            Number(productoExistente.cantidad || 0) +
            cantidadAgregar

          const cantidadFinal = Math.min(
            cantidadDeseada,
            stockMaximo
          )

          return carritoActual.map((item) =>
            item.id === productoBd.id
              ? {
                  ...item,
                  nombre: productoBd.nombre,
                  precio: productoBd.precio,
                  imagen: productoBd.imagen,
                  cantidad: cantidadFinal,
                  stock: stockMaximo
                }
              : item
          )
        }

        // SI EL PRODUCTO TODAVÍA NO ESTÁ EN EL CARRITO
        const cantidadInicial = Math.min(
          cantidadAgregar,
          stockMaximo
        )

        return [
          ...carritoActual,
          {
            id: productoBd.id,
            nombre: productoBd.nombre,
            precio: productoBd.precio,
            imagen: productoBd.imagen,
            stock: stockMaximo,
            cantidad: cantidadInicial
          }
        ]
      })

    } catch (error) {

      console.error(
        'Error al agregar el producto al carrito:',
        error
      )

      alert(
        'No fue posible consultar el producto. Verifica que Spring Boot esté funcionando.'
      )
    }
  }


  // MODIFICAR CANTIDAD DE UN PRODUCTO (+1 O -1)
  async function modificarCantidad(id, cambio) {

    // SI QUEREMOS DISMINUIR LA CANTIDAD
    if (cambio < 0) {

      setCarrito((carritoActual) =>
        carritoActual
          .map((item) =>
            item.id === id
              ? {
                  ...item,
                  cantidad:
                    Number(item.cantidad || 1) + cambio
                }
              : item
          )
          .filter((item) => item.cantidad > 0)
      )

      return
    }

    // SI QUEREMOS AUMENTAR, CONSULTAMOS EL STOCK REAL
    try {

      const productoBd = await consultarProductoBackend(id)

      const stockMaximo = Number(
        productoBd.stock ?? 0
      )

      setCarrito((carritoActual) =>
        carritoActual.map((item) => {

          if (item.id !== id) {
            return item
          }

          // PROTEGER CONTRA ID ANTIGUOS
          if (item.nombre !== productoBd.nombre) {
            return item
          }

          const nuevaCantidad =
            Number(item.cantidad || 1) + cambio

          if (nuevaCantidad > stockMaximo) {
            return {
              ...item,
              stock: stockMaximo
            }
          }

          return {
            ...item,
            cantidad: nuevaCantidad,
            stock: stockMaximo,
            precio: productoBd.precio
          }
        })
      )

    } catch (error) {

      console.error(
        'Error al consultar stock:',
        error
      )

      alert(
        'No fue posible verificar el stock disponible.'
      )
    }
  }


  // ELIMINAR UN PRODUCTO DEL CARRITO
  function eliminarProducto(id) {

    setCarrito((carritoActual) =>
      carritoActual.filter(
        (item) => item.id !== id
      )
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
          onCerrarSesion={() =>
            actualizarUsuarioActivo(null)
          }
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


          <Route path="/pedidos" element={usuarioActivo
            ? <Pedidos key={usuarioActivo.id ?? usuarioActivo.rol} rol={usuarioActivo.rol} />
            : <Navigate to="/login" replace />
          } />

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
