
import {
  describe,
  test,
  expect,
  beforeEach,
  vi
} from 'vitest'

import {
  render,
  screen,
  waitFor
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import {
  MemoryRouter,
  Link
} from 'react-router'

import App from './App.jsx'

// SERVICIOS CONECTADOS A SPRING BOOT
import { productosApi } from './services/api.js'
import { obtenerProductosApi } from './services/productosApi.js'


// =============================================
// SIMULAR LA CONEXIÓN CON SPRING BOOT
// =============================================

vi.mock('./services/api.js', () => ({
  productosApi: {
    get: vi.fn()
  }
}))

vi.mock('./services/productosApi.js', () => ({
  obtenerProductosApi: vi.fn()
}))


// =============================================
// PRODUCTO SIMULADO DE H2
// =============================================

const producto = {
  id: 1,
  nombre: 'Brisa',
  imagen: '/img/a.webp',
  precio: 1000,
  stock: 2,
  categoria: 'Unisex'
}


// =============================================
// SIMULAR NAVBAR
// =============================================

vi.mock('./components/Navbar.jsx', () => ({
  default: ({ cantidadCarrito }) => (
    <nav>
      <span>En carrito: {cantidadCarrito}</span>

      <Link to="/carrito">
        Ir al carrito
      </Link>

      <Link to="/productos">
        Ir al catálogo
      </Link>
    </nav>
  )
}))


// =============================================
// SIMULAR FOOTER
// =============================================

vi.mock('./components/Footer.jsx', () => ({
  default: () => (
    <footer>Footer simulado</footer>
  )
}))


// =============================================
// SIMULAR PÁGINA PRODUCTOS
// =============================================

vi.mock('./pages/Productos.jsx', () => ({
  default: ({ onAgregarProducto }) => (
    <div>
      <h1>Catálogo de prueba</h1>

      <button
        type="button"
        onClick={() => onAgregarProducto({
          id: 1,
          nombre: 'Brisa',
          imagen: '/img/a.webp',
          precio: 1000,
          stock: 2
        })}
      >
        Agregar Brisa
      </button>
    </div>
  )
}))


// =============================================
// SIMULAR PÁGINA CARRITO
// =============================================

vi.mock('./pages/Carrito.jsx', () => ({
  default: ({
    carrito,
    onModificarCantidad,
    onEliminarProducto,
    onVaciarCarrito
  }) => (
    <div>
      <h1>Carrito de prueba</h1>

      <span>
        Unidades: {
          carrito.reduce(
            (acc, p) => acc + p.cantidad,
            0
          )
        }
      </span>

      {carrito.map((item) => (
        <div key={item.id}>

          <button
            type="button"
            onClick={() =>
              onModificarCantidad(item.id, 1)
            }
          >
            Aumentar {item.nombre}
          </button>

          <button
            type="button"
            onClick={() =>
              onModificarCantidad(item.id, -1)
            }
          >
            Disminuir {item.nombre}
          </button>

          <button
            type="button"
            onClick={() =>
              onEliminarProducto(item.id)
            }
          >
            Eliminar {item.nombre}
          </button>

        </div>
      ))}

      <button
        type="button"
        onClick={onVaciarCarrito}
      >
        Vaciar carrito de prueba
      </button>
    </div>
  )
}))


// =============================================
// FUNCIÓN PARA MOSTRAR APP
// =============================================

function mostrar(ruta = '/productos') {

  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )
}


// =============================================
// PRUEBAS DE APP
// =============================================

