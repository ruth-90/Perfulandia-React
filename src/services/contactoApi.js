import { productosApi as contactoApi } from './api.js'

export { contactoApi }

export async function enviarMensajeContacto(datos) {

  const respuesta = await contactoApi.post(
    '/contactos',
    {
      nombre: datos.nombre.trim(),

      // EL CORREO ES OPCIONAL
      correo: datos.correo.trim()
        ? datos.correo.trim().toLowerCase()
        : null,

      comentario: datos.comentario.trim()
    }
  )

  return respuesta.data
}
