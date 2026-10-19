
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
  fireEvent
} from '@testing-library/react'

import {
  MemoryRouter,
  Routes,
  Route
} from 'react-router'

import AdminProductoForm from './AdminProductoForm.jsx'

import {
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto
} from '../../services/productosStorage.js'

// Simular los servicios de productos
vi.mock('../../services/productosStorage.js', () => ({
  obtenerProductoPorId: vi.fn(),
  crearProducto: vi.fn(),
  actualizarProducto: vi.fn()
}))

// Mostrar el formulario con rutas de prueba
function mostrar(ruta = '/admin/producto-form') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/admin/producto-form"
          element={<AdminProductoForm />}
        />
        <Route
          path="/admin/productos"
          element={<p>Inventario de prueba</p>}
        />
      </Routes>
    </MemoryRouter>
  )
}

// Completar los campos del formulario
function completarFormulario(cambios = {}) {
  const datos = {
    nombre: 'Perfume Aurora',
    categoria: 'Mujer',
    precio: '49990',
    stock: '12',
    descripcion: 'Fragancia floral',
    ...cambios
  }

  fireEvent.change(
    screen.getByLabelText(/Nombre de la fragancia/i),
    { target: { value: datos.nombre } }
  )

  fireEvent.change(
    screen.getByLabelText(/Categoría/i),
    { target: { value: datos.categoria } }
  )

  fireEvent.change(
    screen.getByLabelText(/Precio \(CLP\)/i),
    { target: { value: datos.precio } }
  )

  fireEvent.change(
    screen.getByLabelText(/Stock en bodega/i),
    { target: { value: datos.stock } }
  )

  fireEvent.change(
    screen.getByLabelText(/Descripción y notas olfativas/i),
    { target: { value: datos.descripcion } }
  )
}

// Ejecutar directamente el envío para probar
// también las validaciones internas del componente
function enviarFormulario() {
  const boton = screen.getByRole('button', {
    name: /Crear Producto|Guardar Cambios/i
  })

  fireEvent.submit(boton.closest('form'))
}

