import { NavLink, Link, useNavigate } from 'react-router'
import { guardarSesion } from '../services/sesion.js'

export default function AdminSidebar() {
  const navigate = useNavigate()

  // CERRAR SESIÓN DEL ADMINISTRADOR
  function cerrarSesion() {

    guardarSesion(null)

    // Regresar al Login
    navigate('/login', { replace: true })
  }

  return (
    <aside className="admin-sidebar">
      {/* LOGO */}
      <div className="admin-sidebar-logo">
        <Link to="/admin">
          <img
            src="/img/Logo.png"
            alt="Logo Perfulandia"
            className="logo-admin-sidebar"
          />
        </Link>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="admin-menu">
        <NavLink className="d-block px-3 py-2" to="/pedidos">Pedidos</NavLink>
        {/* INICIO / DASHBOARD */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-menu-link ${isActive ? 'active' : ''}`
          }
        >
          <i className="bi bi-house-door"></i>
          <span>Inicio</span>
        </NavLink>

        {/* SECCIÓN PRODUCTOS (DARLING) */}
        <div className="mt-2">
          <small className="text-muted text-uppercase px-3 fw-bold" style={{ fontSize: '0.75rem' }}>
            Productos
          </small>

          <div className="admin-submenu mt-1">
            <NavLink
              to="/admin/productos"
              className={({ isActive }) =>
                `admin-submenu-link ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-box-seam"></i>
              <span>Ver productos</span>
            </NavLink>

            <NavLink
              to="/admin/producto-form"
              className={({ isActive }) =>
                `admin-submenu-link ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-plus-circle"></i>
              <span>Crear producto</span>
            </NavLink>
          </div>
        </div>

        {/* SECCIÓN USUARIOS (RUTH) */}
        <div className="mt-3">
          <small className="text-muted text-uppercase px-3 fw-bold" style={{ fontSize: '0.75rem' }}>
            Usuarios
          </small>

          <div className="admin-submenu mt-1">
            <NavLink
              to="/admin/usuarios"
              className={({ isActive }) =>
                `admin-submenu-link ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-people"></i>
              <span>Ver usuarios</span>
            </NavLink>

            <NavLink
              to="/admin/usuario-form"
              className={({ isActive }) =>
                `admin-submenu-link ${isActive ? 'active' : ''}`
              }
            >
              <i className="bi bi-person-plus"></i>
              <span>Crear usuario</span>
            </NavLink>
          </div>
        </div>

        <hr className="admin-menu-separador" />

        {/* VOLVER A LA TIENDA */}
        <Link to="/" className="admin-menu-link admin-menu-tienda">
          <i className="bi bi-shop"></i>
          <span>Volver a la tienda</span>
        </Link>
        
        {/* CERRAR SESIÓN */}
        <button
          type="button"
          className="admin-menu-link admin-menu-tienda w-100 border-0 text-start"
          onClick={cerrarSesion}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Cerrar sesión</span>
        </button>

      </nav>
    </aside>
  )
}

