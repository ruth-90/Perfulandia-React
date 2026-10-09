import { Link } from 'react-router'

export default function ProductoCard({
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

        <div className="card-body text-center">

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
            ${precio.toLocaleString('es-CL')}
          </p>

          {/* Botón ver producto */}
          <Link
            to="/productos"
            className="btn btn-perfulandia"
          >
            Ver producto
          </Link>

        </div>

      </div>

    </article>
  )
}