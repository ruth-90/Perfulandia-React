export function obtenerUsuarios() {
  const guardados = localStorage.getItem('usuarios')
  if (!guardados) return []
  const usuarios = JSON.parse(guardados)
  if (!Array.isArray(usuarios)) throw new Error('El formato de los usuarios guardados no es válido.')
  return usuarios
}

export function guardarUsuario(datos, rutOriginal = null) {
  const usuarios = obtenerUsuarios()
  if (usuarios.some(usuario => usuario.rut !== rutOriginal && usuario.rut?.toUpperCase() === datos.rut.toUpperCase())) {
    throw new Error('Este RUN ya está registrado.')
  }
  if (rutOriginal !== null) {
    const indice = usuarios.findIndex(usuario => usuario.rut === rutOriginal)
    if (indice === -1) throw new Error('El usuario que intentas editar ya no existe.')
    usuarios[indice] = { ...usuarios[indice], ...datos }
  } else {
    usuarios.push(datos)
  }
  localStorage.setItem('usuarios', JSON.stringify(usuarios))
}

export function eliminarUsuario(rut) {
  localStorage.setItem('usuarios', JSON.stringify(obtenerUsuarios().filter(usuario => usuario.rut !== rut)))
}
