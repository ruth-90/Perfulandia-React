import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AdminProductoForm from './AdminProductoForm.jsx'
import { obtenerProductoPorId } from '../../services/productosStorage.js'

vi.mock('../../services/productosStorage.js', () => ({
  obtenerProductoPorId: vi.fn(), crearProducto: vi.fn(), actualizarProducto: vi.fn()
}))
const mostrar = (ruta = '/admin/producto-form') => render(
  <MemoryRouter initialEntries={[ruta]}><AdminProductoForm /></MemoryRouter>
)

describe('AdminProductoForm', () => {
  beforeEach(() => vi.mocked(obtenerProductoPorId).mockReturnValue(null))
  test('muestra el formulario para crear productos', () => {
    mostrar()
    expect(screen.getByRole('heading', { name: 'Crear Nuevo Perfume' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Nombre de la fragancia/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear Producto' })).toBeInTheDocument()
  })
  test('informa si el producto a editar no existe', () => {
    mostrar('/admin/producto-form?id=99999')
    expect(screen.getByRole('heading', { name: 'Editar Perfume' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('El producto que intentas editar no existe.')
  })
})
