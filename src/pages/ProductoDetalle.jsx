
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router'

// CONEXIÓN CON SPRING BOOT MEDIANTE AXIOS
import { productosApi } from '../services/api.js'
import { obtenerProductosApi } from '../services/productosApi.js'


// COMPONENTE CON LA INFORMACIÓN DEL PERFUME
function ContenidoDetalle({ producto, onAgregarProducto }) {

    // STOCK OBTENIDO DIRECTAMENTE DESDE H2
    const stockDisponible = Number(producto.stock ?? 0)

    // COMPROBAR SI EL PERFUME ESTÁ AGOTADO
    const sinStock = stockDisponible <= 0

    // CANTIDAD SELECCIONADA POR EL USUARIO
    const [cantidad, setCantidad] = useState(1)

    // INDICAR SI SE ESTÁ AGREGANDO AL CARRITO
    const [agregando, setAgregando] = useState(false)

    // FORMATEAR EL PRECIO EN PESOS CHILENOS
    const precioFormateado = Number(
        producto.precio || 0
    ).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP'
    })


    // 1. AUMENTAR CANTIDAD SIN SUPERAR EL STOCK
    function aumentarCantidad() {

        setCantidad((cantidadActual) =>
            Math.min(
                stockDisponible,
                cantidadActual + 1
            )
        )
    }


    // 2. DISMINUIR CANTIDAD SIN BAJAR DE 1
    function disminuirCantidad() {

        setCantidad((cantidadActual) =>
            Math.max(
                1,
                cantidadActual - 1
            )
        )
    }


    // 3. AGREGAR EL PERFUME AL CARRITO
    async function agregarAlCarrito() {

        if (sinStock || agregando) {
            return
        }

        try {

            setAgregando(true)

            // APP.JSX CONSULTA NUEVAMENTE EL STOCK EN H2
            // ANTES DE AGREGAR EL PRODUCTO
            await onAgregarProducto(producto, cantidad)

        } catch (error) {

            console.error(
                'Error al agregar el perfume:',
                error
            )

        } finally {

            setAgregando(false)
        }
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

                        {/* CATEGORÍA */}
                        <p className="producto-categoria">
                            {producto.categoria}
                        </p>

                        {/* NOMBRE */}
                        <h1 className="detalle-titulo">
                            {producto.nombre}
                        </h1>

                        {/* PRECIO */}
                        <p className="detalle-precio">
                            {precioFormateado}
                        </p>

                        <hr />

                        {/* DESCRIPCIÓN */}
                        <p className="detalle-descripcion">
                            {producto.descripcion}
                        </p>


                        {/* CARACTERÍSTICAS */}
                        <div className="detalle-caracteristicas">

                            <p>
                                <i className="bi bi-check-circle"></i>
                                {' '}
                                {sinStock
                                    ? 'Producto agotado'
                                    : 'Producto disponible'
                                }
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

                                    <span className="badge bg-danger ms-2">
                                        Agotado
                                    </span>

                                ) : (

                                    <small className="text-muted ms-2">
                                        ({stockDisponible} unidades disponibles)
                                    </small>

                                )}

                            </p>


                            <div className="selector-cantidad">

                                {/* DISMINUIR */}
                                <button
                                    type="button"
                                    className="btn-cantidad"
                                    onClick={disminuirCantidad}
                                    disabled={
                                        cantidad <= 1 ||
                                        sinStock ||
                                        agregando
                                    }
                                    aria-label="Disminuir cantidad"
                                >
                                    −
                                </button>


                                {/* CANTIDAD ACTUAL */}
                                <span id="cantidadProducto">

                                    {sinStock ? 0 : cantidad}

                                </span>


                                {/* AUMENTAR */}
                                <button
                                    type="button"
                                    className="btn-cantidad"
                                    onClick={aumentarCantidad}
                                    disabled={
                                        cantidad >= stockDisponible ||
                                        sinStock ||
                                        agregando
                                    }
                                    aria-label="Aumentar cantidad"
                                    title={
                                        cantidad >= stockDisponible
                                            ? 'Stock máximo alcanzado'
                                            : 'Aumentar cantidad'
                                    }
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        {/* BOTONES */}
                        <div className="d-grid gap-3 mt-4">

                            {/* AGREGAR AL CARRITO */}
                            <button
                                type="button"
                                className="btn btn-perfulandia btn-lg"
                                onClick={agregarAlCarrito}
                                disabled={sinStock || agregando}
                            >

                                <i className="bi bi-bag-plus"></i>

                                {' '}

                                {sinStock
                                    ? 'Producto Agotado'
                                    : agregando
                                        ? 'Agregando...'
                                        : 'Añadir al carrito'
                                }

                            </button>


                            {/* VOLVER AL CATÁLOGO */}
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

        </>
    )
}


