
import { useState, useEffect } from 'react'
import { Link } from 'react-router'

import AdminSidebar from '../../components/AdminSidebar.jsx'

// CONSULTAR LOS PRODUCTOS DESDE SPRING BOOT
import { obtenerProductosApi } from '../../services/productosApi.js'

// CONSERVAMOS LA FUNCIÓN PARA FORMATEAR PESOS CHILENOS
import { formatearPrecio } from '../../services/productosStorage.js'


export default function AdminDashboard() {

  // ESTADÍSTICAS DEL INVENTARIO
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockTotal: 0,
    sinStock: 0
  })

  // ÚLTIMOS CINCO PRODUCTOS REGISTRADOS
  const [ultimosProductos, setUltimosProductos] = useState([])

  // ESTADOS DE CARGA Y ERROR
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')


  // 1. CONSULTAR PRODUCTOS DESDE SPRING BOOT
  useEffect(() => {

    let activo = true

    async function cargarDashboard() {

      try {

        setCargando(true)
        setError('')

        // OBTENER TODOS LOS PRODUCTOS DESDE H2
        const productos = await obtenerProductosApi()

        if (!activo) {
          return
        }

        // CALCULAR LA CANTIDAD TOTAL DE PRODUCTOS
        const totalProductos = productos.length

        // SUMAR EL STOCK DE TODOS LOS PERFUMES
        const stockTotal = productos.reduce(
          (total, producto) =>
            total + Number(producto.stock || 0),
          0
        )

        // CONTAR LOS PERFUMES AGOTADOS
        const sinStock = productos.filter(
          (producto) => Number(producto.stock) <= 0
        ).length

        // ACTUALIZAR LAS TARJETAS DEL DASHBOARD
        setStats({
          totalProductos,
          stockTotal,
          sinStock
        })

        // ORDENAR POR ID DESCENDENTE
        // LOS ID MAYORES CORRESPONDEN A INSERCIONES MÁS RECIENTES
        const productosOrdenados = [...productos].sort(
          (a, b) => Number(b.id) - Number(a.id)
        )

        // MOSTRAR SOLO LOS CINCO ÚLTIMOS
        setUltimosProductos(
          productosOrdenados.slice(0, 5)
        )

      } catch (errorConexion) {

        console.error(
          'Error al cargar el Dashboard:',
          errorConexion
        )

        if (activo) {

          setError(
            'No fue posible cargar las estadísticas. Verifica que Spring Boot esté funcionando.'
          )

        }

      } finally {

        if (activo) {
          setCargando(false)
        }

      }
    }

    cargarDashboard()

    // EVITAR ACTUALIZAR EL ESTADO SI SE CIERRA LA PÁGINA
    return () => {
      activo = false
    }

  }, [])


  return (

    <div className="admin-body">

      <div className="admin-layout">

        {/* MENÚ LATERAL */}
        <AdminSidebar paginaActiva="inicio" />


        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">

          {/* BARRA SUPERIOR */}
          <section className="admin-top mb-4">

            <div>

              <p className="text-secondary mb-1">
                Panel de Control
              </p>

              <h1 className="fw-bold mb-1">
                Dashboard
              </h1>

              <p className="text-secondary mb-0">
                Resumen de inventario y estado general de la tienda Perfulandia.
              </p>

            </div>


            <div className="admin-identidad">

              <div className="admin-avatar">
                <i className="bi bi-person-gear"></i>
              </div>

              <div>

                <p className="mb-0 fw-semibold">
                  Administrador
                </p>

                <small className="text-secondary">
                  Sesión administrativa
                </small>

              </div>

            </div>

          </section>


          {/* MENSAJE DE ERROR */}
          {error && (

            <div
              className="alert alert-danger mb-4"
              role="alert"
            >

              <i className="bi bi-exclamation-triangle-fill me-2"></i>

              {error}

            </div>

          )}


          {/* MENSAJE DE CARGA */}
          {cargando && (

            <div
              className="text-center py-4"
              role="status"
            >

              <div
                className="spinner-border"
                aria-hidden="true"
              ></div>

              <p className="mt-3">
                Cargando información del inventario...
              </p>

            </div>

          )}


          {/* CONTENIDO DISPONIBLE CUANDO TERMINA LA CONSULTA */}
          {!cargando && !error && (

            <>

              {/* TARJETAS DE ESTADÍSTICAS */}
              <section className="row g-4 mb-4">

                <article className="col-md-4">

                  <div className="admin-stat">

                    <i className="bi bi-box"></i>

                    <span>
                      Productos registrados
                    </span>

                    <strong>
                      {stats.totalProductos}
                    </strong>

                  </div>

                </article>


                <article className="col-md-4">

                  <div className="admin-stat">

                    <i className="bi bi-stack"></i>

                    <span>
                      Stock total en bodega
                    </span>

                    <strong>
                      {stats.stockTotal}
                    </strong>

                  </div>

                </article>


                <article className="col-md-4">

                  <div className="admin-stat">

                    <i className="bi bi-exclamation-circle text-danger"></i>

                    <span>
                      Productos sin stock
                    </span>

                    <strong
                      className={
                        stats.sinStock > 0
                          ? 'text-danger'
                          : ''
                      }
                    >

                      {stats.sinStock}

                    </strong>

                  </div>

                </article>

              </section>


              {/* ACCESOS RÁPIDOS */}
              <section className="row g-4 mb-4">

                {/* INVENTARIO */}
                <div className="col-md-6 col-lg-3">

                  <div className="admin-card p-4 text-center h-100">

                    <div className="admin-icon mb-3">
                      <i className="bi bi-box-seam"></i>
                    </div>

                    <h2 className="h5 fw-bold">
                      Inventario
                    </h2>

                    <p className="text-muted small mb-3">
                      Consulta y administra el stock de perfumes.
                    </p>

                    <Link
                      to="/admin/productos"
                      className="btn btn-outline-perfulandia w-100"
                    >

                      Ver productos

                    </Link>

                  </div>

                </div>


                {/* CREAR PERFUME */}
                <div className="col-md-6 col-lg-3">

                  <div className="admin-card p-4 text-center h-100">

                    <div className="admin-icon mb-3">
                      <i className="bi bi-plus-circle"></i>
                    </div>

                    <h2 className="h5 fw-bold">
                      Nuevo Perfume
                    </h2>

                    <p className="text-muted small mb-3">
                      Añade una nueva fragancia al catálogo.
                    </p>

                    <Link
                      to="/admin/producto-form"
                      className="btn btn-perfulandia w-100"
                    >

                      Crear producto

                    </Link>

                  </div>

                </div>


                {/* ADMINISTRACIÓN DE USUARIOS */}
                <div className="col-md-6 col-lg-3">

                  <div className="admin-card p-4 text-center h-100">

                    <div className="admin-icon mb-3">
                      <i className="bi bi-people"></i>
                    </div>

                    <h2 className="h5 fw-bold">
                      Usuarios
                    </h2>

                    <p className="text-muted small mb-3">
                      Gestión de cuentas y roles de usuario.
                    </p>

                    <Link
                      to="/admin/usuarios"
                      className="btn btn-outline-perfulandia w-100"
                    >

                      Ver usuarios

                    </Link>

                  </div>

                </div>


                {/* TIENDA PÚBLICA */}
                <div className="col-md-6 col-lg-3">

                  <div className="admin-card p-4 text-center h-100">

                    <div className="admin-icon mb-3">
                      <i className="bi bi-bag-check"></i>
                    </div>

                    <h2 className="h5 fw-bold">
                      Tienda Pública
                    </h2>

                    <p className="text-muted small mb-3">
                      Revisa la apariencia pública de la tienda.
                    </p>

                    <Link
                      to="/"
                      className="btn btn-outline-secondary w-100"
                    >

                      Ir a la tienda

                    </Link>

                  </div>

                </div>

              </section>


              {/* TABLA DE PRODUCTOS RECIENTES */}
              <section className="admin-panel p-4">

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div>

                    <h2 className="h5 fw-bold mb-1">
                      Últimos perfumes registrados
                    </h2>

                    <p className="text-secondary small mb-0">
                      Vista previa rápida del inventario.
                    </p>

                  </div>

                  <Link
                    to="/admin/productos"
                    className="btn btn-sm btn-outline-perfulandia"
                  >

                    Ver todos

                  </Link>

                </div>


                {/* TABLA */}
                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead>

                      <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                      </tr>

                    </thead>


                    <tbody>

                      {ultimosProductos.length === 0 ? (

                        <tr>

                          <td
                            colSpan="5"
                            className="text-center py-4 text-muted"
                          >

                            No hay perfumes registrados.

                          </td>

                        </tr>

                      ) : (

                        ultimosProductos.map((prod) => (

                          <tr key={prod.id}>

                            {/* PRODUCTO */}
                            <td>

                              <div className="admin-producto">

                                <img
                                  src={prod.imagen}
                                  alt={prod.nombre}
                                />

                                <div>

                                  <strong>
                                    {prod.nombre}
                                  </strong>

                                  <p
                                    className="text-truncate"
                                    style={{
                                      maxWidth: '280px'
                                    }}
                                  >

                                    {prod.descripcion}

                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* CATEGORÍA */}
                            <td>
                              {prod.categoria}
                            </td>


                            {/* PRECIO */}
                            <td>

                              {formatearPrecio(prod.precio)}

                            </td>


                            {/* STOCK */}
                            <td>
                              {prod.stock}
                            </td>


                            {/* ESTADO */}
                            <td>

                              <span
                                className={`estado-stock ${
                                  prod.stock > 0
                                    ? 'disponible'
                                    : 'sin-stock'
                                }`}
                              >

                                {prod.stock > 0
                                  ? 'Disponible'
                                  : 'Sin stock'
                                }

                              </span>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            </>

          )}


          {/* FOOTER */}
          <footer className="admin-footer text-center mt-4">

            <small>
              © 2026 Perfulandia - Panel Administrativo
            </small>

          </footer>

        </main>

      </div>

    </div>
  )
}
