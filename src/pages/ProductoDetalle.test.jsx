
import {
  describe,
  test,
  expect,
  vi,
  beforeEach
} from 'vitest'

import {
  render,
  screen,
  waitFor
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router'

import ProductoDetalle from './ProductoDetalle.jsx'

// SERVICIOS DE PRODUCTOS CON AXIOS
import { productosApi } from '../services/api.js'
import { obtenerProductosApi } from '../services/productosApi.js'


// =============================================
// SIMULAR LAS CONSULTAS A SPRING BOOT
// =============================================

vi.mock('../services/api.js', () => ({
  productosApi: {
    get: vi.fn()
  }
}))

vi.mock('../services/productosApi.js', () => ({
  obtenerProductosApi: vi.fn()
}))


// =============================================
// PRODUCTO SIMULADO
// =============================================

const producto = {
  id: 1,
  nombre: 'Brisa de prueba',
  categoria: 'Unisex',
  precio: 29990,
  imagen: '/img/brisa.webp',
  descripcion: 'Aroma fresco',
  stock: 2
}


// =============================================
// FUNCIÓN PARA MOSTRAR EL COMPONENTE
// =============================================

function mostrar(id = '1', onAgregarProducto = vi.fn()) {

  const ruta = id === null
    ? '/producto-detalle'
    : `/producto-detalle?id=${id}`

  render(
    <MemoryRouter initialEntries={[ruta]}>
      <ProductoDetalle
        onAgregarProducto={onAgregarProducto}
      />
    </MemoryRouter>
  )

  return onAgregarProducto
}


// =============================================
// PRUEBAS DE PRODUCTO DETALLE
// =============================================

describe('Página ProductoDetalle - Perfulandia', () => {

  beforeEach(() => {

    vi.clearAllMocks()

    // Simulamos la respuesta de Axios.
    vi.mocked(productosApi.get).mockResolvedValue({
      data: producto
    })

    // Respuesta cuando no hay ID en la URL.
    vi.mocked(obtenerProductosApi).mockResolvedValue([
      producto
    ])

  })


  // =========================================
  // PRUEBA 1: MOSTRAR DATOS DEL PRODUCTO
  // =========================================

  test('muestra datos de un producto y precio', async () => {

    mostrar()

    expect(
      await screen.findByRole('heading', {
        name: 'Brisa de prueba'
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('img', {
        name: 'Brisa de prueba'
      })
    ).toHaveAttribute('src', producto.imagen)

    expect(
      screen.getByText('Aroma fresco')
    ).toBeInTheDocument()

    expect(
      productosApi.get
    ).toHaveBeenCalledWith('/productos/1')

  })


  // =========================================
  // PRUEBA 2: CANTIDAD Y CARRITO
  // =========================================

  test('incrementa hasta el stock disponible y agrega cantidad elegida', async () => {

    const user = userEvent.setup()

    const onAgregar = mostrar()

    // Esperamos a que termine la consulta.
    await screen.findByRole('heading', {
      name: 'Brisa de prueba'
    })

    // El stock disponible es de 2 unidades.
    await user.click(
      screen.getByRole('button', {
        name: 'Aumentar cantidad'
      })
    )

    expect(
      screen.getByText('2', {
        selector: '#cantidadProducto'
      })
    ).toBeInTheDocument()

    // No permite superar el stock.
    expect(
      screen.getByRole('button', {
        name: 'Aumentar cantidad'
      })
    ).toBeDisabled()

    // Agregar las dos unidades al carrito.
    await user.click(
      screen.getByRole('button', {
        name: /añadir al carrito/i
      })
    )

    // El componente entrega el producto
    // y la cantidad seleccionada a App.jsx.
    await waitFor(() => {
      expect(onAgregar).toHaveBeenCalledWith(
        producto,
        2
      )
    })

  })


  // =========================================
  // PRUEBA 3: PRODUCTO AGOTADO
  // =========================================

  test('deshabilita la compra sin stock', async () => {

    vi.mocked(productosApi.get).mockResolvedValue({
      data: {
        ...producto,
        stock: 0
      }
    })

    mostrar()

    await screen.findByRole('heading', {
      name: 'Brisa de prueba'
    })

    expect(
      screen.getByRole('button', {
        name: 'Producto Agotado'
      })
    ).toBeDisabled()

    expect(
      screen.getByText('Agotado')
    ).toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 4: PRODUCTO NO ENCONTRADO
  // =========================================

  test('informa cuando un producto no existe', async () => {

    // Simulamos el error 404 de Spring Boot.
    vi.mocked(productosApi.get).mockRejectedValue({
      response: {
        status: 404
      }
    })

    // Evitamos imprimir el error esperado.
    const consola = vi.spyOn(
      console,
      'error'
    ).mockImplementation(() => {})

    try {

      mostrar('99999999')

      expect(
        await screen.findByRole('heading', {
          name: 'Producto no encontrado'
        })
      ).toBeInTheDocument()

      expect(
        screen.getByRole('link', {
          name: 'Volver a productos'
        })
      ).toHaveAttribute('href', '/productos')

      expect(
        productosApi.get
      ).toHaveBeenCalledWith('/productos/99999999')

    } finally {
      consola.mockRestore()
    }

  })


  // =========================================
  // PRUEBA 5: SIN ID EN LA URL
  // =========================================

  test('muestra el primer producto cuando no hay ID', async () => {

    mostrar(null)

    expect(
      await screen.findByRole('heading', {
        name: 'Brisa de prueba'
      })
    ).toBeInTheDocument()

    expect(
      obtenerProductosApi
    ).toHaveBeenCalled()

    // Sin ID, se utiliza el listado
    // en lugar de buscar un producto por ID.
    expect(
      productosApi.get
    ).not.toHaveBeenCalled()

  })


  // =========================================
  // PRUEBA 6: ERROR DE CONEXIÓN
  // =========================================

  test('muestra un aviso si Spring Boot no responde', async () => {

    vi.mocked(productosApi.get).mockRejectedValue(
      new Error('Servidor no disponible')
    )

    const consola = vi.spyOn(
      console,
      'error'
    ).mockImplementation(() => {})

    try {

      mostrar()

      expect(
        await screen.findByRole('alert')
      ).toHaveTextContent(
        'No fue posible cargar el perfume.'
      )

    } finally {
      consola.mockRestore()
    }

  })


  // =========================================
  // PRUEBA 7: ID INVÁLIDO
  // =========================================

  test('muestra producto no encontrado cuando el ID es inválido', async () => {

    mostrar('abc')

    expect(
      await screen.findByRole('heading', {
        name: 'Producto no encontrado'
      })
    ).toBeInTheDocument()

    // No debe consultar el backend
    // si el ID no es numérico.
    expect(
      productosApi.get
    ).not.toHaveBeenCalled()

  })

})
