import { NavLink } from 'react-router'
import '../styles/navbar.css'

export default function Navbar() {
    return (
        <>
            {/* Banner de envío gratis */}
            <div className="banner-envio">
                <div className="banner-envio-track">
                    <span>🚚 ENVÍO GRATIS EN COMPRAS DESDE $40.990</span>
                    <span>✨ DESCUBRE TU FRAGANCIA FAVORITA</span>
                    <span>🎁 PERFUMES PARA CADA MOMENTO</span>

                    <span>🚚 ENVÍO GRATIS EN COMPRAS DESDE $40.990</span>
                    <span>✨ DESCUBRE TU FRAGANCIA FAVORITA</span>
                    <span>🎁 PERFUMES PARA CADA MOMENTO</span>
                </div>
            </div>

            {/* Encabezado y navegación */}
            <header>
                <nav className="navbar navbar-expand-lg navbar-light navbar-perfulandia">
                    <div className="container-fluid px-5">

                        {/* Logo de Perfulandia */}
                        <NavLink className="navbar-brand" to="/">
                            <img
                                src="/img/Logo.png"
                                alt="Logo Perfulandia"
                                className="logo"
                            />
                        </NavLink>

                        {/* Botón para menú en celulares */}
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

                        {/* Enlaces de navegación */}
                        <div className="collapse navbar-collapse" id="menuPrincipal">
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

                            {/* Acceso y carrito */}
                            <div className="d-flex align-items-center gap-3">

                                <NavLink
                                    to="/login"
                                    className="btn btn-outline-perfulandia"
                                >
                                    <i className="bi bi-person"></i>
                                    {' '}Ingresar
                                </NavLink>

                                <NavLink
                                    to="/carrito"
                                    className="carrito-link position-relative"
                                    aria-label="Carrito de compras"
                                >
                                    <i className="bi bi-bag"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill contador-carrito">
                                        0
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