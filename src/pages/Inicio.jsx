import { Link } from 'react-router'
import Carrusel from '../components/Carrusel.jsx'
import Beneficios from '../components/Beneficios.jsx'
import ProductoCard from '../components/ProductoCard.jsx'
import '../styles/inicio.css'

// Datos de los productos destacados
const productosDestacados = [
  {
    id: 1,
    imagen: '/img/Perfume5.webp',
    categoria: 'Mujer',
    nombre: 'Paco Rabanne Olympea',
    precio: 39990
  },
  {
    id: 2,
    imagen: '/img/Perfume8.webp',
    categoria: 'Mujer',
    nombre: 'Power Of You EDP 50 ML',
    precio: 49990
  },
  {
    id: 3,
    imagen: '/img/Perfume11.webp',
    categoria: 'Unisex',
    nombre: 'Azzaro The Most Wanted Intense EDT 100 ML',
    precio: 49990
  }
]

export default function Inicio() {
  return (
    <>
      {/* Carrusel principal de Perfulandia */}
      <Carrusel />

      {/* Sección de beneficios */}
      <Beneficios />

      {/* PRODUCTOS DESTACADOS */}
      <section className="productos-destacados py-5">
        <div className="container">

          <div className="text-center mb-5">
            <p className="section-subtitulo">
              Nuestra selección
            </p>

            <h2>Perfumes destacados</h2>

            <p className="section-descripcion">
              Conoce algunas de nuestras fragancias favoritas.
            </p>
          </div>

          <div className="row g-4">
            {productosDestacados.map((producto) => (
              <ProductoCard
                key={producto.id}
                imagen={producto.imagen}
                categoria={producto.categoria}
                nombre={producto.nombre}
                precio={producto.precio}
              />
            ))}
          </div>

          <div className="text-center mt-5">
            <Link
              to="/productos"
              className="btn btn-outline-perfulandia"
            >
              Ver todos los productos
            </Link>
          </div>

        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section className="home-nosotros py-5">
        <div className="container">
          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <img
                src="/img/Logo.png"
                alt="Perfulandia"
                className="img-fluid imagen-nosotros"
              />
            </div>

            <div className="col-lg-6">
              <p className="section-subtitulo">
                Sobre nosotros
              </p>

              <h2>
                El perfume perfecto para cada historia
              </h2>

              <p>
                En Perfulandia creemos que una fragancia
                puede transmitir emociones, recuerdos
                y personalidad.
              </p>

              <p>
                Nuestra misión es acercarte a distintos
                aromas para que puedas encontrar aquel
                que te represente.
              </p>

              <Link
                to="/nosotros"
                className="btn btn-perfulandia"
              >
                Conocer Perfulandia
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}