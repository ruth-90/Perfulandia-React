
import { NavLink, useNavigate } from 'react-router'
import '../styles/navbar.css'

export default function Navbar({
  cantidadCarrito = 0,
  usuarioActivo,
  onCerrarSesion
}) {

  const navigate = useNavigate()

  // ==========================================
  // COMPROBAR SI EL ADMINISTRADOR TIENE SESIÓN
  // ==========================================
  const adminActivo =
    usuarioActivo?.rol === 'ADMINISTRADOR'

  // ==========================================
  // CERRAR SESIÓN DEL CLIENTE
  // ==========================================
  function cerrarSesionCliente() {
    onCerrarSesion?.()
    navigate('/')
  }

  // ==========================================
  // CERRAR SESIÓN DEL ADMINISTRADOR
  // ==========================================
  function cerrarSesionAdmin() {
    onCerrarSesion?.()
    navigate('/login', { replace: true })
  }

  // ==========================================
  // MENSAJES DEL BANNER
  // ==========================================
  const mensajes = [
    '🚚 ENVÍO GRATIS EN COMPRAS DESDE $40.990',
    '✨ DESCUBRE TU FRAGANCIA FAVORITA',
    '🎁 PERFUMES PARA CADA MOMENTO'
  ]

  // REPETIR MENSAJES PARA EVITAR ESPACIOS VACÍOS
  const mensajesRepetidos = Array.from(
    { length: 6 },
    (_, repeticion) =>
      mensajes.map((texto, index) => ({
        id: `${repeticion}-${index}`,
        texto
      }))
  ).flat()

  return (
    <>

      {/* ==========================================
          BANNER INFINITO DE PERFULANDIA
      ========================================== */}
      <div className="banner-envio">

        <div className="banner-envio-track">

          {/* PRIMER GRUPO DE MENSAJES */}
          <div className="banner-envio-lista">
            {mensajesRepetidos.map((mensaje) => (
              <span
                key={`primero-${mensaje.id}`}
                className="banner-item"
              >
                {mensaje.texto}
              </span>
            ))}
          </div>

          {/* SEGUNDO GRUPO IDÉNTICO */}
          <div
            className="banner-envio-lista"
            aria-hidden="true"
          >
            {mensajesRepetidos.map((mensaje) => (
              <span
                key={`segundo-${mensaje.id}`}
                className="banner-item"
              >
                {mensaje.texto}
              </span>
            ))}
          </div>

        </div>

      </div>

      {/* ==========================================
          NAVBAR PRINCIPAL
      ========================================== */}
      <header>

        <nav className="navbar navbar-expand-lg navbar-light navbar-perfulandia">

          <div className="container-fluid px-5">

            {/* LOGO DE PERFULANDIA */}
            <NavLink className="navbar-brand" to="/">
              <img
                src="/img/Logo.png"
                alt="Logo Perfulandia"
                className="logo"
              />
            </NavLink>

            {/* BOTÓN PARA MENÚ EN CELULARES */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#menuPrincipal"
              aria-controls="menuPrincipal"
              aria-expanded="false"
              aria-label="Abrir menú"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* MENÚ PRINCIPAL */}
            <div
              className="collapse navbar-collapse"
              id="menuPrincipal"
            >

              <ul className="navbar-nav mx-auto mb-2 mb-lg-0">

                <li className="nav-item">
                  <NavLink className="nav-link" to="/">
                    Inicio
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/productos">
                    Productos
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/nosotros">
                    Nosotros
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/blogs">
                    Blog
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link" to="/contacto">
                    Contacto
                  </NavLink>
                </li>

              </ul>

              {/* ==========================================
                  USUARIO Y CARRITO DE COMPRAS
              ========================================== */}
              <div className="d-flex align-items-center gap-3">

                {adminActivo ? (

                  /* ADMINISTRADOR CON SESIÓN INICIADA */
                  <div className="dropdown">

                    <button
                      className="btn btn-outline-perfulandia dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-person-gear me-2"></i>
                      Administrador
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">

                      <li>
                        <span className="dropdown-item-text small text-muted">
                          Sesión administrativa
                        </span>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>

                      <li>
                        <NavLink
                          to="/admin"
                          className="dropdown-item"
                        >
                          <i className="bi bi-speedometer2 me-2"></i>
                          Volver al panel administrativo
                        </NavLink>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li><NavLink to="/pedidos" className="dropdown-item">{usuarioActivo?.rol === 'CLIENTE' ? 'Mis pedidos' : 'Pedidos'}</NavLink></li>

                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={cerrarSesionAdmin}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Cerrar sesión
                        </button>
                      </li>

                    </ul>

                  </div>

                ) : usuarioActivo ? (

                  /* CLIENTE CON SESIÓN INICIADA */
                  <div className="dropdown">

                    <button
                      className="btn btn-outline-perfulandia dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-person-circle me-2"></i>
                      {usuarioActivo.nombre}
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">

                      <li>
                        <span className="dropdown-item-text small text-muted">
                          {usuarioActivo.correo}
                        </span>
                      </li>

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li><NavLink to="/pedidos" className="dropdown-item">{usuarioActivo?.rol === 'CLIENTE' ? 'Mis pedidos' : 'Pedidos'}</NavLink></li>

                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={cerrarSesionCliente}
                        >
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Cerrar sesión
                        </button>
                      </li>

                    </ul>

                  </div>

                ) : (

                  /* VISITANTE SIN SESIÓN */
                  <NavLink
                    to="/login"
                    className="btn btn-outline-perfulandia"
                  >
                    <i className="bi bi-person me-1"></i>
                    Ingresar
                  </NavLink>

                )}

                {/* CARRITO DE COMPRAS */}
                <NavLink
                  to="/carrito"
                  className="carrito-link position-relative"
                  aria-label="Carrito de compras"
                >
                  <i className="bi bi-bag"></i>

                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill contador-carrito">
                    {cantidadCarrito}
                  </span>
                </NavLink>

              </div>

            </div>

          </div>

        </nav>

      </header>

    </>
  )
}
