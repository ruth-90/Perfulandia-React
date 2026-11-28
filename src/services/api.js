import axios from 'axios'
import { leerSesion } from './sesion.js'

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8080/api/v1')
const api = axios.create({ baseURL, timeout: 10000 })

api.interceptors.request.use(config => {
  const token = leerSesion()?.token
  if (token && config.url !== '/auth/login' && config.url !== '/usuarios/registro') {
    config.headers.set('Authorization', 'Bearer ' + token)
  }
  return config
})

export const productosApi = api

export async function iniciarSesion(datos) {
  return (await api.post('/auth/login', datos)).data
}

export async function registrarUsuario(datos) {
  return (await api.post('/usuarios/registro', datos)).data
}

export async function crearPedido(datos) {
  return (await api.post('/pedidos', datos)).data
}
