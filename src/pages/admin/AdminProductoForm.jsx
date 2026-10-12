import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import {
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto
} from '../../services/productosStorage.js'

// Lista de imágenes disponibles de perfumes para selección rápida
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

  // Estados controlados del formulario
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('Unisex')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagen, setImagen] = useState('/img/Perfume1.webp')
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
      } else {
        setError('El producto que intentas editar no existe.')
      }
    }
  }, [productoId])

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

                {/* SELECTOR DE IMAGEN */}
                <div className="col-md-8">
                  <label htmlFor="imagenProducto" className="form-label fw-semibold">
                    Imagen del perfume
                  </label>
                  <select
                    id="imagenProducto"
                    className="form-select mb-2"
                    value={imagen}
                    onChange={(e) => setImagen(e.target.value)}
                  >
                    {imagenesDisponibles.map((img, i) => (
                      <option key={img} value={img}>
                        Perfume {i + 1} ({img})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="form-control form-control-sm text-muted"
                    placeholder="O escribe una ruta personalizada..."
                    value={imagen}
                    onChange={(e) => setImagen(e.target.value)}
                  />
                </div>

                {/* VISTA PREVIA DE LA IMAGEN */}
                <div className="col-md-4 text-center">
                  <label className="form-label fw-semibold d-block">Vista previa</label>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto',
                      borderRadius: '16px',
                      backgroundColor: 'var(--rosa-claro)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px'
                    }}
                  >
                    <img
                      src={imagen}
                      alt="Vista previa"
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      onError={(e) => {
                        e.target.src = '/img/Perfume1.webp'
                      }}
                    />
                  </div>
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

