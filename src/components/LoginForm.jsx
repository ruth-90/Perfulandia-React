
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { iniciarSesion } from '../services/api.js'
import { guardarSesion } from '../services/sesion.js'

export default function LoginForm({ onLogin, volverAlCarrito }) {

  // ESTADOS DEL FORMULARIO
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  // ESTADOS DE VALIDACIÓN
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')

  const [correoValidado, setCorreoValidado] = useState(false)
  const [contrasenaValidada, setContrasenaValidada] = useState(false)

  // MENSAJES DEL LOGIN
  const [enviando, setEnviando] = useState(false)
  const [mensajeLogin, setMensajeLogin] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('')

  // NAVEGACIÓN
  const navigate = useNavigate()

  // VALIDAR CORREO
  function validarCorreo(correoValor) {

    const correoLimpio = correoValor.trim().toLowerCase()

    if (correoLimpio === '') {
      return {
        valido: false,
        mensaje: 'El correo electrónico es obligatorio.'
      }
    }

    if (correoLimpio.length > 150) {
      return {
        valido: false,
        mensaje: 'El correo no puede superar los 150 caracteres.'
      }
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formatoCorreo.test(correoLimpio)) {
      return {
        valido: false,
        mensaje: 'Ingresa un correo electrónico válido.'
      }
    }

    return {
      valido: true,
      mensaje: ''
    }
  }

  // VALIDAR CONTRASEÑA
  function validarContrasena(contrasenaValor) {

    if (contrasenaValor === '') {
      return {
        valido: false,
        mensaje: 'La contraseña es obligatoria.'
      }
    }

    return {
      valido: true,
      mensaje: ''
    }
  }

  // VALIDAR CORREO AL SALIR DEL CAMPO
  function validarCampoCorreo() {

    const resultado = validarCorreo(correo)

    setErrorCorreo(resultado.mensaje)
    setCorreoValidado(true)
  }

  // VALIDAR CONTRASEÑA AL SALIR DEL CAMPO
  function validarCampoContrasena() {

    const resultado = validarContrasena(contrasena)

    setErrorContrasena(resultado.mensaje)
    setContrasenaValidada(true)
  }

  // PROCESAR INICIO DE SESIÓN
  async function manejarEnvio(evento) {

    evento.preventDefault()
    if (enviando) return

    setMensajeLogin('')
    setTipoMensaje('')

    const resultadoCorreo = validarCorreo(correo)
    const resultadoContrasena = validarContrasena(contrasena)

    setErrorCorreo(resultadoCorreo.mensaje)
    setErrorContrasena(resultadoContrasena.mensaje)

    setCorreoValidado(true)
    setContrasenaValidada(true)

    // DETENER SI LOS DATOS NO SON VÁLIDOS
    if (!resultadoCorreo.valido || !resultadoContrasena.valido) {
      return
    }

    setEnviando(true)
    try {
      const { id, nombre, correo: correoUsuario, rol, token } = await iniciarSesion({
        correo: correo.trim().toLowerCase(), password: contrasena
      })
      if (!token || !['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'].includes(rol)) throw new Error('Sesión inválida')
      const usuario = { id, nombre, correo: correoUsuario, rol, token }
      guardarSesion(usuario)
      onLogin?.(usuario)
      const inicioPorRol = { ADMINISTRADOR: '/admin', VENDEDOR: '/pedidos', CLIENTE: '/productos' }
      const destino = volverAlCarrito && rol !== 'VENDEDOR' ? '/carrito' : inicioPorRol[rol]
      navigate(destino)
    } catch (error) {
      const estado = error.response?.status
      setTipoMensaje('danger')
      setMensajeLogin(estado === 401 ? 'Correo o contraseña incorrectos.'
        : estado === 403 ? 'Esta cuenta no está habilitada.'
          : 'No se pudo iniciar sesión. Vuelve a intentarlo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>

      {/* CORREO ELECTRÓNICO */}
      <div className="mb-3">

        <label htmlFor="correo" className="form-label">
          Correo electrónico
        </label>

        <input
          type="email"
          id="correo"
          className={`form-control ${
            correoValidado
              ? errorCorreo
                ? 'is-invalid'
                : 'is-valid'
              : ''
          }`}
          placeholder="ejemplo@gmail.com"
          value={correo}
          maxLength={150}
          onChange={(evento) => {
            setCorreo(evento.target.value)
            setCorreoValidado(false)
            setErrorCorreo('')
            setMensajeLogin('')
          }}
          onBlur={validarCampoCorreo}
        />

        <div className="invalid-feedback">
          {errorCorreo}
        </div>


      </div>

      {/* CONTRASEÑA */}
      <div className="mb-3">

        <label htmlFor="contrasena" className="form-label">
          Contraseña
        </label>

        <input
          type={mostrarContrasena ? 'text' : 'password'}
          id="contrasena"
          className={`form-control ${
            contrasenaValidada
              ? errorContrasena
                ? 'is-invalid'
                : 'is-valid'
              : ''
          }`}
          placeholder="Ingresa tu contraseña"
          value={contrasena}
          onChange={(evento) => {
            setContrasena(evento.target.value)
            setContrasenaValidada(false)
            setErrorContrasena('')
            setMensajeLogin('')
          }}
          onBlur={validarCampoContrasena}
        />

        <div className="invalid-feedback">
          {errorContrasena}
        </div>


      </div>

      {/* MOSTRAR CONTRASEÑA */}
      <div className="form-check mb-3">

        <input
          type="checkbox"
          id="mostrarContrasena"
          className="form-check-input"
          checked={mostrarContrasena}
          onChange={(evento) =>
            setMostrarContrasena(evento.target.checked)
          }
        />

        <label
          htmlFor="mostrarContrasena"
          className="form-check-label"
        >
          Mostrar contraseña
        </label>

      </div>

      {/* MENSAJE DE INICIO DE SESIÓN */}
      {mensajeLogin && (
        <div
          className={`alert alert-${tipoMensaje} mt-3`}
          role="alert"
        >
          {mensajeLogin}
        </div>
      )}

      {/* BOTÓN INICIAR SESIÓN */}
      <button
        type="submit"
        disabled={enviando}
        className="btn btn-perfulandia w-100"
      >
        Iniciar sesión
      </button>

    </form>
  )
}
