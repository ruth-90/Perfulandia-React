import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CarouselInicio from './CarouselInicio.jsx'

describe('CarouselInicio', () => {
  test('renderiza los seis banners con rutas y textos alternativos', () => {
    render(<CarouselInicio />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByRole('img', { name: `Banner perfume ${i}` }))
        .toHaveAttribute('src', `/img/banner${i}.png`)
    }
  })
  test('tiene seis indicadores y el primero activo', () => {
    render(<CarouselInicio />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByRole('button', { name: `Banner ${i}` })).toHaveAttribute('data-bs-slide-to', String(i - 1))
    }
    expect(screen.getByRole('button', { name: 'Banner 1' })).toHaveClass('active')
  })
  test('incluye controles anterior y siguiente del carrusel Bootstrap', () => {
    render(<CarouselInicio />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toHaveAttribute('data-bs-slide', 'prev')
    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveAttribute('data-bs-slide', 'next')
  })
})