describe(
  'App - integración del carrito y rutas',
  () => {

    // =========================================
    // PREPARACIÓN ANTES DE CADA PRUEBA
    // =========================================

    beforeEach(() => {

      localStorage.clear()
      sessionStorage.clear()
      vi.clearAllMocks()

      // Simulamos el listado real de H2.
      vi.mocked(obtenerProductosApi)
        .mockResolvedValue([producto])

      // Simulamos GET /productos/1.
      vi.mocked(productosApi.get)
        .mockResolvedValue({
          data: producto
        })

    })


    // =========================================
    // PRUEBA 1: AGREGAR Y GUARDAR CARRITO
    // =========================================

    test(
      'agrega productos al carrito y los persiste en localStorage',
      async () => {

        const user = userEvent.setup()

        mostrar()

        await user.click(
          screen.getByRole('button', {
            name: 'Agregar Brisa'
          })
        )

        // Axios debe consultar el producto real.
        await waitFor(() => {

          expect(
            productosApi.get
          ).toHaveBeenCalledWith(
            '/productos/1'
          )

          expect(
            screen.getByText('En carrito: 1')
          ).toBeInTheDocument()

        })

        // El carrito queda guardado.
        await waitFor(() => {

          expect(
            JSON.parse(
              localStorage.getItem('carrito')
            )
          ).toMatchObject([
            {
              id: 1,
              nombre: 'Brisa',
              cantidad: 1,
              stock: 2
            }
          ])

        })

        // Navegar al carrito.
        await user.click(
          screen.getByRole('link', {
            name: 'Ir al carrito'
          })
        )

        expect(
          screen.getByText('Unidades: 1')
        ).toBeInTheDocument()

      }
    )


    // =========================================
    // PRUEBA 2: CONTROL DE STOCK Y CANTIDADES
    // =========================================

    test(
      'no supera stock, permite disminuir y eliminar un producto',
      async () => {

        const user = userEvent.setup()

        // Carrito previamente guardado.
        localStorage.setItem(
          'carrito',
          JSON.stringify([
            {
              id: 1,
              nombre: 'Brisa',
              precio: 1000,
              imagen: '/img/a.webp',
              cantidad: 2,
              stock: 2
            }
          ])
        )

        mostrar('/carrito')

        // Esperamos la validación inicial con H2.
        await waitFor(() => {
          expect(
            obtenerProductosApi
          ).toHaveBeenCalled()
        })

        expect(
          screen.getByText('Unidades: 2')
        ).toBeInTheDocument()

        // Intentamos aumentar sobre el stock.
        await user.click(
          screen.getByRole('button', {
            name: 'Aumentar Brisa'
          })
        )

        await waitFor(() => {
          expect(
            productosApi.get
          ).toHaveBeenCalledWith('/productos/1')
        })

        // El máximo sigue siendo 2.
        expect(
          screen.getByText('Unidades: 2')
        ).toBeInTheDocument()

        // Disminuimos una unidad.
        await user.click(
          screen.getByRole('button', {
            name: 'Disminuir Brisa'
          })
        )

        expect(
          screen.getByText('Unidades: 1')
        ).toBeInTheDocument()

        // Eliminamos el producto.
        await user.click(
          screen.getByRole('button', {
            name: 'Eliminar Brisa'
          })
        )

        expect(
          screen.getByText('Unidades: 0')
        ).toBeInTheDocument()

        await waitFor(() => {

          expect(
            JSON.parse(
              localStorage.getItem('carrito')
            )
          ).toEqual([])

        })

      }
    )


    // =========================================
    // PRUEBA 3: PROTEGER RUTAS ADMINISTRATIVAS
    // =========================================

    test(
      'redirige el dashboard a Login sin sesión administrativa',
      async () => {

        mostrar('/admin')

        expect(
          await screen.findByText(
            'Ingresa a tu cuenta'
          )
        ).toBeInTheDocument()

        // No debe mostrarse el Dashboard.
        expect(
          screen.queryByRole('heading', {
            name: 'Dashboard'
          })
        ).not.toBeInTheDocument()

      }
    )


    // =========================================
    // PRUEBA 4: OCULTAR NAVBAR Y FOOTER EN ADMIN
    // =========================================

    test(
      'oculta Navbar y Footer en rutas administrativas',
      async () => {

        // Simular sesión de administrador.
        sessionStorage.setItem('perfulandiaSesion', JSON.stringify({ rol: 'ADMINISTRADOR', token: 'jwt-de-prueba' }))

        mostrar('/admin')

        expect(
          await screen.findByRole('heading', {
            name: 'Dashboard'
          })
        ).toBeInTheDocument()

        expect(
          screen.queryByText(/En carrito:/)
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText('Footer simulado')
        ).not.toBeInTheDocument()

      }
    )


    // =========================================
    // PRUEBA 5: ELIMINAR PRODUCTOS ANTIGUOS
    // =========================================

    test(
      'elimina del carrito productos que no coinciden con H2',
      async () => {

        // Producto guardado con un nombre antiguo.
        localStorage.setItem(
          'carrito',
          JSON.stringify([
            {
              id: 1,
              nombre: 'Perfume antiguo',
              precio: 1000,
              cantidad: 1,
              stock: 2
            }
          ])
        )

        mostrar('/carrito')

        // La API devuelve un producto con el
        // mismo ID, pero con otro nombre.
        await waitFor(() => {

          expect(
            screen.getByText('Unidades: 0')
          ).toBeInTheDocument()

        })

        // El carrito antiguo se elimina.
        await waitFor(() => {

          expect(
            JSON.parse(
              localStorage.getItem('carrito')
            )
          ).toEqual([])

        })

      }
    )

  }
)
