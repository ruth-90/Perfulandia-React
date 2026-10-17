import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Blogs from './Blogs.jsx'

describe('Página Blogs', () => {
  test('presenta artículos y recomendaciones de perfumería', () => {
    render(<MemoryRouter><Blogs /></MemoryRouter>)
    for (const titulo of ['Blog de Perfumería', 'Cómo reconocer el perfume ideal para tu estilo', 'Fragancias frescas para todos los días', 'Elige según tu piel y temporada']) {
      expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument()
    }
  })
  test('ofrece enlaces al catálogo y contacto', () => {
    render(<MemoryRouter><Blogs /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Explorar productos' })).toHaveAttribute('href', '/productos')
    expect(screen.getByRole('link', { name: 'Pedir recomendación' })).toHaveAttribute('href', '/contacto')
  })
})
