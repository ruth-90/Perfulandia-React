
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { registrarUsuario } from '../services/api.js'

import { regionesComunas, formatearFecha, validarFechaNacimiento } from '../data/usuariosConfig.js'

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
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const navigate = useNavigate()

  const hoy = new Date()

  const fechaLimite = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
  )

  const fechaMaxima = formatearFecha(fechaLimite)

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

        return ''
      }

      case 'fechaNacimiento':
        return validarFechaNacimiento(valor)

      case 'correo': {
        const correo = valor.trim().toLowerCase()

        if (!correo) {
          return 'El correo electrónico es obligatorio.'
        }

        if (correo.length > 150) {
          return 'El correo no puede superar los 150 caracteres.'
        }

        const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formato.test(correo)) {
          return 'Ingresa un correo electrónico válido.'
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

        if (valor.trim().length > 255) {
          return 'La dirección no puede superar los 255 caracteres.'
        }

        return ''

      case 'password':
        if (!valor) return 'La contraseña es obligatoria.'

        if (valor.length < 8) {
          return 'La contraseña debe tener al menos 8 caracteres.'
        }

        if (new TextEncoder().encode(valor).length > 72) {
          return 'La contraseña no puede superar los 72 bytes.'
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
  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (enviando) return
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

    const rut = datos.rut.trim().toUpperCase()
    setEnviando(true)
    try {
      await registrarUsuario({
        rut: rut.slice(0, -1) + '-' + rut.slice(-1),
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        fechaNacimiento: datos.fechaNacimiento,
        correo: datos.correo.trim().toLowerCase(),
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion.trim(),
        password: datos.password
      })
      navigate('/login', { state: { registroExitoso: true } })
    } catch (error) {
      const respuesta = error.response?.data
      if (respuesta?.errores) setErrores(anterior => ({ ...anterior, ...respuesta.errores }))
      setMensaje(respuesta?.mensaje || 'No se pudo crear la cuenta. Vuelve a intentarlo.')
    } finally {
      setEnviando(false)
    }
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
          maxLength={150}
          autoComplete="email"
          value={datos.correo}
          onChange={manejarCambio}
          onBlur={manejarBlur}
        />


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
          maxLength={255}
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
          Usa al menos 8 caracteres y un máximo de 72 bytes.
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
          disabled={enviando}
          className="btn btn-perfulandia"
        >
          Crear cuenta
        </button>
      </div>

    </form>
  )
}
