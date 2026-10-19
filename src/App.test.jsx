import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link } from 'react-router'
import App from './App.jsx'
import { obtenerProductoPorId } from './services/productosStorage.js'

vi.mock('./services/productosStorage.js', async (importOriginal) => ({
  ...(await importOriginal()),
  obtenerProductoPorId: vi.fn()
}))
vi.mock('./components/Navbar.jsx', () => ({
  default: ({ cantidadCarrito }) => <nav><span>En carrito: {cantidadCarrito}</span><Link to="/carrito">Ir al carrito</Link><Link to="/productos">Ir al catálogo</Link></nav>
}))
vi.mock('./components/Footer.jsx', () => ({ default: () => <footer>Footer simulado</footer> }))
vi.mock('./pages/Productos.jsx', () => ({
  default: ({ onAgregarProducto }) => <div><h1>Catálogo de prueba</h1><button onClick={() => onAgregarProducto({ id: 1, nombre: 'Brisa', imagen: '/img/a.webp', precio: 1000, stock: 2 })}>Agregar Brisa</button></div>
}))
vi.mock('./pages/Carrito.jsx', () => ({
  default: ({ carrito, onModificarCantidad, onEliminarProducto, onVaciarCarrito }) => (
    <div><h1>Carrito de prueba</h1><span>Unidades: {carrito.reduce((acc, p) => acc + p.cantidad, 0)}</span>
      {carrito.map((producto) => <div key={producto.id}>
        <button onClick={() => onModificarCantidad(producto.id, 1)}>Aumentar {producto.nombre}</button>
        <button onClick={() => onModificarCantidad(producto.id, -1)}>Disminuir {producto.nombre}</button>
        <button onClick={() => onEliminarProducto(producto.id)}>Eliminar {producto.nombre}</button>
      </div>)}
      <button onClick={onVaciarCarrito}>Vaciar carrito de prueba</button>
    </div>
  )
}))

const mostrar = (ruta = '/productos') => render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>)

describe('App - integración del estado del carrito y rutas', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.mocked(obtenerProductoPorId).mockReturnValue({ id: 1, stock: 2 })
  })

  test('agrega productos al carrito y los persiste en localStorage', async () => {
    const user = userEvent.setup()
    mostrar()
    await user.click(screen.getByRole('button', { name: 'Agregar Brisa' }))
    expect(screen.getByText('En carrito: 1')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('carrito'))).toMatchObject([{ id: 1, cantidad: 1 }])
    await user.click(screen.getByRole('link', { name: 'Ir al carrito' }))
    expect(screen.getByText('Unidades: 1')).toBeInTheDocument()
  })

  test('no supera stock, permite disminuir y eliminar un producto', async () => {
    const user = userEvent.setup()
    localStorage.setItem('carrito', JSON.stringify([{ id: 1, nombre: 'Brisa', precio: 1000, imagen: '/img/a.webp', cantidad: 2, stock: 2 }]))
    mostrar('/carrito')
    await user.click(screen.getByRole('button', { name: 'Aumentar Brisa' }))
    expect(screen.getByText('Unidades: 2')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Disminuir Brisa' }))
    expect(screen.getByText('Unidades: 1')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar Brisa' }))
    expect(screen.getByText('Unidades: 0')).toBeInTheDocument()
  })

  test('redirige el dashboard a Login sin sesión administrativa', () => {
    mostrar('/admin')
    expect(screen.getByText('Ingresa a tu cuenta')).toBeInTheDocument()
  })

  test('oculta Navbar y Footer en rutas administrativas', () => {
    sessionStorage.setItem('adminActivo', 'true')
    mostrar('/admin')
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByText(/En carrito:/)).not.toBeInTheDocument()
    expect(screen.queryByText('Footer simulado')).not.toBeInTheDocument()
  })
})
