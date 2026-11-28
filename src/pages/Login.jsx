
import { useLocation } from 'react-router'
import LoginForm from '../components/LoginForm.jsx'
import '../styles/login.css'

export default function Login({ onLogin }) {
  const { state } = useLocation()
  return (
    <section className="container py-5">

      <div className="row justify-content-center">

        <div className="col-12 col-md-8 col-lg-5">

          <div className="card login-card shadow border-0 p-4">

            {/* Encabezado del login */}
            <div className="text-center mb-4">

              <img
                src="/img/Logo.png"
                alt="Logo Perfulandia"
                className="logo-login"
              />

              <p className="text-secondary mb-0">
                Ingresa a tu cuenta
              </p>

            </div>

            {/* Formulario de inicio de sesión */}
            {state?.registroExitoso && <div className="alert alert-success">Cuenta creada. Ya puedes iniciar sesión.</div>}
            <LoginForm onLogin={onLogin} volverAlCarrito={state?.volverAlCarrito} />

            {/* Enlace de registro */}
            <div className="text-center mt-4">

              <p className="mb-1">
                ¿No tienes una cuenta?
              </p>

              <a href="/registro" className="link-registro">
                Crear una cuenta
              </a>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
