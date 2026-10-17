import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Footer from './Footer.jsx'

describe('Footer', () => {
  test('muestra la marca y el texto institucional', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Perfulandia' })).toBeInTheDocument()
    expect(screen.getByText(/Proyecto Desarrollo Fullstack II/i)).toBeInTheDocument()
  })
  test('incluye las rutas de navegación principales', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    for (const [nombre, ruta] of [['Inicio', '/'], ['Productos', '/productos'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']]) {
      expect(screen.getByRole('link', { name: nombre })).toHaveAttribute('href', ruta)
    }
  })
  test('presenta enlaces accesibles para redes sociales', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    for (const red of ['Instagram', 'Facebook', 'TikTok']) {
      expect(screen.getByRole('link', { name: red })).toBeInTheDocument()
    }
  })
})
