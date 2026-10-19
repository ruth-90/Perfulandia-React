import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AdminDashboard from './AdminDashboard.jsx'
import { obtenerEstadisticas, obtenerProductos } from '../../services/productosStorage.js'

vi.mock('../../services/productosStorage.js', () => ({
  obtenerEstadisticas: vi.fn(), obtenerProductos: vi.fn(), formatearPrecio: (precio) => `$${precio}`
}))

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.mocked(obtenerEstadisticas).mockReturnValue({ totalProductos: 2, stockTotal: 4, sinStock: 1 })
    vi.mocked(obtenerProductos).mockReturnValue([
      { id: 1, nombre: 'Brisa', categoria: 'Mujer', stock: 4, precio: 10000, descripcion: 'Floral', imagen: '/img/a.webp' },
      { id: 2, nombre: 'Agotado', categoria: 'Unisex', stock: 0, precio: 25000, descripcion: 'Fresco', imagen: '/img/b.webp' }
    ])
  })
  test('muestra estadísticas, productos y acciones administrativas', () => {
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Productos registrados')).toBeInTheDocument()
    expect(screen.getByText('Stock total en bodega')).toBeInTheDocument()
    expect(screen.getByText('Brisa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear producto' })).toHaveAttribute('href', '/admin/producto-form')
  })
  test('no muestra más de cinco productos en la tabla reciente', () => {
    const lista = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, nombre: `Prueba ${i}`, categoria: 'Mujer', precio: 1000, stock: 1, descripcion: '', imagen: '/img/a.webp' }))
    vi.mocked(obtenerProductos).mockReturnValue(lista)
    render(<MemoryRouter><AdminDashboard /></MemoryRouter>)
    expect(screen.getAllByRole('row')).toHaveLength(6) // Encabezado + 5 registros
  })
})
