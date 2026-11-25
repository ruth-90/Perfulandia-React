
// =====================================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE ADMIN DASHBOARD
// CONECTADO CON SPRING BOOT Y H2
// =====================================================

import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'

import {
  render,
  screen,
  within,
  waitFor
} from '@testing-library/react'

import { MemoryRouter } from 'react-router'

import AdminDashboard from './AdminDashboard.jsx'

// FUNCIÓN ACTUAL QUE UTILIZA EL DASHBOARD
import {
  obtenerProductosApi
} from '../../services/productosApi.js'


// =====================================================
// SIMULAR LA CONSULTA A SPRING BOOT
// =====================================================

vi.mock('../../services/productosApi.js', () => ({

  obtenerProductosApi: vi.fn()

}))


// =====================================================
// SIMULAR SOLAMENTE EL FORMATO DE PRECIOS
// =====================================================

vi.mock('../../services/productosStorage.js', () => ({

  formatearPrecio: (precio) =>
    `$${Number(precio).toLocaleString('es-CL')}`

}))


// =====================================================
// PRODUCTOS SIMULADOS
// =====================================================

const productosSimulados = [

  {
    id: 1,
    nombre: 'Brisa Floral',
    categoria: 'Mujer',
    descripcion: 'Perfume floral',
    precio: 29990,
    stock: 4,
    imagen: '/img/brisa.webp'
  },

  {
    id: 2,
    nombre: 'Bosque Intenso',
    categoria: 'Hombre',
    descripcion: 'Perfume amaderado',
    precio: 39990,
    stock: 0,
    imagen: '/img/bosque.webp'
  }

]


// =====================================================
// FUNCIÓN PARA RENDERIZAR EL DASHBOARD
// =====================================================

function renderizarDashboard() {

  return render(

    <MemoryRouter>

      <AdminDashboard />

    </MemoryRouter>

  )
}


// =====================================================
// PRUEBAS UNITARIAS
// =====================================================

