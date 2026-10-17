import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import Navbar from './Navbar.jsx'

function mostrar(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/productos']}>
      <Navbar {...props} />
      <Routes><Route path="/" element={<p>Inicio destino</p>} /></Routes>
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  beforeEach(() => localStorage.clear())

  test('muestra rutas de la tienda y enlace al carrito', () => {
    mostrar({ cantidadCarrito: 3 })
    const rutas = [
      ['Inicio', '/'], ['Productos', '/productos'], ['Nosotros', '/nosotros'],
      ['Blog', '/blogs'], ['Contacto', '/contacto'], ['Carrito de compras', '/carrito']
    ]
    rutas.forEach(([nombre, ruta]) => expect(screen.getByRole('link', { name: nombre })).toHaveAttribute('href', ruta))
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  test('muestra enlace Ingresar cuando no hay usuario activo', () => {
    mostrar()
    expect(screen.getByRole('link', { name: /ingresar/i })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument()
  })

  test('muestra el nombre y correo del cliente activo', () => {
    mostrar({ usuarioActivo: { nombre: 'Maria', correo: 'maria@gmail.com' } })
    expect(screen.getByRole('button', { name: /maria/i })).toBeInTheDocument()
    expect(screen.getByText('maria@gmail.com')).toBeInTheDocument()
  })

  test('cierra sesión, elimina clienteActivo y llama al callback', async () => {
    const user = userEvent.setup()
    const onCerrarSesion = vi.fn()
    localStorage.setItem('clienteActivo', '{"nombre":"Maria"}')
    mostrar({ usuarioActivo: { nombre: 'Maria', correo: 'maria@gmail.com' }, onCerrarSesion })
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(localStorage.getItem('clienteActivo')).toBeNull()
    expect(onCerrarSesion).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Inicio destino')).toBeInTheDocument()
  })

  test('repite los avisos en dos grupos para un banner continuo', () => {
    const { container } = mostrar()
    expect(container.querySelectorAll('.banner-envio-lista')).toHaveLength(2)
    expect(container.querySelector('[aria-hidden="true"].banner-envio-lista')).toBeInTheDocument()
  })
})
