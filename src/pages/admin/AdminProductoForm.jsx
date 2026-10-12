import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import {
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto
} from '../../services/productosStorage.js'

// Lista de imágenes disponibles de perfumes para selección rápida de muestra
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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const productoId = searchParams.get('id')

  const esEdicion = Boolean(productoId)
  const fileInputRef = useRef(null)

  // Estados controlados del formulario
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Unisex')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagen, setImagen] = useState('/img/Perfume1.webp')
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (productoId) {
      const productoExistente = obtenerProductoPorId(productoId)
      if (productoExistente) {
        setNombre(productoExistente.nombre)
        setCategoria(productoExistente.categoria)
        setPrecio(productoExistente.precio)
        setStock(productoExistente.stock)
        setImagen(productoExistente.imagen || '/img/Perfume1.webp')
        setDescripcion(productoExistente.descripcion || '')
        setNombreArchivo('Imagen actual del producto')
      } else {
        setError('El producto que intentas editar no existe.')
      }
    }
  }, [productoId])

  // Procesar archivo seleccionado (redimensionado inteligente para optimizar localStorage)
  function procesarArchivoImagen(file) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen seleccionada supera los 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Redimensionar para evitar sobrepasar cuota de localStorage
        const maxDim = 600
        let width = img.width
        let height = img.height

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const optimizadaDataUrl = canvas.toDataURL('image/webp', 0.85)
        setImagen(optimizadaDataUrl)
        setNombreArchivo(file.name)
        setError('')
      }
      img.onerror = () => {
        setImagen(e.target.result)
        setNombreArchivo(file.name)
        setError('')
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      procesarArchivoImagen(file)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    setArrastrando(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setArrastrando(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      procesarArchivoImagen(file)
    }
  }

  function handleQuitarFoto() {
    setImagen('/img/Perfume1.webp')
    setNombreArchivo('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Guardar (Crear o Actualizar)
  function handleSubmit(e) {
    e.preventDefault()

    // Validaciones
    if (!nombre.trim()) {
      setError('Por favor ingresa el nombre de la fragancia.')
      return
    }
    if (!precio || Number(precio) <= 0) {
      setError('Por favor ingresa un precio válido mayor a 0.')
      return
    }
    if (stock === '' || Number(stock) < 0) {
      setError('Por favor ingresa un stock válido (0 o mayor).')
      return
    }
    if (!imagen) {
      setError('Por favor carga una foto para la fragancia.')
      return
    }

    const datosProducto = {
      nombre,
      categoria,
      precio: Number(precio),
      stock: Number(stock),
      imagen,
      descripcion
    }

    if (esEdicion) {
      actualizarProducto(productoId, datosProducto)
    } else {
      crearProducto(datosProducto)
    }

    // Redirigir al inventario
    navigate('/admin/productos')
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
                <Link to="/admin/productos" className="text-decoration-none text-secondary">
                  <i className="bi bi-arrow-left me-1"></i> Volver a productos
                </Link>
              </p>
              <h1 className="fw-bold mb-1">
                {esEdicion ? 'Editar Perfume' : 'Crear Nuevo Perfume'}
              </h1>
              <p className="text-secondary mb-0">
                {esEdicion
                  ? 'Modifica los datos del producto en el catálogo de Perfulandia.'
                  : 'Completa la información para registrar una nueva fragancia en el inventario.'}
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

          {/* FORMULARIO */}
          <section className="admin-form p-4 p-md-5" style={{ maxWidth: '850px' }}>
            {error && (
              <div className="alert alert-danger mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* FOTO DE LA FRAGANCIA - ESTILO INSTAGRAM */}
                <div className="col-12">
                  <label className="form-label fw-semibold d-block mb-2">
                    Foto de la fragancia <span className="text-danger">*</span>
                  </label>

                  <div
                    className={`admin-foto-card ${arrastrando ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* AVATAR CIRCULAR CON OVERLAY Y BOTÓN FLOTANTE */}
                    <div
                      className="admin-avatar-container"
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      title="Haz clic para cargar una imagen desde tu dispositivo"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          fileInputRef.current?.click()
                        }
                      }}
                    >
                      <img
                        src={imagen}
                        alt="Foto de la fragancia"
                        className="admin-avatar-img"
                        onError={(e) => {
                          e.target.src = '/img/Perfume1.webp'
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

                    {/* ACCIONES Y DETALLES */}
                    <div className="admin-foto-actions">
                      <div>
                        <h6 className="fw-bold mb-1">
                          {nombre ? nombre : 'Foto del perfume'}
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
                        <button
                          type="button"
                          className="btn btn-sm btn-perfulandia"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                          {imagen ? 'Cambiar foto' : 'Subir foto'}
                        </button>

                        {nombreArchivo && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleQuitarFoto}
                          >
                            <i className="bi bi-trash3 me-1"></i>
                            Quitar foto
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
                        >
                          <i className="bi bi-grid-3x3-gap me-1"></i>
                          {mostrarCatalogo ? 'Ocultar catálogo' : 'Elegir del catálogo'}
                        </button>
                      </div>

                      <small className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Archivos compatibles: JPG, PNG o WEBP. Sin escribir rutas.
                      </small>

                      {/* Input de archivo nativo oculto */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp, image/gif"
                        className="d-none"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {/* CATÁLOGO VISUAL DE MUESTRAS OPCIONAL */}
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
                          onClick={() => setMostrarCatalogo(false)}
                        ></button>
                      </div>
                      <div className="d-flex gap-2 flex-wrap">
                        {imagenesDisponibles.map((img, i) => (
                          <button
                            key={img}
                            type="button"
                            className={`btn p-1 border rounded-3 admin-thumb-btn ${
                              imagen === img ? 'active' : ''
                            }`}
                            onClick={() => {
                              setImagen(img)
                              setNombreArchivo(`Perfume de muestra ${i + 1}`)
                            }}
                            title={`Perfume ${i + 1}`}
                          >
                            <img
                              src={img}
                              alt={`Perfume ${i + 1}`}
                              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* NOMBRE */}
                <div className="col-md-12">
                  <label htmlFor="nombreProducto" className="form-label fw-semibold">
                    Nombre de la fragancia <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nombreProducto"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Dior Sauvage Eau de Parfum 100 ML"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                {/* CATEGORÍA */}
                <div className="col-md-4">
                  <label htmlFor="categoriaProducto" className="form-label fw-semibold">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    id="categoriaProducto"
                    className="form-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                {/* PRECIO */}
                <div className="col-md-4">
                  <label htmlFor="precioProducto" className="form-label fw-semibold">
                    Precio (CLP) <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      id="precioProducto"
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="Ej: 49990"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* STOCK */}
                <div className="col-md-4">
                  <label htmlFor="stockProducto" className="form-label fw-semibold">
                    Stock en bodega <span className="text-danger">*</span>
                  </label>
                  <input
                    id="stockProducto"
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Ej: 15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="col-12">
                  <label htmlFor="descripcionProducto" className="form-label fw-semibold">
                    Descripción y notas olfativas
                  </label>
                  <textarea
                    id="descripcionProducto"
                    rows="3"
                    className="form-control"
                    placeholder="Fragancia fresca, notas de salida de bergamota y fondo amaderado..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="d-flex gap-3 mt-4 pt-3 border-top">
                <button type="submit" className="btn btn-perfulandia px-4 py-2">
                  <i className="bi bi-check-circle me-1"></i>
                  {esEdicion ? 'Guardar Cambios' : 'Crear Producto'}
                </button>

                <Link to="/admin/productos" className="btn btn-outline-secondary px-4 py-2">
                  Cancelar
                </Link>
              </div>
            </form>
          </section>

          {/* FOOTER */}
          <footer className="admin-footer text-center mt-5">
            <small>© 2026 Perfulandia - Panel Administrativo</small>
          </footer>
        </main>
      </div>
    </div>
  )
}

