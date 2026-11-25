
import { productosApi } from './api'

// 1. LISTAR TODOS LOS PRODUCTOS
// GET http://localhost:8081/api/v1/productos
export async function obtenerProductosApi() {

  const respuesta = await productosApi.get('/productos')

  return respuesta.data
}


// 2. BUSCAR UN PRODUCTO POR ID
// GET http://localhost:8081/api/v1/productos/1
export async function obtenerProductoPorIdApi(id) {

  const respuesta = await productosApi.get(`/productos/${id}`)

  return respuesta.data
}


// 3. CREAR UN PRODUCTO
// POST http://localhost:8081/api/v1/productos
export async function crearProductoApi(datos) {

  const respuesta = await productosApi.post('/productos', datos)

  return respuesta.data
}


// 4. ACTUALIZAR UN PRODUCTO
// PUT http://localhost:8081/api/v1/productos/1
export async function actualizarProductoApi(id, datos) {

  const respuesta = await productosApi.put(
    `/productos/${id}`,
    datos
  )

  return respuesta.data
}


// 5. ELIMINAR UN PRODUCTO
// DELETE http://localhost:8081/api/v1/productos/1
export async function eliminarProductoApi(id) {

  await productosApi.delete(`/productos/${id}`)

  return true
}
