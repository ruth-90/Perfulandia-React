
import { useState } from 'react'
import { useNavigate } from 'react-router'

export default function LoginForm() {

  // ESTADOS DEL FORMULARIO
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  // ESTADOS DE VALIDACIÓN
  const [errorCorreo, setErrorCorreo] = useState('')
  const [errorContrasena, setErrorContrasena] = useState('')

  const [correoValidado, setCorreoValidado] = useState(false)
  const [contrasenaValidada, setContrasenaValidada] = useState(false)

  // MENSAJE DE INICIO DE SESIÓN
  const [mensajeLogin, setMensajeLogin] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('')

  // NAVEGACIÓN DE REACT ROUTER
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

    if (correoLimpio.length > 100) {
      return {
        valido: false,
        mensaje: 'El correo no puede superar los 100 caracteres.'
      }
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formatoCorreo.test(correoLimpio)) {
      return {
        valido: false,
        mensaje: 'Ingresa un correo electrónico válido.'
      }
    }

    const dominiosPermitidos = [
      '@duoc.cl',
      '@profesor.duoc.cl',
      '@gmail.com'
    ]

    const dominioValido = dominiosPermitidos.some(
      dominio => correoLimpio.endsWith(dominio)
    )

    if (!dominioValido) {
      return {
        valido: false,
        mensaje:
          'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'
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

    if (contrasenaValor.length < 4) {
      return {
        valido: false,
        mensaje: 'La contraseña debe tener al menos 4 caracteres.'
      }
    }

    if (contrasenaValor.length > 10) {
      return {
        valido: false,
        mensaje: 'La contraseña no puede superar los 10 caracteres.'
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

  // BUSCAR CLIENTE REGISTRADO
  function buscarClienteRegistrado(correoBuscado) {
    try {
      const usuariosGuardados = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      )

      if (!Array.isArray(usuariosGuardados)) {
        return null
      }

      return usuariosGuardados.find(
        usuario =>
          usuario.correo?.toLowerCase() ===
          correoBuscado.trim().toLowerCase()
      ) || null

    } catch {
      return null
    }
  }

  // ENVÍO DEL FORMULARIO
  function manejarEnvio(evento) {

    evento.preventDefault()

    setMensajeLogin('')

    const resultadoCorreo = validarCorreo(correo)
    const resultadoContrasena = validarContrasena(contrasena)

    setErrorCorreo(resultadoCorreo.mensaje)
    setErrorContrasena(resultadoContrasena.mensaje)

    setCorreoValidado(true)
    setContrasenaValidada(true)

    if (!resultadoCorreo.valido || !resultadoContrasena.valido) {
      return
    }

    const correoLogin = correo.trim().toLowerCase()
    const contrasenaLogin = contrasena.trim()

    // INGRESO ADMINISTRADOR DE DEMOSTRACIÓN
    if (
      correoLogin === 'admin@duoc.cl' &&
      contrasenaLogin === '1234'
    ) {

      localStorage.removeItem('clienteActivo')

      setTipoMensaje('success')
      setMensajeLogin('Ingreso administrador correcto.')

      // Esta ruta se configurará cuando creemos el panel
      navigate('/admin')

      return
    }


    // BUSCAR AL CLIENTE REGISTRADO
    const clienteRegistrado = buscarClienteRegistrado(correoLogin)

    // COMPROBAR QUE EXISTA LA CUENTA
    if (!clienteRegistrado) {
      setTipoMensaje('danger')
      setMensajeLogin(
        'Este correo no está registrado. Primero debes crear una cuenta.'
      )
      return
    }

    // INGRESO CLIENTE DE DEMOSTRACIÓN
    // Todavía no verificamos la contraseña.
    localStorage.setItem(
      'clienteActivo',
      JSON.stringify({
        nombre: `${clienteRegistrado.nombre} ${clienteRegistrado.apellidos}`,
        correo: clienteRegistrado.correo
      })
    )

    setTipoMensaje('success')
    setMensajeLogin('Ingreso cliente correcto.')

    navigate('/productos')

    setMensajeLogin('Ingreso cliente correcto.')

    // Esta ruta se configurará cuando creemos el catálogo
    navigate('/productos')
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
          className={`form-control ${correoValidado
            ? errorCorreo
              ? 'is-invalid'
              : 'is-valid'
            : ''
            }`}
          placeholder="ejemplo@gmail.com"
          value={correo}
          maxLength={100}
          onChange={(evento) => {
            setCorreo(evento.target.value)
            setCorreoValidado(false)
            setErrorCorreo('')
          }}
          onBlur={validarCampoCorreo}
        />

        {/* MENSAJE DE ERROR DEL CORREO */}
        <div className="invalid-feedback">
          {errorCorreo}
        </div>

        {/* TEXTO DE AYUDA ORIGINAL */}
        <small className="form-text text-muted">
          Puedes utilizar correos @duoc.cl, @profesor.duoc.cl o @gmail.com.
        </small>

      </div>


      {/* CONTRASEÑA */}
      <div className="mb-3">

        <label htmlFor="contrasena" className="form-label">
          Contraseña
        </label>

        <input
          type={mostrarContrasena ? 'text' : 'password'}
          id="contrasena"
          className={`form-control ${contrasenaValidada
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
          }}
          onBlur={validarCampoContrasena}
        />

        {/* MENSAJE DE ERROR DE CONTRASEÑA */}
        <div className="invalid-feedback">
          {errorContrasena}
        </div>

        {/* TEXTO DE AYUDA ORIGINAL */}
        <small className="form-text text-muted">
          La contraseña debe contener entre 4 y 10 caracteres.
        </small>

      </div>


      {/* MOSTRAR / OCULTAR CONTRASEÑA */}
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
        className="btn btn-perfulandia w-100"
      >
        Iniciar sesión
      </button>

    </form>
  )
}
