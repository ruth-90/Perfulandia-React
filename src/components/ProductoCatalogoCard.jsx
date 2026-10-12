import { Link } from 'react-router'

export default function ProductoCatalogoCard({
  producto,
  onAgregar
}) {
  const sinStock = Number(producto.stock ?? 1) <= 0

  // Formatear precio en pesos chilenos
  const precioFormateado = Number(producto.precio || 0).toLocaleString(
    'es-CL',
    {
      style: 'currency',
      currency: 'CLP'
    }
  )

  return (
    <article className="col-sm-6 col-lg-4">
      <div className="card producto-card h-100">
        {/* IMAGEN */}
        <div className="producto-imagen-contenedor">
          <img
            src={producto.imagen}
            className="card-img-top"
            alt={producto.nombre}
          />
        </div>

        {/* INFORMACIÓN */}
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <p className="producto-categoria mb-0">
              {producto.categoria}
            </p>
            {sinStock && (
              <span className="badge bg-danger" style={{ fontSize: '0.75rem' }}>
                Agotado
              </span>
            )}
          </div>

          <h2 className="producto-nombre">
            {producto.nombre}
          </h2>

          <p className="producto-descripcion">
            {producto.descripcion}
          </p>

          <p className="producto-precio">
            {precioFormateado}
          </p>

          {/* BOTONES */}
          <div className="mt-auto">
            <Link
              to={`/producto-detalle?id=${producto.id}`}
              className="btn btn-outline-perfulandia w-100 mb-2"
            >
              Ver detalle
            </Link>

            <button
              type="button"
              className="btn btn-perfulandia w-100"
              onClick={() => onAgregar(producto)}
              disabled={sinStock}
            >
              {sinStock ? (
                'Producto Agotado'
              ) : (
                <>
                  <i className="bi bi-bag-plus"></i> Añadir al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
