
import { useState } from 'react'
import { Link } from 'react-router'
import AdminSidebar from '../../components/AdminSidebar.jsx'

// ADMINISTRACIÓN DE USUARIOS
export default function AdminUsuarios() {

  // ESTADO DE LOS USUARIOS REGISTRADOS
  const [usuarios, setUsuarios] = useState(() => {
    try {
      const guardados = JSON.parse(
        localStorage.getItem('usuarios') || '[]'
      )

      return Array.isArray(guardados) ? guardados : []
    } catch {
      return []
    }
  })

  // ESTADO DE LA BÚSQUEDA
  const [busqueda, setBusqueda] = useState('')

  // MENSAJE DE CONFIRMACIÓN
  const [mensaje, setMensaje] = useState('')

  // FILTRAR USUARIOS POR RUT
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.rut.toUpperCase().includes(busqueda.trim().toUpperCase())
  )

  // ELIMINAR USUARIO
  function eliminarUsuario(rut, nombre) {

    const confirmar = window.confirm(
      `¿Estás segura de eliminar al usuario ${nombre}?`
    )

    if (!confirmar) {
      return
    }

    // EXCLUIR AL USUARIO SELECCIONADO
    const usuariosActualizados = usuarios.filter(
      usuario => usuario.rut !== rut
    )

    // ACTUALIZAR LA LISTA
    setUsuarios(usuariosActualizados)

    // GUARDAR CAMBIOS EN LOCALSTORAGE
    localStorage.setItem(
      'usuarios',
      JSON.stringify(usuariosActualizados)
    )

    setMensaje(`Usuario ${nombre} eliminado correctamente.`)
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
                Usuarios
              </h1>

              <p className="text-secondary mb-0">
                Consulta y administra los usuarios de Perfulandia.
              </p>
            </div>

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

          {/* MENSAJE DE CONFIRMACIÓN */}
          {mensaje && (
            <div className="alert alert-success" role="alert">
              {mensaje}
            </div>
          )}

          {/* LISTADO DE USUARIOS */}
          <section className="admin-panel p-4">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

              <div>
                <h2 className="h5 fw-bold mb-1">
                  Gestión de usuarios
                </h2>

                <p className="text-secondary mb-0">
                  Usuarios registrados: {usuarios.length}
                </p>
              </div>

              {/* CREAR USUARIO */}
              <Link
                to="/admin/usuario-form"
                className="btn btn-perfulandia"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Crear usuario
              </Link>
            </div>

            {/* BUSCAR USUARIO POR RUT */}
            <div className="row mb-4">
              <div className="col-md-6">

                <label htmlFor="buscarRut" className="form-label">
                  Buscar usuario por RUT
                </label>

                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search"></i>
                  </span>

                  <input
                    type="text"
                    id="buscarRut"
                    className="form-control"
                    placeholder="Ingresa el RUT sin puntos ni guion"
                    value={busqueda}
                    onChange={(evento) => setBusqueda(evento.target.value)}
                    maxLength={9}
                  />

                  {busqueda && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setBusqueda('')}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA RESPONSIVA */}
            <div className="table-responsive">
              <table className="table align-middle admin-table">

                <thead>
                  <tr>
                    <th>RUT</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Correo electrónico</th>
                    <th>Tipo de usuario</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-4 text-secondary"
                      >
                        {usuarios.length === 0
                          ? 'No hay usuarios registrados.'
                          : 'No se encontraron usuarios con ese RUT.'}
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map(usuario => (
                      <tr key={usuario.rut}>

                        <td>{usuario.rut}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.apellidos}</td>
                        <td>{usuario.correo}</td>
                        <td>{usuario.tipoUsuario}</td>

                        {/* ACCIONES */}
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">

                            {/* EDITAR USUARIO */}
                            <Link
                              to={`/admin/usuario-form?rut=${encodeURIComponent(usuario.rut)}`}
                              className="btn btn-sm btn-outline-perfulandia"
                              title="Editar usuario"
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Editar
                            </Link>

                            {/* ELIMINAR USUARIO */}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Eliminar usuario"
                              onClick={() =>
                                eliminarUsuario(usuario.rut, usuario.nombre)
                              }
                            >
                              <i className="bi bi-trash"></i>
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

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
