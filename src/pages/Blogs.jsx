import { Link } from 'react-router'

export default function Blogs() {
  return (
    <>
      {/* HERO DEL BLOG */}
      <section className="blog-hero text-center">
        <div className="container">
          <p className="section-subtitulo">Guías y fragancias</p>
          <h1>Blog de Perfumería</h1>
          <p className="blog-hero-texto">
            Aprende a elegir tu perfume según tu piel, la temporada y cada momento especial.
            Consejos prácticos para que tu fragancia hable por ti.
          </p>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="blog-contenido py-5">
        <div className="container">

          {/* ARTÍCULO DESTACADO */}
          <article className="blog-destacado mb-5">
            <div className="row g-4 align-items-center">
              <div className="col-lg-6">
                <img
                  src="/img/Perfume11.webp"
                  alt="Perfume elegante para ocasiones especiales"
                  className="img-fluid"
                />
              </div>

              <div className="col-lg-6">
                <p className="producto-categoria">Guía destacada</p>
                <h2>Cómo reconocer el perfume ideal para tu estilo</h2>
                <p>
                  Elegir una fragancia no se trata solo de oler bien. También habla de tu personalidad,
                  tus rutinas y los momentos en que quieres usarla. Descubre cómo identificar las familias olfativas
                  que mejor combinan contigo.
                </p>
                <Link to="/productos" className="btn btn-perfulandia">
                  Explorar productos
                </Link>
              </div>
            </div>
          </article>

          {/* LISTA DE ARTÍCULOS */}
          <div className="row g-4">
            {/* Tarjeta 1 */}
            <article className="col-md-6 col-lg-4">
              <div className="card blog-card h-100">
                <img
                  src="/img/Perfume4.webp"
                  className="card-img-top"
                  alt="Perfume floral para uso diario"
                />
                <div className="card-body d-flex flex-column">
                  <p className="producto-categoria">Día a día</p>
                  <h3 className="blog-titulo">Fragancias frescas para todos los días</h3>
                  <p className="producto-descripcion">
                    Las notas cítricas, florales suaves y acuáticas son la opción perfecta para clases,
                    oficina y salidas casuales sin saturar el ambiente.
                  </p>
                  <Link to="/productos" className="btn btn-outline-perfulandia mt-auto">
                    Ver perfumes
                  </Link>
                </div>
              </div>
            </article>

            {/* Tarjeta 2 */}
            <article className="col-md-6 col-lg-4">
              <div className="card blog-card h-100">
                <img
                  src="/img/Perfume9.webp"
                  className="card-img-top"
                  alt="Perfume unisex moderno"
                />
                <div className="card-body d-flex flex-column">
                  <p className="producto-categoria">Tendencias</p>
                  <h3 className="blog-titulo">Aromas unisex que combinan con todo</h3>
                  <p className="producto-descripcion">
                    Las fragancias unisex mezclan acordes amaderados, dulces y especiados para adaptarse
                    con elegancia a cualquier personalidad y género.
                  </p>
                  <Link to="/productos" className="btn btn-outline-perfulandia mt-auto">
                    Ver unisex
                  </Link>
                </div>
              </div>
            </article>

            {/* Tarjeta 3 */}
            <article className="col-md-6 col-lg-4">
              <div className="card blog-card h-100">
                <img
                  src="/img/Perfume6.webp"
                  className="card-img-top"
                  alt="Perfume cálido y envolvente"
                />
                <div className="card-body d-flex flex-column">
                  <p className="producto-categoria">Cuidado</p>
                  <h3 className="blog-titulo">Tips para que tu perfume dure más</h3>
                  <p className="producto-descripcion">
                    Aplicarlo en zonas de pulso, hidratar la piel antes de vaporizar y guardarlo lejos
                    del calor y la luz directa ayuda a mantener intacto su aroma.
                  </p>
                  <Link to="/contacto" className="btn btn-outline-perfulandia mt-auto">
                    Pedir recomendación
                  </Link>
                </div>
              </div>
            </article>
          </div>

          {/* SECCIÓN RECOMENDACIONES SEGÚN PIEL Y TEMPORADA */}
          <section className="blog-recomendaciones mt-5">
            <div className="text-center mb-4">
              <p className="section-subtitulo">Recomendaciones</p>
              <h2>Elige según tu piel y temporada</h2>
              <p className="section-descripcion">
                El mismo perfume puede sentirse distinto según tu tipo de piel, el clima y el momento del día.
              </p>
            </div>

            <div className="row g-4">
              <article className="col-lg-6">
                <div className="blog-guia h-100">
                  <div className="blog-guia-icono">
                    <i className="bi bi-droplet-half"></i>
                  </div>
                  <h3>Según tu piel y pH</h3>
                  <ul>
                    <li>
                      <strong>Piel seca:</strong> Prefiere aromas amaderados, dulces o especiados; duran mucho más si hidratas la zona antes con crema neutra.
                    </li>
                    <li>
                      <strong>Piel grasa:</strong> Las fragancias suelen fijarse con más intensidad, por eso funcionan excelente los aromas frescos, florales o cítricos.
                    </li>
                    <li>
                      <strong>Piel sensible:</strong> Prueba primero en una zona pequeña de la muñeca y elige fragancias suaves para el día a día.
                    </li>
                  </ul>
                </div>
              </article>

              <article className="col-lg-6">
                <div className="blog-guia h-100">
                  <div className="blog-guia-icono">
                    <i className="bi bi-sun"></i>
                  </div>
                  <h3>Según la temporada</h3>
                  <ul>
                    <li>
                      <strong>Primavera:</strong> Florales, frutales suaves y aromas limpios llenos de vitalidad.
                    </li>
                    <li>
                      <strong>Verano:</strong> Cítricos, acuáticos y frescos para evitar agobiar con las altas temperaturas.
                    </li>
                    <li>
                      <strong>Otoño:</strong> Vainilla, especias suaves, ámbar y notas amaderadas envolventes.
                    </li>
                    <li>
                      <strong>Invierno:</strong> Perfumes intensos, orientales, gourmand y con mayor proyección y estela.
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </section>

        </div>
      </section>
    </>
  )
}
