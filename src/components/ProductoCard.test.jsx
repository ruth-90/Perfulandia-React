import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProductoCard from './ProductoCard.jsx'

const perfume = { id: 7, imagen: '/img/perfume.webp', categoria: 'Unisex', nombre: 'Brisa', precio: 29990 }
const mostrar = (props) => render(<MemoryRouter><ProductoCard {...props} /></MemoryRouter>)

describe('ProductoCard', () => {
  test('presenta los datos del producto', () => {
    mostrar(perfume)
    expect(screen.getByRole('heading', { name: 'Brisa' })).toBeInTheDocument()
    expect(screen.getByText('Unisex')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Brisa' })).toHaveAttribute('src', '/img/perfume.webp')
    expect(screen.getByText('$29.990')).toBeInTheDocument()
  })
  test('dirige al detalle del producto cuando dispone de ID', () => {
    mostrar(perfume)
    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute('href', '/producto-detalle?id=7')
  })
  test('dirige al catálogo cuando no recibe ID', () => {
    mostrar({ ...perfume, id: undefined })
    expect(screen.getByRole('link', { name: 'Ver producto' })).toHaveAttribute('href', '/productos')
  })
})
