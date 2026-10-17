import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Carrusel from './Carrusel.jsx'

describe('Carrusel', () => {
  test('muestra las seis imágenes configuradas', () => {
    render(<Carrusel />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByRole('img', { name: `Banner perfume ${i}` }))
        .toHaveAttribute('src', `/img/banner${i}.png`)
    }
  })
  test('marca el primer indicador como activo', () => {
    render(<Carrusel />)
    expect(screen.getByRole('button', { name: 'Banner 1' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Banner 6' })).toHaveAttribute('data-bs-slide-to', '5')
  })
  test('contiene controles de navegación de Bootstrap', () => {
    render(<Carrusel />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveAttribute('data-bs-slide', 'prev')
    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveAttribute('data-bs-slide', 'next')
  })
})
