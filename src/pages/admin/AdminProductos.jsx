import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import {
  obtenerProductos,
  eliminarProducto,
  obtenerEstadisticas,
  formatearPrecio
} from '../../services/productosStorage.js'

export default function AdminProductos() {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [stats, setStats] = useState({ totalProductos: 0, stockTotal: 0, sinStock: 0 })
  const [mensaje, setMensaje] = useState('')

  // Cargar productos y estadísticas iniciales
  function cargarDatos() {
    const lista = obtenerProductos()
    setProductos(lista)
    setStats(obtenerEstadisticas())
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Eliminar producto con confirmación
  function handleEliminar(id, nombre) {
    const confirmar = window.confirm(`¿Estás segura de eliminar "${nombre}" del catálogo?`)
    if (confirmar) {
      eliminarProducto(id)
      cargarDatos()
      setMensaje(`Producto "${nombre}" eliminado correctamente.`)
      setTimeout(() => setMensaje(''), 4000)
    }
  }

  // Filtrado reactivo por texto y categoría
  const productosFiltrados = productos.filter((prod) => {
    const coincideTexto =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria =
      categoriaFiltro === 'todos' || prod.categoria.toLowerCase() === categoriaFiltro.toLowerCase()

    return coincideTexto && coincideCategoria
  })

  return (
    <div className="admin-body">
      <div className="admin-layout">
        {/* MENÚ LATERAL */}
        <AdminSidebar paginaActiva="productos" />

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">
          {/* BARRA SUPERIOR */}
          <section className="admin-top mb-4">
            <div>
              <p className="text-secondary mb-1">Administración</p>
              <h1 className="fw-bold mb-1">Productos</h1>
              <p className="text-secondary mb-0">
                Consulta el inventario y administra el stock del catálogo de Perfulandia.
              </p>
            </div>

            <div className="admin-identidad">
              <div className="admin-avatar">
                <i className="bi bi-person-gear"></i>
              </div>
              <div>
                <p className="mb-0 fw-semibold">Administrador</p>
                <small className="text-secondary">Sesión administrativa</small>
              </div>
            </div>
          </section>

          {/* MENSAJE DE CONFIRMACIÓN */}
          {mensaje && (
            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {mensaje}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMensaje('')}
                aria-label="Cerrar"
              ></button>
            </div>
          )}

          {/* TARJETAS DE ESTADÍSTICAS */}
          <section className="row g-4 mb-4">
            <article className="col-md-4">
              <div className="admin-stat">
                <i className="bi bi-box"></i>
                <span>Productos registrados</span>
                <strong>{stats.totalProductos}</strong>
              </div>
            </article>

            <article className="col-md-4">
              <div className="admin-stat">
                <i className="bi bi-stack"></i>
                <span>Stock total</span>
                <strong>{stats.stockTotal}</strong>
              </div>
            </article>

            <article className="col-md-4">
              <div className="admin-stat">
                <i className="bi bi-exclamation-circle text-danger"></i>
                <span>Sin stock</span>
                <strong className={stats.sinStock > 0 ? 'text-danger' : ''}>
                  {stats.sinStock}
                </strong>
              </div>
            </article>
          </section>

          {/* PANEL PRINCIPAL: TABLA DE INVENTARIO */}
          <section className="admin-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Inventario de productos</h2>
                <p className="text-secondary mb-0">
                  Mostrando {productosFiltrados.length} de {productos.length} productos disponibles.
                </p>
              </div>

              <Link to="/admin/producto-form" className="btn btn-perfulandia">
                <i className="bi bi-plus-circle me-1"></i>
                Crear producto
              </Link>
            </div>

            {/* FILTROS Y BÚSQUEDA */}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {busqueda && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setBusqueda('')}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={categoriaFiltro}
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <option value="todos">Todas las categorías</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            {/* TABLA RESPONSIVA */}
            <div className="table-responsive">
              <table className="table align-middle admin-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                        No se encontraron productos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div className="admin-producto">
                            <img src={prod.imagen} alt={prod.nombre} />
                            <div>
                              <strong>{prod.nombre}</strong>
                              <p className="text-truncate" style={{ maxWidth: '300px' }}>
                                {prod.descripcion}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {prod.categoria}
                          </span>
                        </td>
                        <td className="fw-semibold">
                          {formatearPrecio(prod.precio)}
                        </td>
                        <td>
                          <span className="fw-bold">{prod.stock}</span> un.
                        </td>
                        <td>
                          <span
                            className={`estado-stock ${
                              prod.stock > 0 ? 'disponible' : 'sin-stock'
                            }`}
                          >
                            {prod.stock > 0 ? 'Disponible' : 'Sin stock'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <Link
                              to={`/admin/producto-form?id=${prod.id}`}
                              className="btn btn-sm btn-outline-perfulandia"
                              title="Editar producto"
                            >
                              <i className="bi bi-pencil me-1"></i> Editar
                            </Link>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleEliminar(prod.id, prod.nombre)}
                              title="Eliminar producto"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="admin-footer text-center mt-4">
            <small>© 2026 Perfulandia - Panel Administrativo</small>
          </footer>
        </main>
      </div>
    </div>
  )
}

