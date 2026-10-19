import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AdminProductos from './AdminProductos.jsx'
import { obtenerProductos, eliminarProducto } from '../../services/productosStorage.js'

vi.mock('../../services/productosStorage.js', () => ({
  obtenerProductos: vi.fn(), eliminarProducto: vi.fn(),
  obtenerEstadisticas: () => ({ totalProductos: 2, stockTotal: 3, sinStock: 1 }),
  formatearPrecio: (p) => `$${p}`
}))
const datos = [
  { id: 1, nombre: 'Brisa', categoria: 'Mujer', precio: 25000, stock: 3, imagen: '/img/a.webp', descripcion: 'Floral' },
  { id: 2, nombre: 'Bosque', categoria: 'Hombre', precio: 20000, stock: 0, imagen: '/img/b.webp', descripcion: 'Intenso' }
]
const mostrar = () => render(<MemoryRouter><AdminProductos /></MemoryRouter>)

describe('AdminProductos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(obtenerProductos).mockReturnValue(datos)
  })
  afterEach(() => vi.restoreAllMocks())

  test('muestra el inventario con estado disponible y sin stock', () => {
    mostrar()
    expect(screen.getByRole('heading', { name: 'Inventario de productos' })).toBeInTheDocument()
    expect(screen.getByText('Brisa')).toBeInTheDocument()
    expect(screen.getByText('Bosque')).toBeInTheDocument()
    expect(screen.getAllByText('Sin stock').length).toBeGreaterThan(0)
  })
  test('filtra perfumes por texto de búsqueda', async () => {
    const user = userEvent.setup()
    mostrar()
    await user.type(screen.getByPlaceholderText(/buscar/i), 'Brisa')
    expect(screen.getByText('Brisa')).toBeInTheDocument()
    expect(screen.queryByText('Bosque')).not.toBeInTheDocument()
  })
  test('cancela eliminación si no confirma', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mostrar()
    const botones = screen.getAllByRole('button', { name: /eliminar/i })
    await user.click(botones[0])
    expect(eliminarProducto).not.toHaveBeenCalled()
  })
})
