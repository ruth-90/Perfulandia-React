
import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach
} from 'vitest'

import {
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { MemoryRouter } from 'react-router'

import AdminProductos from './AdminProductos.jsx'

// FUNCIONES QUE AHORA UTILIZA EL COMPONENTE
import {
  obtenerProductosApi,
  eliminarProductoApi
} from '../../services/productosApi.js'


// 1. SIMULAR LAS PETICIONES A SPRING BOOT
vi.mock('../../services/productosApi.js', () => ({

  obtenerProductosApi: vi.fn(),

  eliminarProductoApi: vi.fn()

}))


// 2. SIMULAR SOLO EL FORMATO DE PRECIOS
vi.mock('../../services/productosStorage.js', () => ({

  formatearPrecio: (precio) => `$${precio}`

}))


// 3. PRODUCTOS DE PRUEBA
// NO SON LOS PERFUMES REALES DE H2
const datos = [

  {
    id: 1,
    nombre: 'Brisa',
    categoria: 'Mujer',
    precio: 25000,
    stock: 3,
    imagen: '/img/a.webp',
    descripcion: 'Floral'
  },

  {
    id: 2,
    nombre: 'Bosque',
    categoria: 'Hombre',
    precio: 20000,
    stock: 0,
    imagen: '/img/b.webp',
    descripcion: 'Intenso'
  }

]


// 4. FUNCIÓN AUXILIAR PARA MOSTRAR EL COMPONENTE
function mostrar() {

  return render(

    <MemoryRouter>

      <AdminProductos />

    </MemoryRouter>

  )
}


// 5. PRUEBAS DEL MÓDULO ADMINISTRATIVO
describe('AdminProductos', () => {

  beforeEach(() => {

    // LIMPIAR REGISTROS DE LLAMADAS ANTERIORES
    vi.clearAllMocks()

    // SIMULAR QUE SPRING BOOT DEVUELVE DOS PRODUCTOS
    vi.mocked(obtenerProductosApi)
      .mockResolvedValue(datos)

    // SIMULAR UNA ELIMINACIÓN EXITOSA
    vi.mocked(eliminarProductoApi)
      .mockResolvedValue(undefined)

  })


  afterEach(() => {

    // RESTAURAR ESPÍAS COMO window.confirm
    vi.restoreAllMocks()

  })


  // PRUEBA 1: MOSTRAR INVENTARIO
  test(
    'muestra el inventario con estado disponible y sin stock',
    async () => {

      mostrar()

      // EL ENCABEZADO SE MUESTRA INMEDIATAMENTE
      expect(
        screen.getByRole('heading', {
          name: 'Inventario de productos'
        })
      ).toBeInTheDocument()

      // ESPERAMOS A QUE TERMINE LA CONSULTA ASÍNCRONA
      expect(
        await screen.findByText('Brisa')
      ).toBeInTheDocument()

      expect(
        screen.getByText('Bosque')
      ).toBeInTheDocument()

      expect(
        screen.getAllByText('Sin stock').length
      ).toBeGreaterThan(0)

      // VERIFICAR QUE SE CONSULTÓ LA API
      expect(
        obtenerProductosApi
      ).toHaveBeenCalled()

    }
  )


  // PRUEBA 2: FILTRAR POR TEXTO
  test(
    'filtra perfumes por texto de búsqueda',
    async () => {

      const user = userEvent.setup()

      mostrar()

      // ESPERAR A QUE LOS PRODUCTOS LLEGUEN DESDE LA API
      await screen.findByText('Brisa')

      // ESCRIBIR EN EL BUSCADOR
      await user.type(
        screen.getByPlaceholderText(/buscar/i),
        'Brisa'
      )

      // BRISA DEBE PERMANECER VISIBLE
      expect(
        screen.getByText('Brisa')
      ).toBeInTheDocument()

      // BOSQUE NO DEBE APARECER EN LOS RESULTADOS
      expect(
        screen.queryByText('Bosque')
      ).not.toBeInTheDocument()

    }
  )


  // PRUEBA 3: CANCELAR ELIMINACIÓN
  test(
    'cancela eliminación si no confirma',
    async () => {

      const user = userEvent.setup()

      // SIMULAR QUE EL ADMINISTRADOR PRESIONA CANCELAR
      vi.spyOn(window, 'confirm')
        .mockReturnValue(false)

      mostrar()

      // ESPERAR A QUE SE CARGUE LA TABLA
      await screen.findByText('Brisa')

      // BUSCAR LA FILA DEL PRODUCTO BRISA
      const filaBrisa = screen
        .getByText('Brisa')
        .closest('tr')

      // BUSCAR EL BOTÓN ELIMINAR DE ESA FILA
      const botonEliminar = within(filaBrisa)
        .getByRole('button', {
          name: /eliminar/i
        })

      // PRESIONAR ELIMINAR
      await user.click(botonEliminar)

      // COMPROBAR QUE APARECIÓ LA CONFIRMACIÓN
      expect(
        window.confirm
      ).toHaveBeenCalled()

      // NO DEBE ENVIARSE NINGUNA PETICIÓN DELETE
      expect(
        eliminarProductoApi
      ).not.toHaveBeenCalled()

      // EL PRODUCTO DEBE CONTINUAR EN LA TABLA
      expect(
        screen.getByText('Brisa')
      ).toBeInTheDocument()

    }
  )


  // PRUEBA 4: ELIMINAR PRODUCTO CONFIRMADO
  test(
    'elimina un perfume cuando el administrador confirma',
    async () => {

      const user = userEvent.setup()

      // SIMULAR QUE EL ADMINISTRADOR PRESIONA ACEPTAR
      vi.spyOn(window, 'confirm')
        .mockReturnValue(true)

      mostrar()

      await screen.findByText('Brisa')

      const filaBrisa = screen
        .getByText('Brisa')
        .closest('tr')

      const botonEliminar = within(filaBrisa)
        .getByRole('button', {
          name: /eliminar/i
        })

      // CONFIRMAR LA ELIMINACIÓN
      await user.click(botonEliminar)

      // COMPROBAR LA PETICIÓN DELETE
      await waitFor(() => {

        expect(
          eliminarProductoApi
        ).toHaveBeenCalledWith(1)

      })

      // COMPROBAR QUE BRISA DESAPARECIÓ
      await waitFor(() => {

        expect(
          screen.queryByText('Brisa')
        ).not.toBeInTheDocument()

      })

      // BOSQUE DEBE PERMANECER EN EL INVENTARIO
      expect(
        screen.getByText('Bosque')
      ).toBeInTheDocument()

    }
  )

})
