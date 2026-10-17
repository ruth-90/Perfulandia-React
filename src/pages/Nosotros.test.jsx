import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Nosotros from './Nosotros.jsx'

describe('Página Nosotros', () => {
  test('muestra historia y valores de Perfulandia', () => {
    render(<MemoryRouter><Nosotros /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: 'Fragancias que cuentan historias' })).toBeInTheDocument()
    for (const valor of ['Misión', 'Visión', 'Valores']) {
      expect(screen.getByRole('heading', { name: valor })).toBeInTheDocument()
    }
  })
  test('muestra al equipo de desarrollo', () => {
    render(<MemoryRouter><Nosotros /></MemoryRouter>)
    for (const nombre of ['Polette', 'Ruth', 'Darling']) {
      expect(screen.getByRole('heading', { name: nombre })).toBeInTheDocument()
    }
  })
})
