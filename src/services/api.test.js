import { afterEach, expect, test, vi } from 'vitest'
import { crearPedido, iniciarSesion, productosApi, registrarUsuario } from './api.js'
import { guardarSesion } from './sesion.js'

const adapterOriginal = productosApi.defaults.adapter

afterEach(() => {
  productosApi.defaults.adapter = adapterOriginal
  guardarSesion(null)
})

test('usa el Gateway y adjunta el Bearer a los pedidos', async () => {
  const adapter = vi.fn(async config => ({ data: {}, status: 200, config }))
  productosApi.defaults.adapter = adapter
  guardarSesion({ rol: 'CLIENTE', token: 'jwt-de-prueba' })

  await iniciarSesion({ correo: 'cliente@example.test', password: 'una-contraseña' })
  await registrarUsuario({ correo: 'cliente@example.test' })
  await crearPedido({ items: [{ productoId: 1, cantidad: 2 }] })

  const [login, registro, pedido] = adapter.mock.calls.map(([config]) => config)
  expect(login.baseURL).toBe(import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1')
  expect(login.url).toBe('/auth/login')
  expect(login.headers.get('Authorization')).toBeUndefined()
  expect(registro.url).toBe('/usuarios/registro')
  expect(registro.headers.get('Authorization')).toBeUndefined()
  expect(pedido.url).toBe('/pedidos')
  expect(pedido.headers.get('Authorization')).toBe('Bearer jwt-de-prueba')
  expect(JSON.parse(pedido.data)).toEqual({ items: [{ productoId: 1, cantidad: 2 }] })
})
