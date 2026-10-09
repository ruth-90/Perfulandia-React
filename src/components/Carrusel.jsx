export default function Carrusel() {
  return (
    <section className="banner-home">

      <div
        id="carouselPerfulandia"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="3500"
      >

        {/* INDICADORES */}
        <div className="carousel-indicators">

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Banner 1"
          />

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="1"
            aria-label="Banner 2"
          />

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="2"
            aria-label="Banner 3"
          />

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="3"
            aria-label="Banner 4"
          />

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="4"
            aria-label="Banner 5"
          />

          <button
            type="button"
            data-bs-target="#carouselPerfulandia"
            data-bs-slide-to="5"
            aria-label="Banner 6"
          />

        </div>

        {/* IMÁGENES DEL CARRUSEL */}
        <div className="carousel-inner">

          <div className="carousel-item active">
            <img
              src="/img/banner1.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 1"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/img/banner2.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 2"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/img/banner3.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 3"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/img/banner4.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 4"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/img/banner5.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 5"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/img/banner6.png"
              className="d-block w-100 banner-img"
              alt="Banner perfume 6"
            />
          </div>

        </div>

        {/* FLECHA IZQUIERDA */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselPerfulandia"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          />
          <span className="visually-hidden">
            Anterior
          </span>
        </button>

        {/* FLECHA DERECHA */}
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselPerfulandia"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          />
          <span className="visually-hidden">
            Siguiente
          </span>
        </button>

      </div>
    </section>
  )
}