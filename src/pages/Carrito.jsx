import { useState } from 'react'
import { Link } from 'react-router'
import { crearPedido } from '../services/api.js'
import { guardarSesion } from '../services/sesion.js'

// Regiones y comunas para despacho en Chile
const regionesComunas = {
  'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto', 'Ñuñoa', 'La Florida'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón'],
  'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chiguayante', 'San Pedro de la Paz'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol'],
  'Los Lagos': ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud']
}

export default function Carrito({
  carrito,
  onModificarCantidad,
  onEliminarProducto,
  onVaciarCarrito,
  usuarioActivo
}) {
  // VERIFICAR SI EL CLIENTE INICIÓ SESIÓN
  const clienteConectado = ['CLIENTE', 'ADMINISTRADOR'].includes(usuarioActivo?.rol)

  // Estados para formulario de Checkout
  const [nombreEditado, setNombre] = useState(null)
  const [correoEditado, setCorreo] = useState(null)
  const nombre = nombreEditado ?? usuarioActivo?.nombre ?? ''
  const correo = correoEditado ?? usuarioActivo?.correo ?? ''
  const [telefono, setTelefono] = useState('')
  const [region, setRegion] = useState('')
  const [comuna, setComuna] = useState('')
  const [direccion, setDireccion] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorValidacion, setErrorValidacion] = useState('')

  const [ordenCompra, setOrdenCompra] = useState(null)

  // Cálculos de totales
  const subtotal = carrito.reduce(
    (total, item) => total + Number(item.precio || 0) * Number(item.cantidad || 1),
    0
  )
  const envioGratisDesde = 40990
  const costoEnvio = subtotal >= envioGratisDesde || subtotal === 0 ? 0 : 3990
  const total = subtotal + costoEnvio

  // Formato chileno CLP
  function formatearPrecio(precio) {
    return `$${Number(precio).toLocaleString('es-CL')}`
  }

  // Manejar cambio de región
  function handleRegionChange(e) {
    setRegion(e.target.value)
    setComuna('')
  }

  // Procesar finalización de compra
  async function handleFinalizarCompra(e) {
    e.preventDefault()
    if (enviando) return
    if (!clienteConectado) {
      setErrorValidacion(usuarioActivo ? 'Tu rol no permite crear pedidos.' : 'Inicia sesión para realizar el pedido.')
      return
    }

    if (carrito.length === 0) {
      setErrorValidacion('El carrito está vacío.')
      return
    }

    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !region || !comuna || !direccion.trim() || !metodoPago) {
      setErrorValidacion('Por favor completa todos los campos de entrega y pago.')
      return
    }

    setErrorValidacion('')
    setEnviando(true)
    try {
      const pedido = await crearPedido({
        items: carrito.map(({ id, cantidad }) => ({ productoId: id, cantidad })),
        entrega: { nombre: nombre.trim(), correo: correo.trim(), telefono: telefono.trim(), region, comuna, direccion: direccion.trim() },
        metodoPago
      })
      setOrdenCompra(pedido)
      onVaciarCarrito()
    } catch (error) {
      const estado = error.response?.status
      if (estado === 401) guardarSesion(null)
      const mensajes = {
        400: 'Revisa las cantidades y los datos de entrega.',
        401: 'Tu sesión venció. Inicia sesión para volver a intentarlo.',
        403: 'Tu rol no permite crear pedidos.',
        404: 'Un producto del carrito ya no está disponible.',
        409: 'Cambió el stock disponible. Revisa las cantidades de tu carrito.'
      }
      setErrorValidacion(mensajes[estado] || 'No se pudo comprobar el pedido. Conservamos tu carrito.')
    } finally {
      setEnviando(false)
    }
  }

  // VISTA 1: COMPRA EXITOSA (Figura 7 de la pauta de Duoc UC)
  if (ordenCompra) {
    return (
      <section className="py-5" style={{ backgroundColor: 'var(--beige-claro)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div className="card shadow border-0 p-4 p-md-5" style={{ borderRadius: '24px' }}>
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#e6f7ed',
                  color: '#198754',
                  borderRadius: '50%',
                  fontSize: '2rem'
                }}
              >
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <p className="text-muted mb-1">Código de orden: #{ordenCompra.id}</p>
              <h1 className="h2 fw-bold">Pedido recibido</h1>
              <p className="text-secondary">
                Estado del pedido: <strong>{ordenCompra.estado}</strong>.
              </p>
            </div>

            <hr />

            <div className="mb-4">
              <h2 className="h5 fw-bold mb-3">Datos de despacho</h2>
              <div className="row g-2 text-secondary">
                <div className="col-sm-6">
                  <strong>Nombre:</strong> {ordenCompra.entrega.nombre}
                </div>
                <div className="col-sm-6">
                  <strong>Teléfono:</strong> {ordenCompra.entrega.telefono}
                </div>
                <div className="col-sm-6">
                  <strong>Comuna / Región:</strong> {ordenCompra.entrega.comuna}, {ordenCompra.entrega.region}
                </div>
                <div className="col-sm-6">
                  <strong>Dirección:</strong> {ordenCompra.entrega.direccion}
                </div>
                <div className="col-12">
                  <strong>Método de pago:</strong> {ordenCompra.metodoPago}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="h5 fw-bold mb-3">Resumen de fragancias</h2>
              <ul className="list-group list-group-flush mb-3">
                {ordenCompra.items.map((item) => (
                  <li key={item.productoId} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div>
                      <strong>{item.nombre}</strong>
                      <span className="text-muted ms-2">x{item.cantidad}</span>
                    </div>
                    <span>{formatearPrecio(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Subtotal</span>
                <span>{formatearPrecio(ordenCompra.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Costo de envío</span>
                <span>{ordenCompra.costoEnvio === 0 ? 'Gratis' : formatearPrecio(ordenCompra.costoEnvio)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2 pt-2 border-top">
                <span>Total pagado</span>
                <span style={{ color: 'var(--rosa-oscuro)' }}>{formatearPrecio(ordenCompra.total)}</span>
              </div>
            </div>

            <div className="text-center mt-3">
              <Link to="/productos" className="btn btn-perfulandia px-4 py-2">
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // VISTA 2: CARRITO VACÍO
  if (carrito.length === 0) {
    return (
      <section className="py-5 text-center" style={{ backgroundColor: 'var(--beige-claro)', minHeight: '60vh' }}>
        <div className="container py-5">
          <i className="bi bi-bag-x display-1" style={{ color: 'var(--rosa-principal)' }}></i>
          <h1 className="h2 mt-4 fw-bold">Tu carrito está vacío</h1>
          <p className="text-muted mb-4">
            Aún no has agregado ninguna fragancia a tu carrito de compras.
          </p>
          <Link to="/productos" className="btn btn-perfulandia px-4 py-2">
            Explorar catálogo de perfumes
          </Link>
        </div>
      </section>
    )
  }

  // VISTA 3: CARRITO CON PRODUCTOS Y CHECKOUT
  return (
    <section className="py-5" style={{ backgroundColor: 'var(--beige-claro)' }}>
      <div className="container">
        <div className="mb-4">
          <p className="section-subtitulo">Revisa tu pedido</p>
          <h1 className="h2 fw-bold">Carrito de Compras</h1>
        </div>

        <div className="row g-4">
          {/* COLUMNA IZQUIERDA: LISTA DE PRODUCTOS Y FORMULARIO DE CHECKOUT */}
          <div className="col-lg-8">

            {/* LISTA DE ITEMS */}
            <div className="carrito-lista mb-4">
              {carrito.map((producto) => {
                const stockDisponible = Number(producto.stock ?? 0)
                const alcanzoTope = producto.cantidad >= stockDisponible
                const sinStock = stockDisponible <= 0

                return (
                  <article key={producto.id} className="carrito-item">
                    <img src={producto.imagen} alt={producto.nombre} />

                    <div className="carrito-item-info">
                      <h2>{producto.nombre}</h2>
                      <p>{formatearPrecio(producto.precio)} c/u</p>

                      {sinStock ? (
                        <span className="badge bg-danger mt-1">Agotado en inventario</span>
                      ) : alcanzoTope ? (
                        <span className="badge bg-warning text-dark mt-1">
                          Límite de stock alcanzado ({stockDisponible} un.)
                        </span>
                      ) : (
                        <small className="text-muted d-block mt-1">
                          Stock disponible: <strong>{stockDisponible}</strong> un.
                        </small>
                      )}
                    </div>

                    <div className="carrito-cantidad">
                      <button
                        type="button"
                        onClick={() => onModificarCantidad(producto.id, -1)} disabled={enviando}
                        aria-label="Disminuir cantidad"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span>{producto.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => onModificarCantidad(producto.id, 1)}
                        aria-label="Aumentar cantidad"
                        disabled={enviando || alcanzoTope}
                        title={alcanzoTope ? `Stock máximo (${stockDisponible}) alcanzado` : 'Aumentar cantidad'}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    <strong className="carrito-subtotal">
                      {formatearPrecio(producto.precio * producto.cantidad)}
                    </strong>

                    <button
                      type="button"
                      className="carrito-eliminar"
                      onClick={() => onEliminarProducto(producto.id)} disabled={enviando}
                      aria-label="Eliminar producto"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </article>
                )
              })}
            </div>

            {/* FORMULARIO DE CHECKOUT (DATOS DE ENTREGA Y PAGO) */}
            <form
              onSubmit={handleFinalizarCompra}
              className="card shadow border-0 p-4 p-md-5 mt-4"
              style={{ borderRadius: '22px', backgroundColor: 'var(--blanco)' }}
            >
              <div className="text-center mb-4">
                <img
                  src="/img/Logo.png"
                  alt="Logo Perfulandia"
                  style={{ width: '130px', margin: '0 auto 12px' }}
                />
                <p className="section-subtitulo mb-1">Datos del pedido</p>
                <h2 className="h4 fw-bold">Información de Entrega y Facturación</h2>
              </div>

              {!usuarioActivo && (
                <p className="alert alert-info">
                  <Link to="/login" state={{ volverAlCarrito: true }}>Inicia sesión</Link> para enviar tu pedido.
                </p>
              )}

              {clienteConectado && (
                <div className="alert alert-success mb-4">
                  <i className="bi bi-person-check-fill me-2"></i>

                  Bienvenido/a, <strong>{usuarioActivo.nombre}</strong>.

                  <p className="mb-0 mt-2">
                    Tus datos personales se han cargado automáticamente.
                  </p>
                </div>
              )}

              {errorValidacion && (
                <div className="alert alert-danger mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errorValidacion}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombreCliente" className="form-label fw-semibold">
                    Nombre completo
                  </label>
                  <input
                    id="nombreCliente"
                    type="text"
                    className="form-control"
                    placeholder="Ej: Darling Morales"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="correoCliente" className="form-label fw-semibold">
                    Correo electrónico
                  </label>
                  <input
                    id="correoCliente"
                    type="email"
                    className="form-control"
                    placeholder="ejemplo@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="telefonoCliente" className="form-label fw-semibold">
                    Teléfono
                  </label>
                  <input
                    id="telefonoCliente"
                    type="tel"
                    className="form-control"
                    placeholder="+56 9 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="regionCliente" className="form-label fw-semibold">
                    Región
                  </label>
                  <select
                    id="regionCliente"
                    className="form-select"
                    value={region}
                    onChange={handleRegionChange}
                    required
                  >
                    <option value="">Selecciona una región</option>
                    {Object.keys(regionesComunas).map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="comunaCliente" className="form-label fw-semibold">
                    Comuna
                  </label>
                  <select
                    id="comunaCliente"
                    className="form-select"
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    disabled={!region}
                    required
                  >
                    <option value="">
                      {region ? 'Selecciona una comuna' : 'Primero selecciona región'}
                    </option>
                    {region &&
                      regionesComunas[region]?.map((com) => (
                        <option key={com} value={com}>
                          {com}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="direccionCliente" className="form-label fw-semibold">
                    Dirección de despacho
                  </label>
                  <input
                    id="direccionCliente"
                    type="text"
                    className="form-control"
                    placeholder="Calle, número, depto / casa"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="metodoPago" className="form-label fw-semibold">
                    Método de pago
                  </label>
                  <select
                    id="metodoPago"
                    className="form-select"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    required
                  >
                    <option value="">Selecciona forma de pago</option>
                    <option value="Tarjeta de Débito (WebPay)">Tarjeta de Débito (WebPay)</option>
                    <option value="Tarjeta de Crédito (Hasta 3 cuotas sin interés)">
                      Tarjeta de Crédito (Hasta 3 cuotas sin interés)
                    </option>
                    <option value="Transferencia Electrónica">Transferencia Electrónica</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button type="submit" disabled={enviando} className="btn btn-perfulandia w-100 py-3 fw-semibold">
                  <i className="bi bi-lock-fill me-2"></i> {enviando ? 'Enviando pedido…' : 'Enviar pedido'}
                </button>
              </div>
            </form>
          </div>

          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO */}
          <aside className="col-lg-4">
            <div className="resumen-compra">
              <h2>Resumen del Pedido</h2>

              <div className="d-flex justify-content-between mb-2 text-secondary">
                <span>Subtotal ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})</span>
                <strong>{formatearPrecio(subtotal)}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3 text-secondary">
                <span>Despacho</span>
                <strong>
                  {costoEnvio === 0 ? (
                    <span className="text-success fw-bold">Gratis</span>
                  ) : (
                    formatearPrecio(costoEnvio)
                  )}
                </strong>
              </div>

              {subtotal < envioGratisDesde && (
                <div className="alert alert-light border py-2 px-3 small mb-3">
                  <i className="bi bi-truck text-muted me-1"></i>
                  Agrega {formatearPrecio(envioGratisDesde - subtotal)} más para obtener <strong>Envío Gratis</strong>.
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between resumen-total mb-4">
                <span>Total</span>
                <span>{formatearPrecio(total)}</span>
              </div>

              <button
                type="button"
                className="btn btn-outline-danger w-100 py-2"
                onClick={onVaciarCarrito} disabled={enviando}
              >
                <i className="bi bi-trash3 me-1"></i> Vaciar Carrito
              </button>

              <div className="text-center mt-3">
                <Link to="/productos" className="text-decoration-none small text-muted">
                  <i className="bi bi-arrow-left me-1"></i> Seguir mirando perfumes
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
