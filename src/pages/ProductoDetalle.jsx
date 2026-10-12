
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { productos } from '../data/productos.js'
import { obtenerProductoPorId } from '../services/productosStorage.js'

// COMPONENTE CON LA INFORMACIÓN DEL PERFUME
function ContenidoDetalle({ producto, onAgregarProducto }) {
    const prodBd = obtenerProductoPorId(producto.id) || producto
    const stockDisponible = Number(prodBd.stock ?? 99)
    const sinStock = stockDisponible <= 0

    // Cantidad seleccionada por el usuario
    const [cantidad, setCantidad] = useState(1)

    // Mensaje de confirmación
    const [mensaje, setMensaje] = useState('')

    // Formatear el precio en pesos chilenos
    const precioFormateado = Number(producto.precio || 0).toLocaleString(
        'es-CL',
        {
            style: 'currency',
            currency: 'CLP'
        }
    )

    // Aumentar cantidad sin superar stock
    function aumentarCantidad() {
        setCantidad((cantidadActual) =>
            Math.min(stockDisponible, cantidadActual + 1)
        )
    }

    // Disminuir cantidad sin bajar de 1
    function disminuirCantidad() {
        setCantidad((cantidadActual) =>
            Math.max(1, cantidadActual - 1)
        )
    }

    // Añadir al carrito
    function agregarAlCarrito() {
        if (sinStock) return

        onAgregarProducto(producto, cantidad)

        setMensaje(
            `${cantidad} unidad(es) de ${producto.nombre} agregada(s) al carrito.`
        )
    }

    return (
        <>
            <div className="row align-items-center g-5">

                {/* IMAGEN DEL PRODUCTO */}
                <div className="col-lg-6">
                    <div className="detalle-imagen">

                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="img-fluid"
                        />

                    </div>
                </div>

                {/* INFORMACIÓN DEL PRODUCTO */}
                <div className="col-lg-6">
                    <div className="detalle-informacion">

                        <p className="producto-categoria">
                            {producto.categoria}
                        </p>

                        <h1 className="detalle-titulo">
                            {producto.nombre}
                        </h1>

                        <p className="detalle-precio">
                            {precioFormateado}
                        </p>

                        <hr />

                        <p className="detalle-descripcion">
                            {producto.descripcion}
                        </p>

                        {/* CARACTERÍSTICAS */}
                        <div className="detalle-caracteristicas">

                            <p>
                                <i className="bi bi-check-circle"></i>
                                {' '}Producto disponible
                            </p>

                            <p>
                                <i className="bi bi-truck"></i>
                                {' '}Despacho disponible
                            </p>

                            <p>
                                <i className="bi bi-shield-check"></i>
                                {' '}Compra segura
                            </p>

                        </div>

                        {/* SELECTOR DE CANTIDAD */}
                        <div className="mt-4">

                            <p className="form-label">
                                Cantidad
                                {sinStock ? (
                                    <span className="badge bg-danger ms-2">Agotado</span>
                                ) : (
                                    <small className="text-muted ms-2">({stockDisponible} unidades disponibles)</small>
                                )}
                            </p>

                            <div className="selector-cantidad">

                                <button
                                    type="button"
                                    className="btn-cantidad"
                                    onClick={disminuirCantidad}
                                    disabled={cantidad === 1 || sinStock}
                                    aria-label="Disminuir cantidad"
                                >
                                    −
                                </button>

                                <span id="cantidadProducto">
                                    {sinStock ? 0 : cantidad}
                                </span>

                                <button
                                    type="button"
                                    className="btn-cantidad"
                                    onClick={aumentarCantidad}
                                    disabled={cantidad >= stockDisponible || sinStock}
                                    aria-label="Aumentar cantidad"
                                    title={cantidad >= stockDisponible ? 'Stock máximo alcanzado' : 'Aumentar cantidad'}
                                >
                                    +
                                </button>

                            </div>
                        </div>

                        {/* BOTONES */}
                        <div className="d-grid gap-3 mt-4">

                            <button
                                type="button"
                                className="btn btn-perfulandia btn-lg"
                                onClick={agregarAlCarrito}
                                disabled={sinStock}
                            >
                                <i className="bi bi-bag-plus"></i>
                                {' '}{sinStock ? 'Producto Agotado' : 'Añadir al carrito'}
                            </button>

                            <Link
                                to="/productos"
                                className="btn btn-outline-perfulandia"
                            >
                                <i className="bi bi-arrow-left"></i>
                                {' '}Seguir comprando
                            </Link>

                        </div>

                    </div>
                </div>
            </div>

            {/* MENSAJE DE CONFIRMACIÓN */}
            {mensaje && (
                <div
                    className="alert alert-producto position-fixed top-0 start-50 translate-middle-x mt-4 shadow"
                    role="status"
                >
                    <i className="bi bi-check-circle-fill"></i>
                    {' '}{mensaje}

                    <button
                        type="button"
                        className="btn-close ms-3"
                        aria-label="Cerrar mensaje"
                        onClick={() => setMensaje('')}
                    />
                </div>
            )}
        </>
    )
}

// PÁGINA PRINCIPAL DE DETALLE
export default function ProductoDetalle({ onAgregarProducto }) {

    // Obtener el ID del perfume desde la URL
    const [parametros] = useSearchParams()
    const idParam = parametros.get('id')
    const idProducto = idParam ? Number(idParam) : null

    // Buscar el perfume seleccionado en la base de datos o en productos base
    // Si no se especifica ID en la URL, carga el primer producto por defecto
    const productoSeleccionado = idProducto
        ? (obtenerProductoPorId(idProducto) || productos.find((p) => Number(p.id) === idProducto))
        : (obtenerProductoPorId(1) || productos[0])

    return (
        <>
            {/* MIGA DE PAN */}
            <section className="detalle-breadcrumb">
                <div className="container py-4">

                    <Link to="/">Inicio</Link>

                    <span> / </span>

                    <Link to="/productos">Productos</Link>

                    <span> / Detalle</span>

                </div>
            </section>

            {/* DETALLE DEL PRODUCTO */}
            <section className="detalle-producto py-5">
                <div className="container">

                    {!productoSeleccionado ? (

                        <div className="text-center py-5">

                            <i className="bi bi-exclamation-circle icono-error-producto"></i>

                            <h1 className="mt-3">
                                Producto no encontrado
                            </h1>

                            <p>
                                El perfume que buscas no está disponible.
                            </p>

                            <Link
                                to="/productos"
                                className="btn btn-perfulandia"
                            >
                                Volver a productos
                            </Link>

                        </div>

                    ) : (

                        <ContenidoDetalle
                            key={productoSeleccionado.id}
                            producto={productoSeleccionado}
                            onAgregarProducto={onAgregarProducto}
                        />

                    )}

                </div>
            </section>
        </>
    )
}
