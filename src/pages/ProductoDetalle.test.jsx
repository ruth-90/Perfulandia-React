import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ProductoDetalle from './ProductoDetalle.jsx'
import { obtenerProductoPorId } from '../services/productosStorage.js'

vi.mock('../services/productosStorage.js', () => ({ obtenerProductoPorId: vi.fn() }))

const producto = { id: 1, nombre: 'Brisa de prueba', categoria: 'Unisex', precio: 29990, imagen: '/img/brisa.webp', descripcion: 'Aroma fresco', stock: 2 }
function mostrar(id = '1', onAgregarProducto = vi.fn()) {
  render(<MemoryRouter initialEntries={[`/producto-detalle?id=${id}`]}>
    <ProductoDetalle onAgregarProducto={onAgregarProducto} />
  </MemoryRouter>)
  return onAgregarProducto
}

describe('Página ProductoDetalle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(obtenerProductoPorId).mockReturnValue(producto)
  })

  test('muestra datos de un producto y precio', () => {
    mostrar()
    expect(screen.getByRole('heading', { name: 'Brisa de prueba' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Brisa de prueba' })).toHaveAttribute('src', producto.imagen)
    expect(screen.getByText('Aroma fresco')).toBeInTheDocument()
  })

  test('incrementa hasta el stock disponible y agrega cantidad elegida', async () => {
    const user = userEvent.setup()
    const onAgregar = mostrar()
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }))
    expect(screen.getByText('2', { selector: '#cantidadProducto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aumentar cantidad' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /añadir al carrito/i }))
    expect(onAgregar).toHaveBeenCalledWith(producto, 2)
    expect(screen.getByRole('status')).toHaveTextContent('2 unidad(es) de Brisa de prueba agregada(s) al carrito.')
  })

  test('deshabilita la compra sin stock', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue({ ...producto, stock: 0 })
    mostrar()
    expect(screen.getByRole('button', { name: 'Producto Agotado' })).toBeDisabled()
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  test('informa cuando un producto no existe', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue(null)
    mostrar('99999999')
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a productos' })).toHaveAttribute('href', '/productos')
  })
})
