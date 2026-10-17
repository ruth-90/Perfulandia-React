import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Beneficios from './Beneficios.jsx'

describe('Beneficios', () => {
  test('presenta los tres beneficios de compra', () => {
    render(<Beneficios />)
    for (const titulo of ['Calidad', 'Compra segura', 'Despachos']) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
    }
  })
  test('incluye descripciones de los servicios', () => {
    render(<Beneficios />)
    expect(screen.getByText(/selección especial de fragancias/i)).toBeInTheDocument()
    expect(screen.getByText(/recibe tus fragancias directamente/i)).toBeInTheDocument()
  })
})
