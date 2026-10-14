
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'

// REGIONES Y COMUNAS
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

// DATOS INICIALES DEL FORMULARIO
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

// OBTENER USUARIOS GUARDADOS EN LOCALSTORAGE
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

// CALCULAR LA EDAD DEL USUARIO
function calcularEdad(fechaNacimiento) {
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number)

  const hoy = new Date()
  let edad = hoy.getFullYear() - anio

  if (
    hoy.getMonth() + 1 < mes ||
    (
      hoy.getMonth() + 1 === mes &&
      hoy.getDate() < dia
    )
  ) {
    edad--
  }

  return edad
}

// FORMATEAR FECHA PARA EL CALENDARIO
function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// COMPONENTE CREAR Y EDITAR USUARIO
export default function AdminUsuarioForm() {

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // FECHA MÁXIMA PERMITIDA: 18 AÑOS CUMPLIDOS
  const hoy = new Date()

  const fechaLimite = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
  )

  const fechaMaxima = formatearFecha(fechaLimite)

  // IDENTIFICAR SI ESTAMOS EDITANDO
  const rutEditar = searchParams.get('rut')
  const esEdicion = Boolean(rutEditar)

  // ESTADO DEL FORMULARIO
  const [datos, setDatos] = useState(() => {

    if (esEdicion) {
      const usuarioEncontrado = obtenerUsuarios().find(
        usuario => usuario.rut === rutEditar
      )

      if (usuarioEncontrado) {
        return {
          ...datosIniciales,
          ...usuarioEncontrado
        }
      }
    }

    return { ...datosIniciales }
  })

  // MENSAJE DE ERROR
  const [mensaje, setMensaje] = useState('')

  // ACTUALIZAR CAMPOS DEL FORMULARIO
  function manejarCambio(evento) {
    const { name, value } = evento.target

    setDatos(anterior => ({
      ...anterior,
      [name]: value,
      ...(name === 'region' ? { comuna: '' } : {})
    }))

    setMensaje('')
  }

  // GUARDAR USUARIO
  function manejarEnvio(evento) {
    evento.preventDefault()

    const rut = datos.rut.trim().toUpperCase()
    const nombre = datos.nombre.trim()
    const apellidos = datos.apellidos.trim()
    const correo = datos.correo.trim().toLowerCase()
    const direccion = datos.direccion.trim()

    // VALIDAR CAMPOS OBLIGATORIOS
    if (
      !rut ||
      !nombre ||
      !apellidos ||
      !datos.fechaNacimiento ||
      !correo ||
      !datos.region ||
      !datos.comuna ||
      !direccion
    ) {
      setMensaje('Debes completar todos los campos.')
      return
    }

    // VALIDAR LONGITUD DEL RUT
    if (rut.length < 7 || rut.length > 9) {
      setMensaje('El RUT debe tener entre 7 y 9 caracteres.')
      return
    }

    // VALIDAR FORMATO DEL RUT
    if (!/^[0-9]+[0-9K]$/.test(rut)) {
      setMensaje('Ingresa el RUT sin puntos ni guion.')
      return
    }

    // VALIDAR NOMBRE Y APELLIDOS
    if (nombre.length > 50 || apellidos.length > 100) {
      setMensaje('Revisa la longitud del nombre y apellidos.')
      return
    }

    // VALIDAR FECHA DE NACIMIENTO
    const [anio, mes, dia] = datos.fechaNacimiento
      .split('-')
      .map(Number)

    const fecha = new Date(anio, mes - 1, dia)
    const hoy = new Date()

    hoy.setHours(0, 0, 0, 0)

    // COMPROBAR QUE LA FECHA EXISTA
    if (
      !anio ||
      !mes ||
      !dia ||
      fecha.getFullYear() !== anio ||
      fecha.getMonth() !== mes - 1 ||
      fecha.getDate() !== dia
    ) {
      setMensaje('Ingresa una fecha de nacimiento válida.')
      return
    }

    // NO PERMITIR FECHAS FUTURAS
    if (fecha > hoy) {
      setMensaje('La fecha de nacimiento no puede ser futura.')
      return
    }

    // NO PERMITIR MENORES DE 18 AÑOS
    if (calcularEdad(datos.fechaNacimiento) < 18) {
      setMensaje('El usuario debe tener 18 años o más.')
      return
    }

    // VALIDAR FORMATO DEL CORREO
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !formatoCorreo.test(correo) ||
      correo.length > 100
    ) {
      setMensaje('Ingresa un correo electrónico válido.')
      return
    }

    // DOMINIOS PERMITIDOS
    const dominiosPermitidos = [
      '@duoc.cl',
      '@profesor.duoc.cl',
      '@gmail.com'
    ]

    if (!dominiosPermitidos.some(
      dominio => correo.endsWith(dominio)
    )) {
      setMensaje('El dominio del correo no está permitido.')
      return
    }

    // VALIDAR TIPO DE USUARIO
    if (
      datos.tipoUsuario !== 'Administrador' &&
      datos.tipoUsuario !== 'Cliente'
    ) {
      setMensaje('Selecciona un tipo de usuario válido.')
      return
    }

    // VALIDAR REGIÓN Y COMUNA
    if (
      !regionesComunas[datos.region]?.includes(datos.comuna)
    ) {
      setMensaje('Selecciona una región y comuna válidas.')
      return
    }

    // VALIDAR DIRECCIÓN
    if (direccion.length > 300) {
      setMensaje('La dirección no puede superar los 300 caracteres.')
      return
    }

    // OBTENER USUARIOS EXISTENTES
    const usuarios = obtenerUsuarios()

    // EVITAR RUT DUPLICADO
    const rutRepetido = usuarios.some(
      usuario =>
        usuario.rut === rut &&
        usuario.rut !== rutEditar
    )

    if (rutRepetido) {
      setMensaje('Este RUT ya está registrado.')
      return
    }

    // EVITAR CORREO DUPLICADO
    const correoRepetido = usuarios.some(
      usuario =>
        usuario.correo?.toLowerCase() === correo &&
        usuario.rut !== rutEditar
    )

    if (correoRepetido) {
      setMensaje('Este correo ya está registrado.')
      return
    }

    // DATOS DEL USUARIO
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

      // COMPROBAR QUE EXISTA EL USUARIO
      const usuarioExistente = usuarios.find(
        usuario => usuario.rut === rutEditar
      )

      if (!usuarioExistente) {
        setMensaje('No se encontró el usuario.')
        return
      }

      // ACTUALIZAR USUARIO
      const usuariosActualizados = usuarios.map(
        usuario =>
          usuario.rut === rutEditar
            ? { ...usuario, ...usuarioActualizado }
            : usuario
      )

      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuariosActualizados)
      )

    } else {

      // CREAR USUARIO
      usuarios.push(usuarioActualizado)

      localStorage.setItem(
        'usuarios',
        JSON.stringify(usuarios)
      )
    }

    // REGRESAR A LA TABLA DE USUARIOS
    navigate('/admin/usuarios')
  }

  return (
    <div className="admin-body">
      <div className="admin-layout">

        {/* MENÚ LATERAL */}
        <AdminSidebar />

        {/* CONTENIDO PRINCIPAL */}
        <main className="admin-main">

          {/* ENCABEZADO */}
          <section className="admin-top mb-4">

            <div>
              <p className="text-secondary mb-1">
                Administración
              </p>

              <h1 className="fw-bold mb-1">
                {esEdicion ? 'Editar usuario' : 'Crear usuario'}
              </h1>

              <p className="text-secondary mb-0">
                {esEdicion
                  ? 'Modifica los datos del usuario seleccionado.'
                  : 'Registra un nuevo usuario en Perfulandia.'}
              </p>
            </div>

            {/* IDENTIDAD DEL ADMINISTRADOR */}
            <div className="admin-identidad">
              <div className="admin-avatar">
                <i className="bi bi-person-gear"></i>
              </div>

              <div>
                <p className="mb-0 fw-semibold">
                  Administrador
                </p>

                <small className="text-secondary">
                  Sesión administrativa
                </small>
              </div>
            </div>

          </section>

          {/* FORMULARIO */}
          <section className="admin-panel p-4">

            <h2 className="h5 fw-bold mb-4">
              Datos del usuario
            </h2>

            {/* MENSAJE DE ERROR */}
            {mensaje && (
              <div className="alert alert-danger" role="alert">
                {mensaje}
              </div>
            )}

            <form onSubmit={manejarEnvio} noValidate>

              <div className="row g-3">

                {/* RUT */}
                <div className="col-md-6">
                  <label htmlFor="rut" className="form-label">
                    RUT
                  </label>

                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    className="form-control"
                    placeholder="1000005K"
                    value={datos.rut}
                    onChange={manejarCambio}
                    maxLength={9}
                    required
                  />
                </div>

                {/* TIPO DE USUARIO */}
                <div className="col-md-6">
                  <label htmlFor="tipoUsuario" className="form-label">
                    Tipo de usuario
                  </label>

                  <select
                    id="tipoUsuario"
                    name="tipoUsuario"
                    className="form-select"
                    value={datos.tipoUsuario}
                    onChange={manejarCambio}
                  >
                    <option value="Cliente">
                      Cliente
                    </option>

                    <option value="Administrador">
                      Administrador
                    </option>
                  </select>
                </div>

                {/* NOMBRE */}
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">
                    Nombre
                  </label>

                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="form-control"
                    value={datos.nombre}
                    onChange={manejarCambio}
                    maxLength={50}
                    required
                  />
                </div>

                {/* APELLIDOS */}
                <div className="col-md-6">
                  <label htmlFor="apellidos" className="form-label">
                    Apellidos
                  </label>

                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    className="form-control"
                    value={datos.apellidos}
                    onChange={manejarCambio}
                    maxLength={100}
                    required
                  />
                </div>

                {/* FECHA DE NACIMIENTO */}
                <div className="col-md-6">
                  <label
                    htmlFor="fechaNacimiento"
                    className="form-label"
                  >
                    Fecha de nacimiento
                  </label>

                  <input
                    type="date"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    className="form-control"
                    value={datos.fechaNacimiento}
                    max={fechaMaxima}
                    onChange={manejarCambio}
                    required
                  />

                  <div className="form-text">
                    El usuario debe tener 18 años o más.
                  </div>
                </div>

                {/* CORREO ELECTRÓNICO */}
                <div className="col-md-6">
                  <label htmlFor="correo" className="form-label">
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    className="form-control"
                    value={datos.correo}
                    onChange={manejarCambio}
                    maxLength={100}
                    required
                  />
                </div>

                {/* REGIÓN */}
                <div className="col-md-6">
                  <label htmlFor="region" className="form-label">
                    Región
                  </label>

                  <select
                    id="region"
                    name="region"
                    className="form-select"
                    value={datos.region}
                    onChange={manejarCambio}
                  >
                    <option value="">
                      Selecciona una región
                    </option>

                    {Object.keys(regionesComunas).map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* COMUNA */}
                <div className="col-md-6">
                  <label htmlFor="comuna" className="form-label">
                    Comuna
                  </label>

                  <select
                    id="comuna"
                    name="comuna"
                    className="form-select"
                    value={datos.comuna}
                    onChange={manejarCambio}
                    disabled={!datos.region}
                  >
                    <option value="">
                      Selecciona una comuna
                    </option>

                    {(regionesComunas[datos.region] || []).map(
                      comuna => (
                        <option key={comuna} value={comuna}>
                          {comuna}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* DIRECCIÓN */}
                <div className="col-12">
                  <label htmlFor="direccion" className="form-label">
                    Dirección
                  </label>

                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    className="form-control"
                    value={datos.direccion}
                    onChange={manejarCambio}
                    maxLength={300}
                    required
                  />
                </div>

              </div>

              {/* BOTONES */}
              <div className="d-flex gap-2 mt-4">

                <button
                  type="submit"
                  className="btn btn-perfulandia"
                >
                  <i className="bi bi-check-circle me-2"></i>

                  {esEdicion
                    ? 'Guardar cambios'
                    : 'Crear usuario'}
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

          {/* PIE DE PÁGINA */}
          <footer className="admin-footer text-center mt-4">
            <small>
              © 2026 Perfulandia - Panel Administrativo
            </small>
          </footer>

        </main>
      </div>
    </div>
  )
}