describe('AdminDashboard - Perfulandia', () => {


  // PREPARACIÓN ANTES DE CADA PRUEBA
  beforeEach(() => {

    // LIMPIAR LLAMADAS ANTERIORES
    vi.clearAllMocks()

    // SIMULAR QUE SPRING BOOT DEVUELVE DOS PRODUCTOS
    vi.mocked(obtenerProductosApi)
      .mockResolvedValue(productosSimulados)

  })


  // =================================================
  // PRUEBA 1: ESTADÍSTICAS DEL INVENTARIO
  // =================================================

  test(
    'muestra las estadísticas del inventario',
    async () => {

      // PREPARAR
      renderizarDashboard()

      // ESPERAR A QUE REACT CARGUE LOS PRODUCTOS
      await screen.findByText('Brisa Floral')

      // COMPROBAR EL TÍTULO
      expect(
        screen.getByRole('heading', {
          name: 'Dashboard'
        })
      ).toBeInTheDocument()

      // COMPROBAR QUE SE CONSULTÓ SPRING BOOT
      expect(
        obtenerProductosApi
      ).toHaveBeenCalledTimes(1)

      // OBTENER LAS TARJETAS
      const registrados = screen
        .getByText('Productos registrados')
        .closest('.admin-stat')

      const stock = screen
        .getByText('Stock total en bodega')
        .closest('.admin-stat')

      const sinStock = screen
        .getByText('Productos sin stock')
        .closest('.admin-stat')

      // COMPROBAR LAS ESTADÍSTICAS
      expect(
        within(registrados).getByText('2')
      ).toBeInTheDocument()

      expect(
        within(stock).getByText('4')
      ).toBeInTheDocument()

      expect(
        within(sinStock).getByText('1')
      ).toBeInTheDocument()

    }
  )


  // =================================================
  // PRUEBA 2: MOSTRAR PRODUCTOS Y DISPONIBILIDAD
  // =================================================

  test(
    'muestra los últimos productos y su disponibilidad',
    async () => {

      // PREPARAR
      renderizarDashboard()

      // ESPERAR LA RESPUESTA SIMULADA DE LA API
      await screen.findByText('Brisa Floral')

      // COMPROBAR LA CONSULTA
      expect(
        obtenerProductosApi
      ).toHaveBeenCalledTimes(1)

      // COMPROBAR PRODUCTOS
      expect(
        screen.getByText('Brisa Floral')
      ).toBeInTheDocument()

      expect(
        screen.getByText('Bosque Intenso')
      ).toBeInTheDocument()

      // COMPROBAR DISPONIBILIDAD
      expect(
        screen.getByText('Disponible')
      ).toBeInTheDocument()

      // "SIN STOCK" TAMBIÉN APARECE EN LAS TARJETAS
      // POR ESO BUSCAMOS SU ESTADO DENTRO DE LA TABLA
      const tabla = screen.getByRole('table')

      expect(
        within(tabla).getByText('Sin stock')
      ).toBeInTheDocument()

      // COMPROBAR PRECIO
      expect(
        screen.getByText('$29.990')
      ).toBeInTheDocument()

    }
  )


  // =================================================
  // PRUEBA 3: ACCESOS RÁPIDOS
  // =================================================

  test(
    'muestra los accesos rápidos del administrador',
    async () => {

      // PREPARAR
      renderizarDashboard()

      // ESPERAR LA CARGA PARA MOSTRAR LOS ACCESOS
      await screen.findByText('Brisa Floral')

      // COMPROBAR CREAR PRODUCTO
      const enlacesCrear = screen.getAllByRole('link', {
        name: 'Crear producto'
      })

      expect(
        enlacesCrear.some(enlace =>
          enlace.getAttribute('href') ===
          '/admin/producto-form'
        )
      ).toBe(true)

      // COMPROBAR VER USUARIOS
      const enlacesUsuarios = screen.getAllByRole('link', {
        name: 'Ver usuarios'
      })

      expect(
        enlacesUsuarios.some(enlace =>
          enlace.getAttribute('href') ===
          '/admin/usuarios'
        )
      ).toBe(true)

    }
  )


  // =================================================
  // PRUEBA 4: LÍMITE DE PRODUCTOS RECIENTES
  // =================================================

  test(
    'limita la tabla a cinco productos recientes',
    async () => {

      // PREPARAR OCHO PRODUCTOS
      const productos = Array.from(
        { length: 8 },
        (_, indice) => ({

          id: indice + 1,

          nombre: `Perfume ${indice + 1}`,

          categoria: 'Unisex',

          descripcion: 'Fragancia de prueba',

          precio: 10000,

          stock: 3,

          imagen: '/img/prueba.webp'

        })
      )

      // SIMULAR UNA RESPUESTA DE OCHO PERFUMES
      vi.mocked(obtenerProductosApi)
        .mockResolvedValue(productos)

      // MOSTRAR EL DASHBOARD
      renderizarDashboard()

      // ESPERAR A QUE CARGUE EL PERFUME CON ID MÁS ALTO
      await screen.findByText('Perfume 8')

      // 1 FILA DE ENCABEZADO + 5 FILAS DE PRODUCTOS
      const tabla = screen.getByRole('table')

      expect(
        within(tabla).getAllByRole('row')
      ).toHaveLength(6)

      // DEBEN MOSTRARSE LOS CINCO ID MÁS ALTOS
      for (const id of [8, 7, 6, 5, 4]) {

        expect(
          within(tabla).getByText(`Perfume ${id}`)
        ).toBeInTheDocument()

      }

      // LOS TRES PRODUCTOS MÁS ANTIGUOS NO APARECEN
      for (const id of [1, 2, 3]) {

        expect(
          within(tabla).queryByText(`Perfume ${id}`)
        ).not.toBeInTheDocument()

      }

    }
  )


  // =================================================
  // PRUEBA 5: ERROR DE CONEXIÓN
  // =================================================

  test(
    'muestra un mensaje si Spring Boot no responde',
    async () => {

      // SIMULAR QUE LA CONSULTA FALLA
      vi.mocked(obtenerProductosApi)
        .mockRejectedValue(
          new Error('Servidor no disponible')
        )

      // EVITAR QUE EL ERROR ESPERADO ENSUCIE LA CONSOLA
      const consola = vi.spyOn(console, 'error')
        .mockImplementation(() => {})

      try {

        renderizarDashboard()

        // COMPROBAR MENSAJE DE ERROR
        expect(
          await screen.findByRole('alert')
        ).toHaveTextContent(
          'No fue posible cargar las estadísticas'
        )

        // COMPROBAR QUE NO APARECEN DATOS INVENTADOS
        expect(
          screen.queryByText('Brisa Floral')
        ).not.toBeInTheDocument()

      } finally {

        consola.mockRestore()

      }

    }
  )

})
