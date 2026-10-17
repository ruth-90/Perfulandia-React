import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import ProductoCatalogoCard from './ProductoCatalogoCard.jsx'

const producto = {
  id: 7, nombre: 'Rosa Floral', categoria: 'Mujer', descripcion: 'Aroma floral',
  precio: 29990, imagen: '/img/rosa.webp', stock: 5
}
function mostrar(props = producto, onAgregar = vi.fn()) {
  render(<MemoryRouter><ProductoCatalogoCard producto={props} onAgregar={onAgregar} /></MemoryRouter>)
  return onAgregar
}

describe('ProductoCatalogoCard', () => {
  test('muestra imagen, nombre, descripción, categoría y precio', () => {
    mostrar()
    expect(screen.getByRole('img', { name: producto.nombre })).toHaveAttribute('src', producto.imagen)
    expect(screen.getByRole('heading', { name: producto.nombre })).toBeInTheDocument()
    expect(screen.getByText('Mujer')).toBeInTheDocument()
    expect(screen.getByText('Aroma floral')).toBeInTheDocument()
    expect(screen.getByText(Number(29990).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }))).toBeInTheDocument()
  })
  test('enlaza al detalle de producto', () => {
    mostrar()
    expect(screen.getByRole('link', { name: 'Ver detalle' })).toHaveAttribute('href', '/producto-detalle?id=7')
  })
  test('notifica el producto al añadir al carrito', async () => {
    const user = userEvent.setup()
    const onAgregar = mostrar()
    await user.click(screen.getByRole('button', { name: /añadir al carrito/i }))
    expect(onAgregar).toHaveBeenCalledTimes(1)
    expect(onAgregar).toHaveBeenCalledWith(producto)
  })
  test.each([0, -3])('deshabilita compra cuando stock = %i', (stock) => {
    const onAgregar = mostrar({ ...producto, stock })
    expect(screen.getByText('Agotado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Producto Agotado' })).toBeDisabled()
    expect(onAgregar).not.toHaveBeenCalled()
  })
  test('mantiene el botón habilitado sin stock definido (comportamiento actual)', () => {
    mostrar({ ...producto, stock: undefined })
    expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeEnabled()
  })
})
