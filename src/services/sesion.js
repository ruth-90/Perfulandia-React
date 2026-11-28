const claveSesion = 'perfulandiaSesion'
export const eventoSesion = 'perfulandia:sesion'

export function leerSesion() {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(claveSesion))
    return sesion?.token ? sesion : null
  } catch {
    return null
  }
}

export function guardarSesion(sesion) {
  if (sesion) sessionStorage.setItem(claveSesion, JSON.stringify(sesion))
  else sessionStorage.removeItem(claveSesion)

  sessionStorage.removeItem('adminActivo')
  localStorage.removeItem('clienteActivo')
  window.dispatchEvent(new Event(eventoSesion))
}
