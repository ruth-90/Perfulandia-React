import { afterEach, expect, test, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Pedidos from './Pedidos.jsx'
import { productosApi } from '../services/api.js'

vi.mock('../services/api.js', () => ({ productosApi: { get: vi.fn(), put: vi.fn() } }))
const pedido = { id: 1, estado: 'PENDIENTE', total: 10000, costoEnvio: 0, items: [] }

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

test.each([['CLIENTE', '/pedidos/mis-pedidos'], ['VENDEDOR', '/pedidos']])(
  'muestra pedidos al rol %s sin opción de confirmar', async (rol, ruta) => {
    productosApi.get.mockResolvedValue({ data: [pedido] })
    render(<MemoryRouter><Pedidos rol={rol} /></MemoryRouter>)
    await screen.findByText(/Pedido #1/)
    expect(productosApi.get).toHaveBeenCalledWith(ruta, expect.any(Object))
    expect(screen.queryByText('Confirmar inventario')).toBeNull()
  }
)

test('actualiza el estado al confirmar como administrador', async () => {
  productosApi.get.mockResolvedValue({ data: [pedido] })
  productosApi.put.mockResolvedValue({ data: { ...pedido, estado: 'CONFIRMADO' } })
  render(<MemoryRouter><Pedidos rol="ADMINISTRADOR" /></MemoryRouter>)
  fireEvent.click(await screen.findByText('Confirmar inventario'))
  expect(productosApi.put).toHaveBeenCalledWith('/pedidos/1/confirmacion')
  expect(await screen.findByText(/CONFIRMADO/)).toBeInTheDocument()
})
