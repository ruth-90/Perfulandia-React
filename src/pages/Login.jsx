
import LoginForm from '../components/LoginForm.jsx'
import '../styles/login.css'

export default function Login() {
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
            <LoginForm />

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