describe('AdminProductoForm', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(obtenerProductoPorId).mockReturnValue(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // =========================================
  // PRUEBA 1: FORMULARIO DE CREACIÓN
  // =========================================

  test('muestra el formulario para crear productos', () => {
    mostrar()

    expect(
      screen.getByRole('heading', {
        name: 'Crear Nuevo Perfume'
      })
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Nombre de la fragancia/i)
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Crear Producto'
      })
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Categoría/i)
    ).toHaveValue('Unisex')
  })

  // =========================================
  // PRUEBA 2: PRODUCTO INEXISTENTE
  // =========================================

  test('informa si el producto a editar no existe', () => {
    mostrar('/admin/producto-form?id=99999')

    expect(
      screen.getByRole('heading', {
        name: 'Editar Perfume'
      })
    ).toBeInTheDocument()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'El producto que intentas editar no existe.'
    )

    expect(obtenerProductoPorId).toHaveBeenCalledWith('99999')
  })

  // =========================================
  // PRUEBA 3: CARGAR PRODUCTO EXISTENTE
  // =========================================

  test('carga los datos de un producto para editar', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue({
      id: '15',
      nombre: 'Perfume Original',
      categoria: 'Hombre',
      precio: 39990,
      stock: 8,
      imagen: '/img/Perfume3.webp',
      descripcion: 'Aroma amaderado'
    })

    mostrar('/admin/producto-form?id=15')

    expect(
      screen.getByLabelText(/Nombre de la fragancia/i)
    ).toHaveValue('Perfume Original')

    expect(
      screen.getByLabelText(/Categoría/i)
    ).toHaveValue('Hombre')

    expect(
      screen.getByLabelText(/Precio \(CLP\)/i)
    ).toHaveValue(39990)

    expect(
      screen.getByLabelText(/Stock en bodega/i)
    ).toHaveValue(8)

    expect(
      screen.getByLabelText(/Descripción y notas olfativas/i)
    ).toHaveValue('Aroma amaderado')

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute('src', '/img/Perfume3.webp')

    expect(
      screen.getByText('Imagen actual del producto')
    ).toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 4: DATOS OPCIONALES AL EDITAR
  // =========================================

  test('usa valores predeterminados si faltan imagen y descripción', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue({
      id: '18',
      nombre: 'Perfume Sin Imagen',
      categoria: 'Unisex',
      precio: 25000,
      stock: 3
    })

    mostrar('/admin/producto-form?id=18')

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute('src', '/img/Perfume1.webp')

    expect(
      screen.getByLabelText(/Descripción y notas olfativas/i)
    ).toHaveValue('')
  })

  // =========================================
  // PRUEBA 5: CREAR PRODUCTO
  // =========================================

  test('crea correctamente un perfume', () => {
    mostrar()

    completarFormulario()
    enviarFormulario()

    expect(crearProducto).toHaveBeenCalledWith({
      nombre: 'Perfume Aurora',
      categoria: 'Mujer',
      precio: 49990,
      stock: 12,
      imagen: '/img/Perfume1.webp',
      descripcion: 'Fragancia floral'
    })

    expect(actualizarProducto).not.toHaveBeenCalled()

    expect(
      screen.getByText('Inventario de prueba')
    ).toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 6: ACTUALIZAR PRODUCTO
  // =========================================

  test('actualiza correctamente un perfume', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue({
      id: '15',
      nombre: 'Perfume Antiguo',
      categoria: 'Unisex',
      precio: 20000,
      stock: 5,
      imagen: '/img/Perfume2.webp',
      descripcion: 'Descripción anterior'
    })

    mostrar('/admin/producto-form?id=15')

    completarFormulario({
      nombre: 'Perfume Actualizado',
      precio: '59990',
      stock: '20'
    })

    enviarFormulario()

    expect(actualizarProducto).toHaveBeenCalledWith(
      '15',
      {
        nombre: 'Perfume Actualizado',
        categoria: 'Mujer',
        precio: 59990,
        stock: 20,
        imagen: '/img/Perfume2.webp',
        descripcion: 'Fragancia floral'
      }
    )

    expect(crearProducto).not.toHaveBeenCalled()

    expect(
      screen.getByText('Inventario de prueba')
    ).toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 7: VALIDACIONES DEL FORMULARIO
  // =========================================

  test.each([
    [
      'nombre vacío',
      { nombre: '   ' },
      'Por favor ingresa el nombre de la fragancia.'
    ],
    [
      'precio vacío',
      { precio: '' },
      'Por favor ingresa un precio válido mayor a 0.'
    ],
    [
      'precio igual a cero',
      { precio: '0' },
      'Por favor ingresa un precio válido mayor a 0.'
    ],
    [
      'precio negativo',
      { precio: '-100' },
      'Por favor ingresa un precio válido mayor a 0.'
    ],
    [
      'stock vacío',
      { stock: '' },
      'Por favor ingresa un stock válido (0 o mayor).'
    ],
    [
      'stock negativo',
      { stock: '-5' },
      'Por favor ingresa un stock válido (0 o mayor).'
    ]
  ])(
    'valida correctamente %s',
    (_nombreCaso, datos, mensaje) => {
      mostrar()

      completarFormulario(datos)
      enviarFormulario()

      expect(
        screen.getByRole('alert')
      ).toHaveTextContent(mensaje)

      expect(crearProducto).not.toHaveBeenCalled()
      expect(actualizarProducto).not.toHaveBeenCalled()
    }
  )

  // =========================================
  // PRUEBA 8: STOCK CERO
  // =========================================

  test('permite crear un producto con stock cero', () => {
    mostrar()

    completarFormulario({ stock: '0' })
    enviarFormulario()

    expect(crearProducto).toHaveBeenCalledWith(
      expect.objectContaining({
        stock: 0
      })
    )
  })

  // =========================================
  // PRUEBA 9: CATÁLOGO DE IMÁGENES
  // =========================================

  test('permite abrir y cerrar el catálogo de imágenes', () => {
    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    expect(
      screen.getByText(/O selecciona una fragancia de muestra/i)
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cerrar catálogo'
      })
    )

    expect(
      screen.queryByText(/O selecciona una fragancia de muestra/i)
    ).not.toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 10: SELECCIONAR IMAGEN
  // =========================================

  test('selecciona una imagen del catálogo', () => {
    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    fireEvent.click(screen.getByTitle('Perfume 2'))

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute('src', '/img/Perfume2.webp')

    expect(
      screen.getByText('Perfume de muestra 2')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ocultar catálogo/i
      })
    )

    expect(
      screen.queryByText(/O selecciona una fragancia de muestra/i)
    ).not.toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 11: QUITAR IMAGEN
  // =========================================

  test('permite quitar una foto seleccionada', () => {
    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    fireEvent.click(screen.getByTitle('Perfume 3'))

    fireEvent.click(
      screen.getByRole('button', {
        name: /Quitar foto/i
      })
    )

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute('src', '/img/Perfume1.webp')

    expect(
      screen.queryByText('Perfume de muestra 3')
    ).not.toBeInTheDocument()
  })

  // =========================================
  // PRUEBA 12: ARCHIVO INVÁLIDO
  // =========================================

  test('rechaza archivos que no son imágenes', () => {
    const { container } = mostrar()

    const input = container.querySelector('input[type="file"]')

    const archivo = new File(
      ['contenido'],
      'documento.txt',
      { type: 'text/plain' }
    )

    fireEvent.change(input, {
      target: { files: [archivo] }
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Por favor selecciona un archivo de imagen válido'
    )
  })

  // =========================================
  // PRUEBA 13: IMAGEN MAYOR A 10 MB
  // =========================================

  test('rechaza imágenes superiores a 10MB', () => {
    const { container } = mostrar()

    const input = container.querySelector('input[type="file"]')

    const archivo = new File(
      ['imagen'],
      'grande.png',
      { type: 'image/png' }
    )

    Object.defineProperty(archivo, 'size', {
      value: 11 * 1024 * 1024
    })

    fireEvent.change(input, {
      target: { files: [archivo] }
    })

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La imagen seleccionada supera los 10MB.'
    )
  })

  // =========================================
  // PRUEBA 14: ARRASTRAR UNA IMAGEN
  // =========================================

  test('maneja el arrastre y rechazo de un archivo inválido', () => {
    const { container } = mostrar()

    const zona = container.querySelector('.admin-foto-card')

    fireEvent.dragOver(zona)

    expect(zona).toHaveClass('drag-over')

    fireEvent.dragLeave(zona)

    expect(zona).not.toHaveClass('drag-over')

    const archivo = new File(
      ['texto'],
      'archivo.txt',
      { type: 'text/plain' }
    )

    fireEvent.dragOver(zona)

    fireEvent.drop(zona, {
      dataTransfer: { files: [archivo] }
    })

    expect(zona).not.toHaveClass('drag-over')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Por favor selecciona un archivo de imagen válido'
    )
  })

  // =========================================
  // PRUEBA 15: APERTURA DEL SELECTOR
  // =========================================

  test('abre el selector de archivos con botón y teclado', () => {
    const { container } = mostrar()

    const input = container.querySelector('input[type="file"]')
    const abrirArchivo = vi.spyOn(input, 'click')

    fireEvent.click(
      screen.getByRole('button', { name: /Cambiar foto/i })
    )

    expect(abrirArchivo).toHaveBeenCalled()

    const avatar = container.querySelector('.admin-avatar-container')

    fireEvent.keyDown(avatar, { key: 'Enter' })
    fireEvent.keyDown(avatar, { key: ' ' })

    expect(abrirArchivo).toHaveBeenCalledTimes(3)
  })

  // =========================================
  // PRUEBA 16: ERROR DE CARGA DE IMAGEN
  // =========================================

  test('usa una imagen predeterminada si falla la vista previa', () => {
    vi.mocked(obtenerProductoPorId).mockReturnValue({
      id: '20',
      nombre: 'Perfume',
      categoria: 'Unisex',
      precio: 20000,
      stock: 2,
      imagen: '/imagen-inexistente.webp',
      descripcion: ''
    })

    mostrar('/admin/producto-form?id=20')

    const imagen = screen.getByAltText('Foto de la fragancia')

    fireEvent.error(imagen)

    expect(imagen).toHaveAttribute(
      'src',
      '/img/Perfume1.webp'
    )
  })

  // =========================================
  // PRUEBA 17: CARGA CON IMAGEN NO DECODIFICABLE
  // =========================================

  test('conserva el archivo si falla la optimización de imagen', async () => {
    vi.stubGlobal('Image', class {
      set src(_valor) {
        this.onerror?.()
      }
    })

    const { container } = mostrar()
    const input = container.querySelector('input[type="file"]')

    const archivo = new File(
      ['imagen'],
      'perfume.png',
      { type: 'image/png' }
    )

    fireEvent.change(input, {
      target: { files: [archivo] }
    })

    expect(
      await screen.findByText('perfume.png')
    ).toBeInTheDocument()

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute(
      'src',
      expect.stringContaining('data:image/png;base64,')
    )
  })

  // =========================================
  // PRUEBAS 18-20: REDIMENSIONAMIENTO
  // =========================================

  test.each([
    ['horizontal', 1200, 600, 600, 300],
    ['vertical', 300, 900, 200, 600],
    ['pequeña', 400, 250, 400, 250]
  ])(
    'optimiza una imagen %s',
    async (_tipo, ancho, alto, anchoFinal, altoFinal) => {

      vi.stubGlobal('Image', class {
        width = ancho
        height = alto

        set src(_valor) {
          this.onload?.()
        }
      })

      const dibujar = vi.fn()

      vi.spyOn(
        HTMLCanvasElement.prototype,
        'getContext'
      ).mockReturnValue({
        drawImage: dibujar
      })

      vi.spyOn(
        HTMLCanvasElement.prototype,
        'toDataURL'
      ).mockReturnValue('data:image/webp;base64,cHJ1ZWJh')

      const { container } = mostrar()

      const archivo = new File(
        ['imagen'],
        'perfume.jpg',
        { type: 'image/jpeg' }
      )

      fireEvent.change(
        container.querySelector('input[type="file"]'),
        { target: { files: [archivo] } }
      )

      expect(
        await screen.findByText('perfume.jpg')
      ).toBeInTheDocument()

      expect(dibujar).toHaveBeenCalledWith(
        expect.anything(),
        0,
        0,
        anchoFinal,
        altoFinal
      )

      expect(
        screen.getByAltText('Foto de la fragancia')
      ).toHaveAttribute(
        'src',
        'data:image/webp;base64,cHJ1ZWJh'
      )
    }
  )
})
