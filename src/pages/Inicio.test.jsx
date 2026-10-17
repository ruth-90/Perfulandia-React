import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Inicio from './Inicio.jsx'

describe('Página Inicio', () => {
  test('presenta carrusel, beneficios y destacados', () => {
    render(<MemoryRouter><Inicio /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Perfumes destacados' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calidad' })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /^Banner perfume/ })).toHaveLength(6)
    expect(screen.getByRole('heading', { name: 'Paco Rabanne Olympea' })).toBeInTheDocument()
  })
  test('incluye enlaces al catálogo y nuestra historia', () => {
    render(<MemoryRouter><Inicio /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Ver todos los productos' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Conocer Perfulandia' })).toHaveAttribute('href', '/nosotros')
  })
})
