export default function Beneficios() {
  return (
    <>
      {/* SECCIÓN BENEFICIOS */}
      <section className="beneficios py-5">

        <div className="container">

          <div className="row g-4 text-center">

            {/* CALIDAD */}
            <article className="col-md-4">

              <div className="beneficio">

                <i className="bi bi-stars"></i>

                <h3>
                  Calidad
                </h3>

                <p>
                  Una selección especial de fragancias
                  para cada ocasión.
                </p>

              </div>

            </article>

            {/* COMPRA SEGURA */}
            <article className="col-md-4">

              <div className="beneficio">

                <i className="bi bi-box-seam"></i>

                <h3>
                  Compra segura
                </h3>

                <p>
                  Compra tus productos favoritos
                  de manera simple y rápida.
                </p>

              </div>

            </article>

            {/* DESPACHOS */}
            <article className="col-md-4">

              <div className="beneficio">

                <i className="bi bi-truck"></i>

                <h3>
                  Despachos
                </h3>

                <p>
                  Recibe tus fragancias directamente
                  donde las necesites.
                </p>

              </div>

            </article>

          </div>

        </div>

      </section>
    </>
  )
}