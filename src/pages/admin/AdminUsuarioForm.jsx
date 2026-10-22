import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'

// REGIONES Y COMUNAS
const regionesComunas = {
  'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'Puente Alto'],
  Valparaíso: ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Quillota'],
  Biobío: ['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Los Ángeles'],
  'La Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol'],
  'Los Lagos': ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud']
}

const datosIniciales = {
  rut: '',
  nombre: '',
  apellidos: '',
  fechaNacimiento: '',
  correo: '',
  tipoUsuario: 'Cliente',
  region: '',
  comuna: '',
  direccion: ''
}

function obtenerUsuarios() {
  try {
    const guardados = JSON.parse(localStorage.getItem('usuarios') || '[]')
    return Array.isArray(guardados) ? guardados : []
  } catch {
    return []
  }
}

function calcularEdad(fechaNacimiento) {
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number)
  const hoy = new Date()
  let edad = hoy.getFullYear() - anio

  if (
    hoy.getMonth() + 1 < mes ||
    (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)
  ) {
    edad--
  }

  return edad
}

function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export default function AdminUsuarioForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const hoy = new Date()
  const fechaLimite = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
  )
  const fechaMaxima = formatearFecha(fechaLimite)

  const rutEditar = searchParams.get('rut')
  const esEdicion = Boolean(rutEditar)

  const [datos, setDatos] = useState(() => {
    if (esEdicion) {
      const usuarioEncontrado = obtenerUsuarios().find(
        usuario => usuario.rut === rutEditar
      )

      if (usuarioEncontrado) {
        return { ...datosIniciales, ...usuarioEncontrado }
      }
    }

    return { ...datosIniciales }
  })

  const [mensaje, setMensaje] = useState('')
  const [errores, setErrores] = useState({})

  function manejarCambio(evento) {
    const { name, value } = evento.target

    setDatos(anterior => ({
      ...anterior,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {})
    }))

    // Quitar el borde rojo del campo mientras se corrige.
    setErrores(anteriores => {
      const nuevos = { ...anteriores }
      delete nuevos[name]
      if (name === 'region') delete nuevos.comuna
      return nuevos
    })

    setMensaje('')
  }

  function manejarEnvio(evento) {
    evento.preventDefault()

    const rut = datos.rut.trim().toUpperCase()
    const nombre = datos.nombre.trim()
    const apellidos = datos.apellidos.trim()
    const correo = datos.correo.trim().toLowerCase()
    const direccion = datos.direccion.trim()

    // Mostrar todos los campos obligatorios que están vacíos.
    const erroresObligatorios = {}
    const camposObligatorios = {
      rut: 'Debes ingresar el RUT.',
      nombre: 'Debes ingresar el nombre.',
      apellidos: 'Debes ingresar los apellidos.',
      fechaNacimiento: 'Debes ingresar la fecha de nacimiento.',
      correo: 'Debes ingresar un correo electrónico.',
      region: 'Debes seleccionar una región.',
      comuna: 'Debes seleccionar una comuna.',
      direccion: 'Debes ingresar la dirección.'
    }

    Object.entries(camposObligatorios).forEach(([campo, texto]) => {
      if (!String(datos[campo] ?? '').trim()) {
        erroresObligatorios[campo] = texto
      }
    })

    if (Object.keys(erroresObligatorios).length > 0) {
      setErrores(erroresObligatorios)
      setMensaje('Debes completar todos los campos.')
      return
    }

    // Mantener los mismos mensajes y validaciones que tenía el formulario.
    function mostrarError(campo, texto) {
      setErrores({ [campo]: texto })
      setMensaje(texto)
    }

    if (rut.length < 7 || rut.length > 9) {
      mostrarError('rut', 'El RUT debe tener entre 7 y 9 caracteres.')
      return
    }

    if (!/^[0-9]+[0-9K]$/.test(rut)) {
      mostrarError('rut', 'Ingresa el RUT sin puntos ni guion.')
      return
    }

    if (nombre.length > 50 || apellidos.length > 100) {
      const campo = nombre.length > 50 ? 'nombre' : 'apellidos'
      mostrarError(campo, 'Revisa la longitud del nombre y apellidos.')
      return
    }

    const [anio, mes, dia] = datos.fechaNacimiento.split('-').map(Number)
    const fecha = new Date(anio, mes - 1, dia)
    const hoyValidacion = new Date()
    hoyValidacion.setHours(0, 0, 0, 0)

    if (
      !anio || !mes || !dia ||
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      mostrarError('fechaNacimiento', 'Ingresa una fecha de nacimiento válida.')
      return
    }

    if (fecha > hoyValidacion) {
      mostrarError('fechaNacimiento', 'La fecha de nacimiento no puede ser futura.')
      return
    }

    if (calcularEdad(datos.fechaNacimiento) < 18) {
      mostrarError('fechaNacimiento', 'El usuario debe tener 18 años o más.')
      return
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formatoCorreo.test(correo) || correo.length > 100) {
      mostrarError('correo', 'Ingresa un correo electrónico válido.')
      return
    }

    const dominiosPermitidos = [
      '@duoc.cl',
      '@profesor.duoc.cl',
      '@gmail.com'
    ]

    if (!dominiosPermitidos.some(dominio => correo.endsWith(dominio))) {
      mostrarError('correo', 'El dominio del correo no está permitido.')
      return
    }

    if (datos.tipoUsuario !== 'Administrador' && datos.tipoUsuario !== 'Cliente') {
      mostrarError('tipoUsuario', 'Selecciona un tipo de usuario válido.')
      return
    }

    if (!regionesComunas[datos.region]?.includes(datos.comuna)) {
      mostrarError('comuna', 'Selecciona una región y comuna válidas.')
      return
    }

    if (direccion.length > 300) {
      mostrarError('direccion', 'La dirección no puede superar los 300 caracteres.')
      return
    }

    const usuarios = obtenerUsuarios()

    const rutRepetido = usuarios.some(
      usuario => usuario.rut === rut && usuario.rut !== rutEditar
    )

    if (rutRepetido) {
      mostrarError('rut', 'Este RUT ya está registrado.')
      return
    }

    const correoRepetido = usuarios.some(
      usuario => usuario.correo?.toLowerCase() === correo && usuario.rut !== rutEditar
    )

    if (correoRepetido) {
      mostrarError('correo', 'Este correo ya está registrado.')
      return
    }

    const usuarioActualizado = {
      rut,
      nombre,
      apellidos,
      fechaNacimiento: datos.fechaNacimiento,
      correo,
      tipoUsuario: datos.tipoUsuario,
      region: datos.region,
      comuna: datos.comuna,
      direccion
    }

    if (esEdicion) {
      const usuarioExistente = usuarios.find(usuario => usuario.rut === rutEditar)

      if (!usuarioExistente) {
        setMensaje('No se encontró el usuario.')
        setErrores({})
        return
      }

      const usuariosActualizados = usuarios.map(usuario =>
        usuario.rut === rutEditar
          ? { ...usuario, ...usuarioActualizado }
          : usuario
      )

      localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados))
    } else {
      usuarios.push(usuarioActualizado)
      localStorage.setItem('usuarios', JSON.stringify(usuarios))
    }

    setErrores({})
    navigate('/admin/usuarios')
  }

  // Clases Bootstrap para identificar los campos incorrectos.
  function claseCampo(nombre, tipo = 'input') {
    const claseBase = tipo === 'select' ? 'form-select' : 'form-control'
    return `${claseBase}${errores[nombre] ? ' is-invalid' : ''}`
  }

  function mensajeCampo(nombre) {
    return errores[nombre]
      ? <div className="invalid-feedback d-block">{errores[nombre]}</div>
      : null
  }

  return (
    <div className="admin-body">
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main">
          <section className="admin-top mb-4">
            <div>
              <p className="text-secondary mb-1">Administración</p>
              <h1 className="fw-bold mb-1">
                {esEdicion ? 'Editar usuario' : 'Crear usuario'}
              </h1>
              <p className="text-secondary mb-0">
                {esEdicion
                  ? 'Modifica los datos del usuario seleccionado.'
                  : 'Registra un nuevo usuario en Perfulandia.'}
              </p>
            </div>

            <div className="admin-identidad">
              <div className="admin-avatar">
                <i className="bi bi-person-gear"></i>
              </div>
              <div>
                <p className="mb-0 fw-semibold">Administrador</p>
                <small className="text-secondary">Sesión administrativa</small>
              </div>
            </div>
          </section>

          <section className="admin-panel p-4">
            <h2 className="h5 fw-bold mb-4">Datos del usuario</h2>

            {mensaje && (
              <div className="alert alert-danger" role="alert">
                {mensaje}
              </div>
            )}

            <form onSubmit={manejarEnvio} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="rut" className="form-label">RUT</label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    className={claseCampo('rut')}
                    placeholder="1000005K"
                    value={datos.rut}
                    onChange={manejarCambio}
                    maxLength={9}
                    aria-invalid={Boolean(errores.rut)}
                    required
                  />
                  {mensajeCampo('rut')}
                </div>

                <div className="col-md-6">
                  <label htmlFor="tipoUsuario" className="form-label">Tipo de usuario</label>
                  <select
                    id="tipoUsuario"
                    name="tipoUsuario"
                    className={claseCampo('tipoUsuario', 'select')}
                    value={datos.tipoUsuario}
                    onChange={manejarCambio}
                    aria-invalid={Boolean(errores.tipoUsuario)}
                  >
                    <option value="Cliente">Cliente</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                  {mensajeCampo('tipoUsuario')}
                </div>

                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className={claseCampo('nombre')}
                    value={datos.nombre}
                    onChange={manejarCambio}
                    maxLength={50}
                    aria-invalid={Boolean(errores.nombre)}
                    required
                  />
                  {mensajeCampo('nombre')}
                </div>

                <div className="col-md-6">
                  <label htmlFor="apellidos" className="form-label">Apellidos</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    className={claseCampo('apellidos')}
                    value={datos.apellidos}
                    onChange={manejarCambio}
                    maxLength={100}
                    aria-invalid={Boolean(errores.apellidos)}
                    required
                  />
                  {mensajeCampo('apellidos')}
                </div>

                <div className="col-md-6">
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
                    aria-invalid={Boolean(errores.fechaNacimiento)}
                    required
                  />
                  {mensajeCampo('fechaNacimiento')}
                  <div className="form-text">El usuario debe tener 18 años o más.</div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="correo" className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    className={claseCampo('correo')}
                    value={datos.correo}
                    onChange={manejarCambio}
                    maxLength={100}
                    aria-invalid={Boolean(errores.correo)}
                    required
                  />
                  {mensajeCampo('correo')}
                </div>

                <div className="col-md-6">
                  <label htmlFor="region" className="form-label">Región</label>
                  <select
                    id="region"
                    name="region"
                    className={claseCampo('region', 'select')}
                    value={datos.region}
                    onChange={manejarCambio}
                    aria-invalid={Boolean(errores.region)}
                  >
                    <option value="">Selecciona una región</option>
                    {Object.keys(regionesComunas).map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                  {mensajeCampo('region')}
                </div>

                <div className="col-md-6">
                  <label htmlFor="comuna" className="form-label">Comuna</label>
                  <select
                    id="comuna"
                    name="comuna"
                    className={claseCampo('comuna', 'select')}
                    value={datos.comuna}
                    onChange={manejarCambio}
                    disabled={!datos.region}
                    aria-invalid={Boolean(errores.comuna)}
                  >
                    <option value="">Selecciona una comuna</option>
                    {(regionesComunas[datos.region] || []).map(comuna => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                  {mensajeCampo('comuna')}
                </div>

                <div className="col-12">
                  <label htmlFor="direccion" className="form-label">Dirección</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    className={claseCampo('direccion')}
                    value={datos.direccion}
                    onChange={manejarCambio}
                    maxLength={300}
                    aria-invalid={Boolean(errores.direccion)}
                    required
                  />
                  {mensajeCampo('direccion')}
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-perfulandia">
                  <i className="bi bi-check-circle me-2"></i>
                  {esEdicion ? 'Guardar cambios' : 'Crear usuario'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>

          <footer className="admin-footer text-center mt-4">
            <small>© 2026 Perfulandia - Panel Administrativo</small>
          </footer>
        </main>
      </div>
    </div>
  )
}
