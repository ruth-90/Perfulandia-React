import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import { obtenerEstadisticas, formatearPrecio, obtenerProductos } from '../../services/productosStorage.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalProductos: 0, stockTotal: 0, sinStock: 0 })
  const [ultimosProductos, setUltimosProductos] = useState([])

  useEffect(() => {
    setStats(obtenerEstadisticas())
    const productos = obtenerProductos()
    setUltimosProductos(productos.slice(0, 5))
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
              <p className="text-secondary mb-1">Panel de Control</p>
              <h1 className="fw-bold mb-1">Dashboard</h1>
              <p className="text-secondary mb-0">
                Resumen de inventario y estado general de la tienda Perfulandia.
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
                <span>Stock total en bodega</span>
                <strong>{stats.stockTotal}</strong>
              </div>
            </article>

            <article className="col-md-4">
              <div className="admin-stat">
                <i className="bi bi-exclamation-circle text-danger"></i>
                <span>Productos sin stock</span>
                <strong className={stats.sinStock > 0 ? 'text-danger' : ''}>
                  {stats.sinStock}
                </strong>
              </div>
            </article>
          </section>

          {/* ACCESOS RÁPIDOS (SECCIÓN PROPUESTA GUÍA DUOC UC) */}
          <section className="row g-4 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="admin-card p-4 text-center h-100">
                <div className="admin-icon mb-3">
                  <i className="bi bi-box-seam"></i>
                </div>
                <h2 className="h5 fw-bold">Inventario</h2>
                <p className="text-muted small mb-3">
                  Consulta y administra el stock de perfumes.
                </p>
                <Link to="/admin/productos" className="btn btn-outline-perfulandia w-100">
                  Ver productos
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="admin-card p-4 text-center h-100">
                <div className="admin-icon mb-3">
                  <i className="bi bi-plus-circle"></i>
                </div>
                <h2 className="h5 fw-bold">Nuevo Perfume</h2>
                <p className="text-muted small mb-3">
                  Añade una nueva fragancia al catálogo.
                </p>
                <Link to="/admin/producto-form" className="btn btn-perfulandia w-100">
                  Crear producto
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="admin-card p-4 text-center h-100">
                <div className="admin-icon mb-3">
                  <i className="bi bi-people"></i>
                </div>
                <h2 className="h5 fw-bold">Usuarios</h2>
                <p className="text-muted small mb-3">
                  Gestión de cuentas y roles de usuario.
                </p>
                <Link to="/admin/usuarios" className="btn btn-outline-perfulandia w-100">
                  Ver usuarios
                </Link>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="admin-card p-4 text-center h-100">
                <div className="admin-icon mb-3">
                  <i className="bi bi-bag-check"></i>
                </div>
                <h2 className="h5 fw-bold">Tienda Pública</h2>
                <p className="text-muted small mb-3">
                  Revisa la apariencia pública de la tienda.
                </p>
                <Link to="/" className="btn btn-outline-secondary w-100">
                  Ir a la tienda
                </Link>
              </div>
            </div>
          </section>

          {/* TABLA DE PRODUCTOS RECIENTES */}
          <section className="admin-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="h5 fw-bold mb-1">Últimos perfumes registrados</h2>
                <p className="text-secondary small mb-0">Vista previa rápida del inventario.</p>
              </div>
              <Link to="/admin/productos" className="btn btn-sm btn-outline-perfulandia">
                Ver todos
              </Link>
            </div>

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
                  {ultimosProductos.map((prod) => (
                    <tr key={prod.id}>
                      <td>
                        <div className="admin-producto">
                          <img src={prod.imagen} alt={prod.nombre} />
                          <div>
                            <strong>{prod.nombre}</strong>
                            <p className="text-truncate" style={{ maxWidth: '280px' }}>
                              {prod.descripcion}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>{prod.categoria}</td>
                      <td>{formatearPrecio(prod.precio)}</td>
                      <td>{prod.stock}</td>
                      <td>
                        <span className={`estado-stock ${prod.stock > 0 ? 'disponible' : 'sin-stock'}`}>
                          {prod.stock > 0 ? 'Disponible' : 'Sin stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
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

