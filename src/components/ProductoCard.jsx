import { Link } from 'react-router'

export default function ProductoCard({
  id,
  imagen,
  categoria,
  nombre,
  precio
}) {
  return (
    <article className="col-md-6 col-lg-4">
      <div className="card producto-card h-100">
        {/* Imagen del perfume */}
        <img
          src={imagen}
          className="card-img-top"
          alt={nombre}
        />

        <div className="card-body text-center d-flex flex-column">
          {/* Categoría */}
          <p className="producto-categoria">
            {categoria}
          </p>

          {/* Nombre */}
          <h3 className="producto-nombre">
            {nombre}
          </h3>

          {/* Precio */}
          <p className="producto-precio">
            ${Number(precio).toLocaleString('es-CL')}
          </p>

          {/* Botón ver producto */}
          <Link
            to={id ? `/producto-detalle?id=${id}` : '/productos'}
            className="btn btn-perfulandia mt-auto"
          >
            Ver producto
          </Link>
        </div>
      </div>
    </article>
  )
}