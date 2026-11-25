
import axios from 'axios'

// =============================================
// PERFULANDIA - MICROSERVICIO DE CONTACTO
// CONEXIÓN REACT + SPRING BOOT + H2
// PUERTO 8084
// =============================================

// CONFIGURACIÓN DE AXIOS PARA CONTACTO
export const contactoApi = axios.create({

  baseURL: 'http://localhost:8084/api/v1',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json'
  }

})


// =============================================
// ENVIAR UN MENSAJE DE CONTACTO
// POST /api/v1/contactos
// =============================================

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
