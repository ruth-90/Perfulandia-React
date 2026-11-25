
import { useState, useEffect } from 'react'

// NUEVA FUENTE DE DATOS: SPRING BOOT + H2
import { obtenerProductosApi } from '../services/productosApi.js'

import ProductoCatalogoCard from '../components/ProductoCatalogoCard.jsx'

export default function Productos({ onAgregarProducto }) {

    // LISTA DE PRODUCTOS RECIBIDA DESDE SPRING BOOT
    const [listaProductos, setListaProductos] = useState([])

    // ESTADOS DEL BUSCADOR Y FILTROS
    const [busqueda, setBusqueda] = useState('')
    const [categoria, setCategoria] = useState('todos')

    // MENSAJE AL AGREGAR PRODUCTOS AL CARRITO
    const [mensaje, setMensaje] = useState('')

    // ESTADOS PARA CONTROLAR LA CONSULTA AL BACKEND
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')


    // 1. OBTENER PRODUCTOS DESDE SPRING BOOT
    useEffect(() => {

        let activo = true

        async function cargarProductos() {

            try {

                // Iniciamos la carga y limpiamos errores anteriores.
                setCargando(true)
                setError('')

                // Consultamos el endpoint GET mediante Axios.
                const productos = await obtenerProductosApi()

                // Actualizamos el estado con los datos de H2.
                if (activo) {
                    setListaProductos(productos)
                }

            } catch (errorConexion) {

                console.error(
                    'Error al obtener los productos:',
                    errorConexion
                )

                // Mostramos un mensaje si el backend no responde.
                if (activo) {
                    setError(
                        'No fue posible cargar los perfumes. Intenta nuevamente más tarde.'
                    )
                }

            } finally {

                // Finalizamos el estado de carga.
                if (activo) {
                    setCargando(false)
                }
            }
        }

        cargarProductos()

        // Evita actualizar el componente si se desmonta.
        return () => {
            activo = false
        }

    }, [])


    // 2. FILTRAR PRODUCTOS POR NOMBRE Y CATEGORÍA
    const productosFiltrados = listaProductos.filter((producto) => {

        const coincideNombre = producto.nombre
            .toLowerCase()
            .includes(busqueda.toLowerCase().trim())

        const coincideCategoria =
            categoria === 'todos' ||
            producto.categoria.toLowerCase() === categoria.toLowerCase()

        return coincideNombre && coincideCategoria
    })


    // 3. AGREGAR PRODUCTOS AL CARRITO
    function agregarAlCarrito(producto) {

        // Impedimos agregar perfumes agotados.
        if (Number(producto.stock) <= 0) {
            setMensaje(
                `${producto.nombre} no tiene stock disponible.`
            )
            return
        }

        // Llamamos a la función que recibimos desde App.jsx.
        onAgregarProducto(producto)

        // Mostramos un mensaje de confirmación.
        setMensaje(
            `${producto.nombre} fue agregado al carrito.`
        )
    }


    return (
        <>

            {/* CABECERA PRODUCTOS */}
            <section className="productos-header">
                <div className="container text-center">

                    <p className="section-subtitulo">
                        Nuestra colección
                    </p>

                    <h1>Encuentra tu fragancia</h1>

                    <p className="productos-header-descripcion">
                        Explora nuestra selección de perfumes
                        y encuentra el aroma ideal para ti.
                    </p>

                </div>
            </section>


            {/* CATÁLOGO */}
            <section className="catalogo-productos py-5">
                <div className="container">

                    {/* FILTROS */}
                    <div className="row mb-5">
                        <div className="col-lg-8 mx-auto">
                            <div className="row g-3">

                                {/* BUSCADOR */}
                                <div className="col-md-8">
                                    <div className="input-group">

                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>

                                        <input
                                            type="text"
                                            id="buscadorProducto"
                                            className="form-control"
                                            placeholder="Buscar perfume..."
                                            aria-label="Buscar perfume"
                                            value={busqueda}
                                            onChange={(event) =>
                                                setBusqueda(event.target.value)
                                            }
                                        />

                                    </div>
                                </div>


                                {/* FILTRO CATEGORÍA */}
                                <div className="col-md-4">

                                    <select
                                        id="filtroCategoria"
                                        className="form-select"
                                        value={categoria}
                                        onChange={(event) =>
                                            setCategoria(event.target.value)
                                        }
                                    >
                                        <option value="todos">
                                            Todas las categorías
                                        </option>

                                        <option value="Mujer">
                                            Mujer
                                        </option>

                                        <option value="Hombre">
                                            Hombre
                                        </option>

                                        <option value="Unisex">
                                            Unisex
                                        </option>
                                    </select>

                                </div>

                            </div>
                        </div>
                    </div>


                    {/* MENSAJE DE CARGA */}
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
                                Cargando perfumes...
                            </p>
                        </div>
                    )}


                    {/* MENSAJE DE ERROR */}
                    {!cargando && error && (
                        <div
                            className="alert alert-danger text-center"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}


                    {/* LISTA DE PRODUCTOS */}
                    {!cargando && !error && (

                        productosFiltrados.length > 0 ? (

                            <div className="row g-4">

                                {productosFiltrados.map((producto) => (

                                    <ProductoCatalogoCard
                                        key={producto.id}
                                        producto={producto}
                                        onAgregar={agregarAlCarrito}
                                    />

                                ))}

                            </div>

                        ) : (

                            <div className="text-center py-5">

                                <i className="bi bi-search icono-sin-productos"></i>

                                <h2 className="mt-3">
                                    No encontramos productos
                                </h2>

                                <p>
                                    Intenta buscar otro perfume.
                                </p>

                            </div>
                        )
                    )}

                </div>
            </section>


            {/* MENSAJE AL AGREGAR AL CARRITO */}
            {mensaje && (
                <div
                    className="alert alert-producto position-fixed top-0 start-50 translate-middle-x mt-4 shadow"
                    role="status"
                >
                    <i className="bi bi-info-circle-fill"></i>

                    {mensaje}

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
