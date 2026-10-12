
import { useState } from 'react'
import { useNavigate } from 'react-router'

// REGIONES Y COMUNAS DEL PROYECTO ORIGINAL
const regionesComunas = {
  'Región Metropolitana': [
    'Santiago',
    'Providencia',
    'Las Condes',
    'Ñuñoa',
    'Maipú',
    'Puente Alto'
  ],
  Valparaíso: [
    'Valparaíso',
    'Viña del Mar',
    'Quilpué',
    'Villa Alemana',
    'Quillota'
  ],
  Biobío: [
    'Concepción',
    'Talcahuano',
    'Chiguayante',
    'San Pedro de la Paz',
    'Los Ángeles'
  ],
  'La Araucanía': [
    'Temuco',
    'Padre Las Casas',
    'Villarrica',
    'Pucón',
    'Angol'
  ],
  'Los Lagos': [
    'Puerto Montt',
    'Puerto Varas',
    'Osorno',
    'Castro',
    'Ancud'
  ]
}

// FORMATO LOCAL DE FECHAS: AAAA-MM-DD
function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// VALIDAR FECHA DE NACIMIENTO
function validarFechaNacimiento(valor) {
  if (!valor) {
    return 'La fecha de nacimiento es obligatoria.'
  }

  const [anio, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  const hoy = new Date()

  // Verificar que la fecha exista realmente
  if (
    !anio ||
    !mes ||
    !dia ||
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return 'Ingresa una fecha de nacimiento válida.'
  }

  hoy.setHours(0, 0, 0, 0)

  // REGLA 1: NO PERMITIR FECHAS FUTURAS
  if (fecha > hoy) {
    return 'La fecha de nacimiento no puede ser futura.'
  }

  let edad = hoy.getFullYear() - anio

  const mesActual = hoy.getMonth() + 1
  const diaActual = hoy.getDate()

  // Descontar un año si todavía no cumple años
  if (
    mesActual < mes ||
    (mesActual === mes && diaActual < dia)
  ) {
    edad--
  }

  // REGLA 2: NO PERMITIR MENORES DE 18 AÑOS
  if (edad < 18) {
    return 'Debes tener 18 años o más para crear una cuenta.'
  }

  return ''
}

const datosIniciales = {
  nombre: '',
  apellidos: '',
  rut: '',
  fechaNacimiento: '',
  correo: '',
  region: '',
  comuna: '',
  direccion: '',
  password: '',
  confirmarPassword: ''
}

export default function RegistroForm() {
  const [datos, setDatos] = useState(datosIniciales)
  const [errores, setErrores] = useState({})
  const [validados, setValidados] = useState({})
  const [mostrarPasswords, setMostrarPasswords] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const navigate = useNavigate()

  const hoy = new Date()

  const fechaLimite = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
  )

  const fechaMaxima = formatearFecha(fechaLimite)

  // LEER LOS USUARIOS DE DEMOSTRACIÓN
  function obtenerUsuarios() {
    try {
      const guardados = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      )

      return Array.isArray(guardados) ? guardados : []
    } catch {
      return []
    }
  }

  // VALIDAR CADA CAMPO
  function validarCampo(campo, valores = datos) {
    const valor = valores[campo]

    switch (campo) {
      case 'nombre':
        if (!valor.trim()) return 'El nombre es obligatorio.'
        if (valor.trim().length > 50) {
          return 'El nombre no puede superar los 50 caracteres.'
        }
        return ''

      case 'apellidos':
        if (!valor.trim()) return 'Los apellidos son obligatorios.'
        if (valor.trim().length > 100) {
          return 'Los apellidos no pueden superar los 100 caracteres.'
        }
        return ''

      case 'rut': {
        const rut = valor.trim().toUpperCase()

        if (!rut) return 'El RUN es obligatorio.'

        if (rut.length < 7 || rut.length > 9) {
          return 'El RUN debe tener entre 7 y 9 caracteres.'
        }

        if (!/^[0-9]+[0-9K]$/.test(rut)) {
          return 'Ingrese el RUN sin puntos ni guion.'
        }

        const repetido = obtenerUsuarios().some(
          usuario => usuario.rut === rut
        )

        if (repetido) return 'Este RUN ya está registrado.'

        return ''
      }

      case 'fechaNacimiento':
        return validarFechaNacimiento(valor)

      case 'correo': {
        const correo = valor.trim().toLowerCase()

        if (!correo) {
          return 'El correo electrónico es obligatorio.'
        }

        if (correo.length > 100) {
          return 'El correo no puede superar los 100 caracteres.'
        }

        const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formato.test(correo)) {
          return 'Ingresa un correo electrónico válido.'
        }

        const dominios = [
          '@duoc.cl',
          '@profesor.duoc.cl',
          '@gmail.com'
        ]

        if (!dominios.some(dominio => correo.endsWith(dominio))) {
          return 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.'
        }

        return ''
      }

      case 'region':
        return regionesComunas[valor]
          ? ''
          : 'Debes seleccionar una región.'

      case 'comuna':
        return regionesComunas[valores.region]?.includes(valor)
          ? ''
          : 'Debes seleccionar una comuna.'

      case 'direccion':
        if (!valor.trim()) return 'La dirección es obligatoria.'

        if (valor.trim().length > 300) {
          return 'La dirección no puede superar los 300 caracteres.'
        }

        return ''

      case 'password':
        if (!valor) return 'La contraseña es obligatoria.'

        if (valor.length < 4) {
          return 'La contraseña debe tener al menos 4 caracteres.'
        }

        if (valor.length > 10) {
          return 'La contraseña no puede superar los 10 caracteres.'
        }

        return ''

      case 'confirmarPassword':
        if (!valor) return 'Debes confirmar la contraseña.'

        if (valor !== valores.password) {
          return 'Las contraseñas no coinciden.'
        }

        return ''

      default:
        return ''
    }
  }

  // ACTUALIZAR LOS VALORES
  function manejarCambio(evento) {
    const { name, value } = evento.target

    setDatos(anterior => ({
      ...anterior,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {})
    }))

    setErrores(anterior => ({
      ...anterior,
      [name]: '',
      ...(name === 'region' ? { comuna: '' } : {})
    }))

    setValidados(anterior => ({
      ...anterior,
      [name]: false,
      ...(name === 'region' ? { comuna: false } : {})
    }))

    setMensaje('')
  }

  // VALIDAR AL SALIR DEL CAMPO
  function manejarBlur(evento) {
    const campo = evento.target.name
    const error = validarCampo(campo)

    setErrores(anterior => ({
      ...anterior,
      [campo]: error
    }))

    setValidados(anterior => ({
      ...anterior,
      [campo]: true
    }))
  }

  // ESTILOS DE VALIDACIÓN
  function claseCampo(campo, claseBase = 'form-control') {
    if (!validados[campo]) return claseBase

    return `${claseBase} ${
      errores[campo] ? 'is-invalid' : 'is-valid'
    }`
  }

  // ENVIAR EL REGISTRO
  function manejarEnvio(evento) {
    evento.preventDefault()
    setMensaje('')

    const nuevosErrores = {}
    const nuevosValidados = {}

    Object.keys(datos).forEach(campo => {
      nuevosErrores[campo] = validarCampo(campo)
      nuevosValidados[campo] = true
    })

    setErrores(nuevosErrores)
    setValidados(nuevosValidados)

    const hayErrores = Object.values(nuevosErrores).some(
      error => error !== ''
    )

    if (hayErrores) {
      setMensaje('Revisa los campos marcados antes de continuar.')
      return
    }

    // GUARDAR DATOS DE DEMOSTRACIÓN
    // NO guardamos la contraseña.
    const nuevoUsuario = {
      rut: datos.rut.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      apellidos: datos.apellidos.trim(),
      fechaNacimiento: datos.fechaNacimiento,
      correo: datos.correo.trim().toLowerCase(),
      tipoUsuario: 'Cliente',
      region: datos.region,
      comuna: datos.comuna,
      direccion: datos.direccion.trim()
    }

    const usuarios = obtenerUsuarios()

    usuarios.push(nuevoUsuario)

    localStorage.setItem('usuarios', JSON.stringify(usuarios))

    // Por ahora no iniciamos sesión automáticamente.
    setMensaje('Cuenta de demostración creada correctamente.')

    // Volver al login
    navigate('/login', {
      state: { registroExitoso: true }
    })
  }

  // CAMPOS DE TEXTO DEL FORMULARIO
  const camposTexto = [
    {
      name: 'nombre',
      label: 'Nombre',
      placeholder: 'Ingresa tu nombre',
      maxLength: 50,
      autoComplete: 'given-name'
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      placeholder: 'Ingresa tus apellidos',
      maxLength: 100,
      autoComplete: 'family-name'
    },
    {
      name: 'rut',
      label: 'RUT',
      placeholder: '1000005K',
      maxLength: 9
    }
  ]

  return (
    <form onSubmit={manejarEnvio} noValidate>

      {/* NOMBRE, APELLIDOS Y RUT */}
      {camposTexto.map(campo => (
        <div className="mb-3" key={campo.name}>
          <label htmlFor={campo.name} className="form-label">
            {campo.label}
          </label>

          <input
            type="text"
            id={campo.name}
            name={campo.name}
            className={claseCampo(campo.name)}
            placeholder={campo.placeholder}
            maxLength={campo.maxLength}
            autoComplete={campo.autoComplete}
            value={datos[campo.name]}
            onChange={manejarCambio}
            onBlur={manejarBlur}
          />

          {campo.name === 'rut' && (
            <div className="form-text">
              Ingresa el RUT sin puntos ni guion, incluyendo
              el dígito verificador. Ejemplo: 1000005K
            </div>
          )}

          {errores[campo.name] && (
            <div className="text-danger small mt-1">
              {errores[campo.name]}
            </div>
          )}
        </div>
      ))}

      {/* FECHA DE NACIMIENTO */}
      <div className="mb-3">
        <label htmlFor="fechaNacimiento" className="form-label">
          Fecha de nacimiento
        </label>

        <input
          type="date"
          id="fechaNacimiento"
          name="fechaNacimiento"
          className={claseCampo('fechaNacimiento')}
          value={datos.fechaNacimiento}
          max={fechaMaxima}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />

        <div className="form-text">
          Debes tener 18 años o más para crear una cuenta.
        </div>

        {errores.fechaNacimiento && (
          <div className="text-danger small mt-1">
            {errores.fechaNacimiento}
          </div>
        )}
      </div>

      {/* CORREO ELECTRÓNICO */}
      <div className="mb-3">
        <label htmlFor="correo" className="form-label">
          Correo electrónico
        </label>

        <input
          type="email"
          id="correo"
          name="correo"
          className={claseCampo('correo')}
          placeholder="ejemplo@gmail.com"
          maxLength={100}
          autoComplete="email"
          value={datos.correo}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />

        <div className="form-text">
          Correos permitidos: @duoc.cl, @profesor.duoc.cl
          o @gmail.com.
        </div>

        {errores.correo && (
          <div className="text-danger small mt-1">
            {errores.correo}
          </div>
        )}
      </div>

      {/* REGIÓN */}
      <div className="mb-3">
        <label htmlFor="region" className="form-label">
          Región
        </label>

        <select
          id="region"
          name="region"
          className={claseCampo('region', 'form-select')}
          value={datos.region}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        >
          <option value="">Selecciona una región</option>

          {Object.keys(regionesComunas).map(region => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        {errores.region && (
          <div className="text-danger small mt-1">
            {errores.region}
          </div>
        )}
      </div>

      {/* COMUNA */}
      <div className="mb-3">
        <label htmlFor="comuna" className="form-label">
          Comuna
        </label>

        <select
          id="comuna"
          name="comuna"
          className={claseCampo('comuna', 'form-select')}
          value={datos.comuna}
          onChange={manejarCambio}
          onBlur={manejarBlur}
          disabled={!datos.region}
        >
          <option value="">
            {datos.region
              ? 'Selecciona una comuna'
              : 'Primero selecciona una región'}
          </option>

          {(regionesComunas[datos.region] || []).map(comuna => (
            <option key={comuna} value={comuna}>
              {comuna}
            </option>
          ))}
        </select>

        {errores.comuna && (
          <div className="text-danger small mt-1">
            {errores.comuna}
          </div>
        )}
      </div>

      {/* DIRECCIÓN */}
      <div className="mb-3">
        <label htmlFor="direccion" className="form-label">
          Dirección
        </label>

        <input
          type="text"
          id="direccion"
          name="direccion"
          className={claseCampo('direccion')}
          placeholder="Ingresa tu dirección"
          maxLength={300}
          autoComplete="street-address"
          value={datos.direccion}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />

        {errores.direccion && (
          <div className="text-danger small mt-1">
            {errores.direccion}
          </div>
        )}
      </div>

      {/* CONTRASEÑA */}
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>

        <input
          type={mostrarPasswords ? 'text' : 'password'}
          id="password"
          name="password"
          className={claseCampo('password')}
          placeholder="Crea una contraseña"
          autoComplete="new-password"
          value={datos.password}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />

        <div className="form-text">
          Debe contener entre 4 y 10 caracteres.
        </div>

        {errores.password && (
          <div className="text-danger small mt-1">
            {errores.password}
          </div>
        )}
      </div>

      {/* CONFIRMAR CONTRASEÑA */}
      <div className="mb-3">
        <label htmlFor="confirmarPassword" className="form-label">
          Confirmar contraseña
        </label>

        <input
          type={mostrarPasswords ? 'text' : 'password'}
          id="confirmarPassword"
          name="confirmarPassword"
          className={claseCampo('confirmarPassword')}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={datos.confirmarPassword}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />

        {errores.confirmarPassword && (
          <div className="text-danger small mt-1">
            {errores.confirmarPassword}
          </div>
        )}
      </div>

      {/* MOSTRAR CONTRASEÑAS */}
      <div className="form-check mb-4">
        <input
          type="checkbox"
          id="mostrarPasswords"
          className="form-check-input"
          checked={mostrarPasswords}
          onChange={evento =>
            setMostrarPasswords(evento.target.checked)
          }
        />

        <label
          htmlFor="mostrarPasswords"
          className="form-check-label"
        >
          Mostrar contraseñas
        </label>
      </div>

      {/* MENSAJE GENERAL */}
      {mensaje && (
        <div className="alert alert-danger" role="alert">
          {mensaje}
        </div>
      )}

      {/* BOTÓN CREAR CUENTA */}
      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-perfulandia"
        >
          Crear cuenta
        </button>
      </div>

    </form>
  )
}
