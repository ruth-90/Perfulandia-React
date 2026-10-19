import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  obtenerProductos, obtenerProductoPorId, crearProducto,
  actualizarProducto, eliminarProducto, obtenerEstadisticas, formatearPrecio
} from './productosStorage.js'

describe('productosStorage - CRUD local', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  test('inicializa el catálogo solo una vez en localStorage', () => {
    const iniciales = obtenerProductos()
    expect(iniciales.length).toBeGreaterThan(0)
    expect(JSON.parse(localStorage.getItem('productosAdmin'))).toHaveLength(iniciales.length)
    expect(obtenerProductos()).toEqual(iniciales)
  })

  test('encuentra productos por ID numérico o string, y retorna null si falta', () => {
    const id = obtenerProductos()[0].id
    expect(obtenerProductoPorId(String(id)).id).toBe(id)
    expect(obtenerProductoPorId('no-existe')).toBeNull()
  })

  test('crea un producto normalizando números y textos', () => {
    const creado = crearProducto({ nombre: ' Nuevo ', categoria: 'Mujer', precio: '10000', stock: '3', imagen: ' /img/a.webp ', descripcion: ' Aroma ' })
    expect(creado).toMatchObject({ nombre: 'Nuevo', categoria: 'Mujer', precio: 10000, stock: 3, imagen: '/img/a.webp', descripcion: 'Aroma' })
    expect(obtenerProductoPorId(creado.id)).toEqual(creado)
  })

  test('actualiza producto y devuelve null si el ID no existe', () => {
    const id = obtenerProductos()[0].id
    const editado = actualizarProducto(id, { nombre: ' Editado ', categoria: 'Unisex', precio: '25000', stock: '8', imagen: ' /img/b.webp ', descripcion: ' Descripción ' })
    expect(editado).toMatchObject({ nombre: 'Editado', precio: 25000, stock: 8 })
    expect(obtenerProductoPorId(id).nombre).toBe('Editado')
    expect(actualizarProducto(-9000, { nombre: '', imagen: '', descripcion: '' })).toBeNull()
  })

  test('elimina producto del almacenamiento', () => {
    const id = obtenerProductos()[0].id
    expect(eliminarProducto(id)).toBe(true)
    expect(obtenerProductoPorId(id)).toBeNull()
  })

  test('calcula estadísticas con productos sin stock', () => {
    localStorage.setItem('productosAdmin', JSON.stringify([
      { id: 1, stock: 3 }, { id: 2, stock: 0 }, { id: 3, stock: 5 }
    ]))
    expect(obtenerEstadisticas()).toEqual({ totalProductos: 3, stockTotal: 8, sinStock: 1 })
  })

  test('formatea CLP con separadores chilenos', () => {
    expect(formatearPrecio(40990)).toBe('$40.990')
    expect(formatearPrecio(undefined)).toBe('$0')
  })

  test('recupera catálogo base cuando hay JSON corrupto', () => {
    localStorage.setItem('productosAdmin', '{no-json')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(obtenerProductos().length).toBeGreaterThan(0)
    expect(consoleError).toHaveBeenCalled()
  })
})
