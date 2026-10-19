// =====================================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE ADMIN DASHBOARD
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
  within
} from '@testing-library/react'

import { MemoryRouter } from 'react-router'

import AdminDashboard from './AdminDashboard.jsx'

import {
  obtenerEstadisticas,
  obtenerProductos
} from '../../services/productosStorage.js'


// =====================================================
// SIMULAR EL SERVICIO DE PRODUCTOS
// =====================================================

vi.mock('../../services/productosStorage.js', () => ({
  obtenerEstadisticas: vi.fn(),
  obtenerProductos: vi.fn(),

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
// GRUPO DE PRUEBAS UNITARIAS
// =====================================================

describe('AdminDashboard - Perfulandia', () => {

  // PREPARACIÓN ANTES DE CADA PRUEBA
  beforeEach(() => {

    vi.clearAllMocks()

    vi.mocked(obtenerEstadisticas).mockReturnValue({
      totalProductos: 2,
      stockTotal: 4,
      sinStock: 1
    })

    vi.mocked(obtenerProductos).mockReturnValue(
      productosSimulados
    )

  })


  // =================================================
  // PRUEBA 1: ESTADÍSTICAS DEL INVENTARIO
  // =================================================

  test('muestra las estadísticas del inventario', () => {

    // PREPARAR
    renderizarDashboard()

    // COMPROBAR EL TÍTULO
    expect(
      screen.getByRole('heading', {
        name: 'Dashboard'
      })
    ).toBeInTheDocument()

    // COMPROBAR LA CONSULTA
    expect(
      obtenerEstadisticas
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

    // COMPROBAR LOS RESULTADOS
    expect(
      within(registrados).getByText('2')
    ).toBeInTheDocument()

    expect(
      within(stock).getByText('4')
    ).toBeInTheDocument()

    expect(
      within(sinStock).getByText('1')
    ).toBeInTheDocument()

  })


  // =================================================
  // PRUEBA 2: MOSTRAR PRODUCTOS Y DISPONIBILIDAD
  // =================================================

  test('muestra los últimos productos y su disponibilidad', () => {

    // PREPARAR
    renderizarDashboard()

    // COMPROBAR CONSULTA
    expect(
      obtenerProductos
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

    expect(
      screen.getByText('Sin stock')
    ).toBeInTheDocument()

    // COMPROBAR PRECIO
    expect(
      screen.getByText('$29.990')
    ).toBeInTheDocument()

  })


  // =================================================
  // PRUEBA 3: ACCESOS RÁPIDOS
  // =================================================

  test('muestra los accesos rápidos del administrador', () => {

    // PREPARAR
    renderizarDashboard()

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

  })


  // =================================================
  // PRUEBA 4: LÍMITE DE PRODUCTOS RECIENTES
  // =================================================

  test('limita la tabla a cinco productos recientes', () => {

    // PREPARAR 8 PRODUCTOS
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

    vi.mocked(obtenerProductos).mockReturnValue(
      productos
    )

    // ACTUAR
    renderizarDashboard()

    // COMPROBAR
    // 1 fila de encabezado + 5 productos
    expect(
      screen.getAllByRole('row')
    ).toHaveLength(6)

    expect(
      screen.getByText('Perfume 5')
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Perfume 6')
    ).not.toBeInTheDocument()

  })

})