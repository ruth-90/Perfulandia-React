import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BannerEnvio from './BannerEnvio.jsx'

describe('BannerEnvio', () => {
  test('muestra dos veces el anuncio de despacho gratuito', () => {
    render(<BannerEnvio />)
    expect(screen.getAllByText(/ENVÍO GRATIS EN COMPRAS DESDE \$40\.990/i)).toHaveLength(2)
  })
  test('incluye los tres mensajes promocionales', () => {
    render(<BannerEnvio />)
    expect(screen.getAllByText(/DESCUBRE TU FRAGANCIA FAVORITA/i)).toHaveLength(2)
    expect(screen.getAllByText(/PERFUMES PARA CADA MOMENTO/i)).toHaveLength(2)
  })
})
