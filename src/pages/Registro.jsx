
import { Link } from 'react-router'
import RegistroForm from '../components/RegistroForm.jsx'
import '../styles/registro.css'

export default function Registro() {
  return (
    <section className="container py-5">

      <div className="row justify-content-center">

        <div className="col-12 col-md-8 col-lg-6">

          <div className="card registro-card shadow border-0 p-4 p-md-5">

            {/* ENCABEZADO */}
            <div className="text-center mb-4">

              <img
                src="/img/Logo.png"
                alt="Logo Perfulandia"
                className="logo-registro"
              />

              <p className="text-secondary mb-0">
                Crea tu cuenta
              </p>

            </div>

            {/* FORMULARIO DE REGISTRO */}
            <RegistroForm />

            {/* VOLVER AL LOGIN */}
            <div className="text-center mt-4">

              <p className="mb-1">
                ¿Ya tienes una cuenta?
              </p>

              <Link to="/login" className="link-registro">
                Iniciar sesión
              </Link>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
