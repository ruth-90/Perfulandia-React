
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import AdminSidebar from '../../components/AdminSidebar.jsx'

// CONEXIÓN CON SPRING BOOT Y H2 MEDIANTE AXIOS
import { productosApi } from '../../services/api.js'


// IMÁGENES DISPONIBLES PARA SELECCIÓN RÁPIDA
const imagenesDisponibles = [
  '/img/Perfume1.webp',
  '/img/Perfume2.webp',
  '/img/Perfume3.webp',
  '/img/Perfume4.webp',
  '/img/Perfume5.webp',
  '/img/Perfume6.webp',
  '/img/Perfume7.webp',
  '/img/Perfume8.webp',
  '/img/Perfume9.webp',
  '/img/Perfume10.webp',
  '/img/Perfume11.webp',
  '/img/Perfume12.webp'
]


export default function AdminProductoForm() {

  // NAVEGACIÓN ENTRE PÁGINAS
  const navigate = useNavigate()

  // OBTENER ID DESDE LA URL
  const [searchParams] = useSearchParams()

  const productoId = searchParams.get('id')

  // IDENTIFICAR SI CREAMOS O EDITAMOS
  const esEdicion = productoId !== null

  // REFERENCIA AL SELECTOR DE ARCHIVOS
  const fileInputRef = useRef(null)


  // ESTADOS CONTROLADOS DEL FORMULARIO
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Unisex')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagen, setImagen] = useState('/img/Perfume1.webp')
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false)
  const [descripcion, setDescripcion] = useState('')

  // ESTADOS PARA CONSULTAS A SPRING BOOT
  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [procesandoImagen, setProcesandoImagen] = useState(false)
  const [error, setError] = useState('')


  // 1. CARGAR PRODUCTO DESDE H2 EN MODO EDICIÓN
  useEffect(() => {

    let activo = true

    async function cargarProducto() {

      // SI NO EXISTE ID, ESTAMOS CREANDO
      if (!esEdicion) {
        setCargando(false)
        return
      }

      // VALIDAR ID DE LA URL
      const idNumerico = Number(productoId)

      if (
        !Number.isInteger(idNumerico) ||
        idNumerico <= 0
      ) {
        setError('El identificador del producto no es válido.')
        setCargando(false)
        return
      }

      try {

        setCargando(true)
        setError('')

        // GET /api/v1/productos/{id}
        const respuesta = await productosApi.get(
          `/productos/${idNumerico}`
        )

        const productoExistente = respuesta.data

        if (!activo) {
          return
        }

        // RELLENAR EL FORMULARIO
        setNombre(productoExistente.nombre || '')
        setCategoria(productoExistente.categoria || 'Unisex')
        setPrecio(productoExistente.precio ?? '')
        setStock(productoExistente.stock ?? '')
        setImagen(
          productoExistente.imagen || '/img/Perfume1.webp'
        )
        setDescripcion(productoExistente.descripcion || '')
        setNombreArchivo('Imagen actual del producto')

      } catch (errorConexion) {

        console.error(
          'Error al cargar el producto:',
          errorConexion
        )

        if (activo) {

          if (errorConexion.response?.status === 404) {

            setError(
              'El producto que intentas editar no existe en H2.'
            )

          } else {

            setError(
              'No fue posible cargar el perfume. Verifica que Spring Boot esté funcionando.'
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

    return () => {
      activo = false
    }

  }, [productoId, esEdicion])


  // 2. PROCESAR IMAGEN SELECCIONADA
  // CONSERVAMOS LA OPTIMIZACIÓN DEL FORMULARIO ORIGINAL
  function procesarArchivoImagen(file) {

    if (!file) return

    if (
      ![
        'image/jpeg',
        'image/png',
        'image/webp'
      ].includes(file.type)
    ) {
      setError(
        'Selecciona una imagen válida: JPG, PNG o WEBP.'
      )
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        'La imagen seleccionada supera los 10 MB.'
      )
      return
    }

    setProcesandoImagen(true)
    setError('')

    const reader = new FileReader()

    reader.onload = (evento) => {

      const img = new Image()

      img.onload = () => {

        try {

          // DIMENSIÓN MÁXIMA DE LA IMAGEN
          const maxDim = 600

          let width = img.width
          let height = img.height

          // CONSERVAR PROPORCIONES
          if (width > maxDim || height > maxDim) {

            if (width > height) {

              height = Math.round(
                (height * maxDim) / width
              )

              width = maxDim

            } else {

              width = Math.round(
                (width * maxDim) / height
              )

              height = maxDim
            }
          }

          // REDIMENSIONAR MEDIANTE CANVAS
          const canvas = document.createElement('canvas')

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')

          if (!ctx) {
            throw new Error('Canvas no disponible')
          }

          ctx.drawImage(img, 0, 0, width, height)

          // CONVERTIR A WEBP OPTIMIZADO
          const optimizadaDataUrl = canvas.toDataURL(
            'image/webp',
            0.85
          )

          setImagen(optimizadaDataUrl)
          setNombreArchivo(file.name)
          setError('')

        } catch (errorImagen) {

          console.error(
            'Error al procesar la imagen:',
            errorImagen
          )

          setError(
            'No fue posible procesar la imagen seleccionada.'
          )

        } finally {

          setProcesandoImagen(false)

        }
      }

      img.onerror = () => {

        setError(
          'No fue posible leer la imagen seleccionada.'
        )

        setProcesandoImagen(false)
      }

      img.src = evento.target.result
    }

    reader.onerror = () => {

      setError(
        'Ocurrió un error al leer el archivo.'
      )

      setProcesandoImagen(false)
    }

    reader.readAsDataURL(file)
  }


  // 3. SELECCIONAR IMAGEN DESDE EL COMPUTADOR
  function handleFileChange(e) {

    const file = e.target.files?.[0]

    if (file) {
      procesarArchivoImagen(file)
    }
  }


  // 4. ARRASTRAR UNA IMAGEN
  function handleDragOver(e) {

    e.preventDefault()

    setArrastrando(true)
  }

  function handleDragLeave(e) {

    e.preventDefault()

    setArrastrando(false)
  }


  // 5. SOLTAR UNA IMAGEN
  function handleDrop(e) {

    e.preventDefault()

    setArrastrando(false)

    const file = e.dataTransfer.files?.[0]

    if (file) {
      procesarArchivoImagen(file)
    }
  }


  // 6. QUITAR LA IMAGEN SELECCIONADA
  function handleQuitarFoto() {

    setImagen('/img/Perfume1.webp')
    setNombreArchivo('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }


  // 7. GUARDAR PRODUCTO EN SPRING BOOT
  async function handleSubmit(e) {

    e.preventDefault()

    if (guardando || cargando || procesandoImagen) {
      return
    }

    setError('')

    // VALIDAR NOMBRE
    if (!nombre.trim()) {

      setError(
        'Por favor ingresa el nombre de la fragancia.'
      )

      return
    }

    // VALIDAR CATEGORÍA
    if (!['Hombre', 'Mujer', 'Unisex'].includes(categoria)) {

      setError('Selecciona una categoría válida.')

      return
    }

    // VALIDAR PRECIO
    if (
      precio === '' ||
      !Number.isFinite(Number(precio)) ||
      Number(precio) <= 0
    ) {

      setError(
        'Ingresa un precio válido mayor a 0.'
      )

      return
    }

    // VALIDAR STOCK
    if (
      stock === '' ||
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {

      setError(
        'Ingresa un stock válido, igual o mayor a 0.'
      )

      return
    }

    // VALIDAR IMAGEN
    if (!imagen) {

      setError(
        'Por favor selecciona una imagen.'
      )

      return
    }

    // CONSTRUIR EL JSON QUE ESPERA SPRING BOOT
    const datosProducto = {

      nombre: nombre.trim(),

      categoria,

      precio: Number(precio),

      stock: Number(stock),

      imagen,

      descripcion: descripcion.trim()

    }

    try {

      setGuardando(true)

      if (esEdicion) {

        // PUT /api/v1/productos/{id}
        await productosApi.put(
          `/productos/${Number(productoId)}`,
          datosProducto
        )

      } else {

        // POST /api/v1/productos
        await productosApi.post(
          '/productos',
          datosProducto
        )

      }

      // REDIRIGIR SOLO SI SPRING BOOT GUARDÓ CORRECTAMENTE
      navigate('/admin/productos')

    } catch (errorGuardado) {

      console.error(
        'Error al guardar producto:',
        errorGuardado
      )

      // MOSTRAR ERRORES DE VALIDACIÓN DEL BACKEND
      if (errorGuardado.response?.status === 400) {

        setError(
          'Spring Boot rechazó los datos del producto. Revisa el nombre, categoría, precio, stock e imagen.'
        )

      } else if (
        errorGuardado.response?.status === 404
      ) {

        setError(
          'El producto ya no existe en la base de datos.'
        )

      } else {

        setError(
          'No fue posible guardar el perfume. Verifica la conexión con Spring Boot.'
        )

      }

    } finally {

      setGuardando(false)

    }
  }


  return (

    <div className="admin-body">

      <div className="admin-layout">

        {/* MENÚ LATERAL */}
        <AdminSidebar paginaActiva="producto-form" />


        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">

          {/* BARRA SUPERIOR */}
          <section className="admin-top mb-4">

            <div>

              <p className="text-secondary mb-1">

                <Link
                  to="/admin/productos"
                  className="text-decoration-none text-secondary"
                >

                  <i className="bi bi-arrow-left me-1"></i>

                  Volver a productos

                </Link>

              </p>


              <h1 className="fw-bold mb-1">

                {esEdicion
                  ? 'Editar Perfume'
                  : 'Crear Nuevo Perfume'
                }

              </h1>


              <p className="text-secondary mb-0">

                {esEdicion
                  ? 'Modifica los datos del producto en el catálogo de Perfulandia.'
                  : 'Completa la información para registrar una nueva fragancia en el inventario.'
                }

              </p>

            </div>


            {/* IDENTIDAD ADMINISTRADOR */}
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


          {/* FORMULARIO */}
          <section
            className="admin-form p-4 p-md-5"
            style={{ maxWidth: '850px' }}
          >

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


            {/* INDICADOR DE CARGA */}
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


            {/* CAMPOS DEL FORMULARIO */}
            {!cargando && !(esEdicion && error) && (

              <form onSubmit={handleSubmit}>

                <div className="row g-4">


                  {/* FOTO DE LA FRAGANCIA */}
                  <div className="col-12">

                    <label className="form-label fw-semibold d-block mb-2">

                      Foto de la fragancia

                      <span className="text-danger">
                        {' '}*
                      </span>

                    </label>


                    <div
                      className={`admin-foto-card ${
                        arrastrando ? 'drag-over' : ''
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >

                      {/* IMAGEN CIRCULAR */}
                      <div
                        className="admin-avatar-container"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        role="button"
                        tabIndex={0}
                        title="Haz clic para cargar una imagen"
                        onKeyDown={(e) => {

                          if (
                            e.key === 'Enter' ||
                            e.key === ' '
                          ) {

                            e.preventDefault()

                            fileInputRef.current?.click()

                          }
                        }}
                      >

                        <img
                          src={imagen}
                          alt="Foto de la fragancia"
                          className="admin-avatar-img"
                          onError={(e) => {

                            e.currentTarget.onerror = null

                            e.currentTarget.src =
                              '/img/Perfume1.webp'

                          }}
                        />


                        <div className="admin-avatar-overlay">

                          <i className="bi bi-camera-fill fs-4 mb-1"></i>

                          <span>Cambiar</span>

                        </div>


                        <div className="admin-avatar-badge">

                          <i className="bi bi-camera-fill"></i>

                        </div>

                      </div>


                      {/* ACCIONES PARA IMAGEN */}
                      <div className="admin-foto-actions">

                        <div>

                          <h6 className="fw-bold mb-1">

                            {nombre
                              ? nombre
                              : 'Foto del perfume'
                            }

                          </h6>


                          <p className="text-secondary small mb-2">

                            {nombreArchivo ? (

                              <span className="text-success fw-semibold">

                                <i className="bi bi-check-circle-fill me-1"></i>

                                {nombreArchivo}

                              </span>

                            ) : (

                              'Sube una imagen desde tu dispositivo o arrástrala aquí.'

                            )}

                          </p>

                        </div>


                        <div className="d-flex align-items-center gap-2 flex-wrap">

                          {/* SUBIR FOTO */}
                          <button
                            type="button"
                            className="btn btn-sm btn-perfulandia"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            disabled={guardando || procesandoImagen}
                          >

                            <i className="bi bi-cloud-arrow-up-fill me-1"></i>

                            Cambiar foto

                          </button>


                          {/* QUITAR FOTO */}
                          {nombreArchivo && (

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={handleQuitarFoto}
                              disabled={guardando || procesandoImagen}
                            >

                              <i className="bi bi-trash3 me-1"></i>

                              Quitar foto

                            </button>

                          )}


                          {/* ELEGIR DEL CATÁLOGO */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              setMostrarCatalogo(!mostrarCatalogo)
                            }
                            disabled={guardando || procesandoImagen}
                          >

                            <i className="bi bi-grid-3x3-gap me-1"></i>

                            {mostrarCatalogo
                              ? 'Ocultar catálogo'
                              : 'Elegir del catálogo'
                            }

                          </button>

                        </div>


                        <small
                          className="text-muted"
                          style={{ fontSize: '0.8rem' }}
                        >

                          Archivos compatibles: JPG, PNG o WEBP.
                          Tamaño máximo: 10 MB.

                        </small>


                        {/* INPUT DE ARCHIVO OCULTO */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="d-none"
                          onChange={handleFileChange}
                        />

                      </div>

                    </div>


                    {/* CATÁLOGO DE IMÁGENES */}
                    {mostrarCatalogo && (

                      <div className="p-3 mt-3 rounded-4 bg-white border shadow-sm">

                        <div className="d-flex justify-content-between align-items-center mb-2">

                          <span className="small fw-semibold text-secondary">

                            O selecciona una fragancia de muestra:

                          </span>


                          <button
                            type="button"
                            className="btn-close btn-sm"
                            aria-label="Cerrar catálogo"
                            onClick={() =>
                              setMostrarCatalogo(false)
                            }
                          />

                        </div>


                        <div className="d-flex gap-2 flex-wrap">

                          {imagenesDisponibles.map((img, i) => (

                            <button
                              key={img}
                              type="button"
                              className={`btn p-1 border rounded-3 admin-thumb-btn ${
                                imagen === img
                                  ? 'active'
                                  : ''
                              }`}
                              onClick={() => {

                                setImagen(img)

                                setNombreArchivo(
                                  `Perfume de muestra ${i + 1}`
                                )

                              }}
                              title={`Perfume ${i + 1}`}
                            >

                              <img
                                src={img}
                                alt={`Perfume ${i + 1}`}
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  objectFit: 'contain'
                                }}
                              />

                            </button>

                          ))}

                        </div>

                      </div>

                    )}

                  </div>


                  {/* NOMBRE DEL PRODUCTO */}
                  <div className="col-md-12">

                    <label
                      htmlFor="nombreProducto"
                      className="form-label fw-semibold"
                    >

                      Nombre de la fragancia

                      <span className="text-danger">
                        {' '}*
                      </span>

                    </label>


                    <input
                      id="nombreProducto"
                      type="text"
                      className="form-control"
                      placeholder="Ej: Dior Sauvage Eau de Parfum 100 ML"
                      value={nombre}
                      onChange={(e) =>
                        setNombre(e.target.value)
                      }
                      required
                    />

                  </div>


                  {/* CATEGORÍA */}
                  <div className="col-md-4">

                    <label
                      htmlFor="categoriaProducto"
                      className="form-label fw-semibold"
                    >

                      Categoría

                      <span className="text-danger">
                        {' '}*
                      </span>

                    </label>


                    <select
                      id="categoriaProducto"
                      className="form-select"
                      value={categoria}
                      onChange={(e) =>
                        setCategoria(e.target.value)
                      }
                      required
                    >

                      <option value="Hombre">Hombre</option>

                      <option value="Mujer">Mujer</option>

                      <option value="Unisex">Unisex</option>

                    </select>

                  </div>


                  {/* PRECIO */}
                  <div className="col-md-4">

                    <label
                      htmlFor="precioProducto"
                      className="form-label fw-semibold"
                    >

                      Precio (CLP)

                      <span className="text-danger">
                        {' '}*
                      </span>

                    </label>


                    <div className="input-group">

                      <span className="input-group-text">
                        $
                      </span>


                      <input
                        id="precioProducto"
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        placeholder="Ej: 49990"
                        value={precio}
                        onChange={(e) =>
                          setPrecio(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>


                  {/* STOCK */}
                  <div className="col-md-4">

                    <label
                      htmlFor="stockProducto"
                      className="form-label fw-semibold"
                    >

                      Stock en bodega

                      <span className="text-danger">
                        {' '}*
                      </span>

                    </label>


                    <input
                      id="stockProducto"
                      type="number"
                      min="0"
                      step="1"
                      className="form-control"
                      placeholder="Ej: 15"
                      value={stock}
                      onChange={(e) =>
                        setStock(e.target.value)
                      }
                      required
                    />

                  </div>


                  {/* DESCRIPCIÓN */}
                  <div className="col-12">

                    <label
                      htmlFor="descripcionProducto"
                      className="form-label fw-semibold"
                    >

                      Descripción y notas olfativas

                    </label>


                    <textarea
                      id="descripcionProducto"
                      rows="3"
                      className="form-control"
                      placeholder="Fragancia fresca, notas de salida de bergamota y fondo amaderado..."
                      value={descripcion}
                      onChange={(e) =>
                        setDescripcion(e.target.value)
                      }
                    />

                  </div>

                </div>


                {/* BOTONES DE ACCIÓN */}
                <div className="d-flex gap-3 mt-4 pt-3 border-top">

                  <button
                    type="submit"
                    className="btn btn-perfulandia px-4 py-2"
                    disabled={guardando || procesandoImagen}
                  >

                    {guardando ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />

                        Guardando...

                      </>

                    ) : procesandoImagen ? (

                      'Procesando imagen...'

                    ) : (

                      <>
                        <i className="bi bi-check-circle me-1"></i>

                        {esEdicion
                          ? 'Guardar Cambios'
                          : 'Crear Producto'
                        }
                      </>

                    )}

                  </button>


                  <Link
                    to="/admin/productos"
                    className="btn btn-outline-secondary px-4 py-2"
                  >

                    Cancelar

                  </Link>

                </div>

              </form>

            )}

          </section>


          {/* FOOTER */}
          <footer className="admin-footer text-center mt-5">

            <small>
              © 2026 Perfulandia - Panel Administrativo
            </small>

          </footer>

        </main>

      </div>

    </div>
  )
}