// PÁGINA PRINCIPAL DE DETALLE
export default function ProductoDetalle({ onAgregarProducto }) {

    // OBTENER LOS PARÁMETROS DE LA URL
    const [parametros] = useSearchParams()

    // EJEMPLO: /producto-detalle?id=33
    const idParam = parametros.get('id')

    const idProducto =
        idParam === null ? null : Number(idParam)

    // PRODUCTO OBTENIDO DESDE SPRING BOOT
    const [productoSeleccionado, setProductoSeleccionado] =
        useState(null)

    // ESTADOS PARA CONTROLAR LA CONSULTA
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')


    // 4. CONSULTAR EL PERFUME EN H2
    useEffect(() => {

        let activo = true

        async function cargarProducto() {

            try {

                setCargando(true)
                setError('')
                setProductoSeleccionado(null)

                let producto = null

                // SI LA URL CONTIENE UN ID VÁLIDO
                if (
                    idParam !== null &&
                    Number.isInteger(idProducto) &&
                    idProducto > 0
                ) {

                    const respuesta = await productosApi.get(
                        `/productos/${idProducto}`
                    )

                    producto = respuesta.data

                } else if (idParam === null) {

                    // SI NO EXISTE ID EN LA URL,
                    // MOSTRAMOS EL PRIMER PERFUME DEL BACKEND
                    const productos = await obtenerProductosApi()

                    producto = productos[0] ?? null

                }

                if (activo) {
                    setProductoSeleccionado(producto)
                }

            } catch (errorConexion) {

                console.error(
                    'Error al obtener el detalle del perfume:',
                    errorConexion
                )

                if (activo) {

                    if (errorConexion.response?.status === 404) {

                        // EL ID NO EXISTE EN H2
                        setProductoSeleccionado(null)

                    } else {

                        // ERROR DE CONEXIÓN O DEL SERVIDOR
                        setError(
                            'No fue posible cargar el perfume. Verifica la conexión con el servidor.'
                        )
                    }
                }

            } finally {

                if (activo) {
                    setCargando(false)
                }
            }
        }

        cargarProducto()

        // EVITAR ACTUALIZACIONES DESPUÉS DE DESMONTAR
        return () => {
            activo = false
        }

    }, [idParam, idProducto])


    return (
        <>

            {/* MIGA DE PAN */}
            <section className="detalle-breadcrumb">

                <div className="container py-4">

                    <Link to="/">
                        Inicio
                    </Link>

                    <span> / </span>

                    <Link to="/productos">
                        Productos
                    </Link>

                    <span> / Detalle</span>

                </div>

            </section>


            {/* DETALLE DEL PRODUCTO */}
            <section className="detalle-producto py-5">

                <div className="container">

                    {/* ESTADO DE CARGA */}
                    {cargando && (

                        <div
                            className="text-center py-5"
                            role="status"
                        >

                            <div
                                className="spinner-border"
                                aria-hidden="true"
                            ></div>

                            <p className="mt-3">
                                Cargando información del perfume...
                            </p>

                        </div>

                    )}


                    {/* ERROR DE CONEXIÓN */}
                    {!cargando && error && (

                        <div
                            className="alert alert-danger text-center"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* PRODUCTO NO ENCONTRADO */}
                    {!cargando && !error && !productoSeleccionado && (

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

                    )}


                    {/* INFORMACIÓN DEL PERFUME */}
                    {!cargando && !error && productoSeleccionado && (

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
