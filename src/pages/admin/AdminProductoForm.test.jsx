
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
  fireEvent,
  waitFor
} from '@testing-library/react'

import {
  MemoryRouter,
  Routes,
  Route
} from 'react-router'

import AdminProductoForm from './AdminProductoForm.jsx'

// CONEXIÓN CON SPRING BOOT
import { productosApi } from '../../services/api.js'


// =============================================
// SIMULAR AXIOS
// =============================================

vi.mock('../../services/api.js', () => ({
  productosApi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}))


// =============================================
// PRODUCTO SIMULADO
// =============================================

const productoOriginal = {
  id: 15,
  nombre: 'Perfume Original',
  categoria: 'Hombre',
  precio: 39990,
  stock: 8,
  imagen: '/img/Perfume3.webp',
  descripcion: 'Aroma amaderado'
}


// =============================================
// MOSTRAR EL FORMULARIO CON RUTAS
// =============================================

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


// =============================================
// COMPLETAR LOS CAMPOS DEL FORMULARIO
// =============================================

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
    {
      target: {
        value: datos.nombre
      }
    }
  )

  fireEvent.change(
    screen.getByLabelText(/Categoría/i),
    {
      target: {
        value: datos.categoria
      }
    }
  )

  fireEvent.change(
    screen.getByLabelText(/Precio \(CLP\)/i),
    {
      target: {
        value: datos.precio
      }
    }
  )

  fireEvent.change(
    screen.getByLabelText(/Stock en bodega/i),
    {
      target: {
        value: datos.stock
      }
    }
  )

  fireEvent.change(
    screen.getByLabelText(/Descripción y notas olfativas/i),
    {
      target: {
        value: datos.descripcion
      }
    }
  )
}


// =============================================
// ENVIAR EL FORMULARIO
// =============================================

function enviarFormulario() {

  const boton = screen.getByRole('button', {
    name: /Crear Producto|Guardar Cambios/i
  })

  fireEvent.submit(
    boton.closest('form')
  )
}


// =============================================
// PRUEBAS DEL FORMULARIO ADMINISTRATIVO
// =============================================

describe('AdminProductoForm - Spring Boot y H2', () => {

  beforeEach(() => {

    vi.clearAllMocks()

    // GET: cargar producto para editar.
    vi.mocked(productosApi.get)
      .mockResolvedValue({
        data: productoOriginal
      })

    // POST: crear producto.
    vi.mocked(productosApi.post)
      .mockResolvedValue({
        data: {
          ...productoOriginal,
          id: 30
        }
      })

    // PUT: actualizar producto.
    vi.mocked(productosApi.put)
      .mockResolvedValue({
        data: productoOriginal
      })

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

    // Al crear, no necesitamos consultar un ID.
    expect(productosApi.get).not.toHaveBeenCalled()

  })


  // =========================================
  // PRUEBA 2: PRODUCTO INEXISTENTE
  // =========================================

  test('informa si el producto a editar no existe', async () => {

    // Spring Boot devuelve 404.
    vi.mocked(productosApi.get)
      .mockRejectedValue({
        response: {
          status: 404
        }
      })

    vi.spyOn(console, 'error')
      .mockImplementation(() => {})

    mostrar('/admin/producto-form?id=99999')

    expect(
      screen.getByRole('heading', {
        name: 'Editar Perfume'
      })
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'El producto que intentas editar no existe en H2.'
    )

    expect(productosApi.get).toHaveBeenCalledWith(
      '/productos/99999'
    )

  })


  // =========================================
  // PRUEBA 3: CARGAR PRODUCTO EXISTENTE
  // =========================================

  test('carga los datos de un producto para editar', async () => {

    mostrar('/admin/producto-form?id=15')

    expect(
      await screen.findByDisplayValue('Perfume Original')
    ).toBeInTheDocument()

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
    ).toHaveAttribute(
      'src',
      '/img/Perfume3.webp'
    )

    expect(
      screen.getByText('Imagen actual del producto')
    ).toBeInTheDocument()

    expect(productosApi.get).toHaveBeenCalledWith(
      '/productos/15'
    )

  })


  // =========================================
  // PRUEBA 4: DATOS OPCIONALES
  // =========================================

  test('usa valores predeterminados si faltan imagen y descripción', async () => {

    vi.mocked(productosApi.get)
      .mockResolvedValue({
        data: {
          id: 18,
          nombre: 'Perfume Sin Imagen',
          categoria: 'Unisex',
          precio: 25000,
          stock: 3
        }
      })

    mostrar('/admin/producto-form?id=18')

    await screen.findByDisplayValue(
      'Perfume Sin Imagen'
    )

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute(
      'src',
      '/img/Perfume1.webp'
    )

    expect(
      screen.getByLabelText(/Descripción y notas olfativas/i)
    ).toHaveValue('')

  })


  // =========================================
  // PRUEBA 5: CREAR PRODUCTO
  // =========================================

  test('crea correctamente un perfume mediante POST', async () => {

    mostrar()

    completarFormulario()
    enviarFormulario()

    await waitFor(() => {

      expect(productosApi.post).toHaveBeenCalledWith(
        '/productos',
        {
          nombre: 'Perfume Aurora',
          categoria: 'Mujer',
          precio: 49990,
          stock: 12,
          imagen: '/img/Perfume1.webp',
          descripcion: 'Fragancia floral'
        }
      )

    })

    expect(productosApi.put).not.toHaveBeenCalled()

    expect(
      await screen.findByText('Inventario de prueba')
    ).toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 6: ACTUALIZAR PRODUCTO
  // =========================================

  test('actualiza correctamente un perfume mediante PUT', async () => {

    vi.mocked(productosApi.get)
      .mockResolvedValue({
        data: {
          ...productoOriginal,
          nombre: 'Perfume Antiguo',
          categoria: 'Unisex',
          precio: 20000,
          stock: 5,
          imagen: '/img/Perfume2.webp',
          descripcion: 'Descripción anterior'
        }
      })

    mostrar('/admin/producto-form?id=15')

    await screen.findByDisplayValue('Perfume Antiguo')

    completarFormulario({
      nombre: 'Perfume Actualizado',
      precio: '59990',
      stock: '20'
    })

    enviarFormulario()

    await waitFor(() => {

      expect(productosApi.put).toHaveBeenCalledWith(
        '/productos/15',
        {
          nombre: 'Perfume Actualizado',
          categoria: 'Mujer',
          precio: 59990,
          stock: 20,
          imagen: '/img/Perfume2.webp',
          descripcion: 'Fragancia floral'
        }
      )

    })

    expect(productosApi.post).not.toHaveBeenCalled()

    expect(
      await screen.findByText('Inventario de prueba')
    ).toBeInTheDocument()

  })


  // =========================================
  // PRUEBAS 7-12: VALIDACIONES
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
      'Ingresa un precio válido mayor a 0.'
    ],
    [
      'precio igual a cero',
      { precio: '0' },
      'Ingresa un precio válido mayor a 0.'
    ],
    [
      'precio negativo',
      { precio: '-100' },
      'Ingresa un precio válido mayor a 0.'
    ],
    [
      'stock vacío',
      { stock: '' },
      'Ingresa un stock válido, igual o mayor a 0.'
    ],
    [
      'stock negativo',
      { stock: '-5' },
      'Ingresa un stock válido, igual o mayor a 0.'
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

      // No debe llamar al backend.
      expect(productosApi.post).not.toHaveBeenCalled()
      expect(productosApi.put).not.toHaveBeenCalled()

    }
  )


  // =========================================
  // PRUEBA 13: STOCK CERO
  // =========================================

  test('permite crear un producto con stock cero', async () => {

    mostrar()

    completarFormulario({
      stock: '0'
    })

    enviarFormulario()

    await waitFor(() => {

      expect(productosApi.post).toHaveBeenCalledWith(
        '/productos',
        expect.objectContaining({
          stock: 0
        })
      )

    })

  })


  // =========================================
  // PRUEBA 14: ABRIR Y CERRAR CATÁLOGO
  // =========================================

  test('permite abrir y cerrar el catálogo de imágenes', () => {

    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    expect(
      screen.getByText(
        /O selecciona una fragancia de muestra/i
      )
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cerrar catálogo'
      })
    )

    expect(
      screen.queryByText(
        /O selecciona una fragancia de muestra/i
      )
    ).not.toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 15: SELECCIONAR IMAGEN
  // =========================================

  test('selecciona una imagen del catálogo', () => {

    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    fireEvent.click(
      screen.getByTitle('Perfume 2')
    )

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute(
      'src',
      '/img/Perfume2.webp'
    )

    expect(
      screen.getByText('Perfume de muestra 2')
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ocultar catálogo/i
      })
    )

    expect(
      screen.queryByText(
        /O selecciona una fragancia de muestra/i
      )
    ).not.toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 16: QUITAR IMAGEN
  // =========================================

  test('permite quitar una foto seleccionada', () => {

    mostrar()

    fireEvent.click(
      screen.getByRole('button', {
        name: /Elegir del catálogo/i
      })
    )

    fireEvent.click(
      screen.getByTitle('Perfume 3')
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Quitar foto/i
      })
    )

    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute(
      'src',
      '/img/Perfume1.webp'
    )

    expect(
      screen.queryByText('Perfume de muestra 3')
    ).not.toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 17: ARCHIVO INVÁLIDO
  // =========================================

  test('rechaza archivos que no son imágenes', () => {

    const { container } = mostrar()

    const input = container.querySelector(
      'input[type="file"]'
    )

    const archivo = new File(
      ['contenido'],
      'documento.txt',
      { type: 'text/plain' }
    )

    fireEvent.change(input, {
      target: {
        files: [archivo]
      }
    })

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'Selecciona una imagen válida: JPG, PNG o WEBP.'
    )

  })


  // =========================================
  // PRUEBA 18: IMAGEN MAYOR A 10 MB
  // =========================================

  test('rechaza imágenes superiores a 10 MB', () => {

    const { container } = mostrar()

    const input = container.querySelector(
      'input[type="file"]'
    )

    const archivo = new File(
      ['imagen'],
      'grande.png',
      { type: 'image/png' }
    )

    Object.defineProperty(archivo, 'size', {
      value: 11 * 1024 * 1024
    })

    fireEvent.change(input, {
      target: {
        files: [archivo]
      }
    })

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'La imagen seleccionada supera los 10 MB.'
    )

  })


  // =========================================
  // PRUEBA 19: ARRASTRAR IMAGEN
  // =========================================

  test('maneja el arrastre y rechazo de un archivo inválido', () => {

    const { container } = mostrar()

    const zona = container.querySelector(
      '.admin-foto-card'
    )

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
      dataTransfer: {
        files: [archivo]
      }
    })

    expect(zona).not.toHaveClass('drag-over')

    expect(
      screen.getByRole('alert')
    ).toHaveTextContent(
      'Selecciona una imagen válida: JPG, PNG o WEBP.'
    )

  })


  // =========================================
  // PRUEBA 20: SELECTOR CON BOTÓN Y TECLADO
  // =========================================

  test('abre el selector de archivos con botón y teclado', () => {

    const { container } = mostrar()

    const input = container.querySelector(
      'input[type="file"]'
    )

    const abrirArchivo = vi.spyOn(
      input,
      'click'
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /Cambiar foto/i
      })
    )

    expect(abrirArchivo).toHaveBeenCalled()

    const avatar = container.querySelector(
      '.admin-avatar-container'
    )

    fireEvent.keyDown(avatar, {
      key: 'Enter'
    })

    fireEvent.keyDown(avatar, {
      key: ' '
    })

    expect(abrirArchivo).toHaveBeenCalledTimes(3)

  })


  // =========================================
  // PRUEBA 21: ERROR EN VISTA PREVIA
  // =========================================

  test('usa una imagen predeterminada si falla la vista previa', async () => {

    vi.mocked(productosApi.get)
      .mockResolvedValue({
        data: {
          ...productoOriginal,
          id: 20,
          imagen: '/imagen-inexistente.webp'
        }
      })

    mostrar('/admin/producto-form?id=20')

    const imagen = await screen.findByAltText(
      'Foto de la fragancia'
    )

    fireEvent.error(imagen)

    expect(imagen).toHaveAttribute(
      'src',
      '/img/Perfume1.webp'
    )

  })


  // =========================================
  // PRUEBA 22: IMAGEN NO DECODIFICABLE
  // =========================================

  test('informa si una imagen no puede decodificarse', async () => {

    // Simular un archivo que el navegador
    // no consigue convertir en imagen.
    vi.stubGlobal('Image', class {

      set src(_valor) {
        this.onerror?.()
      }

    })

    const { container } = mostrar()

    const input = container.querySelector(
      'input[type="file"]'
    )

    const archivo = new File(
      ['imagen'],
      'perfume.png',
      { type: 'image/png' }
    )

    fireEvent.change(input, {
      target: {
        files: [archivo]
      }
    })

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'No fue posible leer la imagen seleccionada.'
    )

    // No debe guardar una imagen inválida
    // como si se hubiera procesado.
    expect(
      screen.getByAltText('Foto de la fragancia')
    ).toHaveAttribute(
      'src',
      '/img/Perfume1.webp'
    )

  })


  // =========================================
  // PRUEBAS 23-25: REDIMENSIONAR IMÁGENES
  // =========================================

  test.each([
    ['horizontal', 1200, 600, 600, 300],
    ['vertical', 300, 900, 200, 600],
    ['pequeña', 400, 250, 400, 250]
  ])(
    'optimiza una imagen %s',
    async (_tipo, ancho, alto, anchoFinal, altoFinal) => {

      // Simular una imagen decodificada.
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
      ).mockReturnValue(
        'data:image/webp;base64,cHJ1ZWJh'
      )

      const { container } = mostrar()

      const archivo = new File(
        ['imagen'],
        'perfume.jpg',
        { type: 'image/jpeg' }
      )

      fireEvent.change(
        container.querySelector('input[type="file"]'),
        {
          target: {
            files: [archivo]
          }
        }
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


  // =========================================
  // PRUEBA 26: ERROR AL GUARDAR
  // =========================================

  test('muestra un error si Spring Boot no permite guardar', async () => {

    vi.mocked(productosApi.post)
      .mockRejectedValue({
        response: {
          status: 400
        }
      })

    vi.spyOn(console, 'error')
      .mockImplementation(() => {})

    mostrar()

    completarFormulario()
    enviarFormulario()

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'Spring Boot rechazó los datos del producto.'
    )

    // No debe redirigir si no se guardó.
    expect(
      screen.getByRole('heading', {
        name: 'Crear Nuevo Perfume'
      })
    ).toBeInTheDocument()

  })


  // =========================================
  // PRUEBA 27: ERROR DE CONEXIÓN AL EDITAR
  // =========================================

  test('muestra un error si Spring Boot no responde al editar', async () => {

    vi.mocked(productosApi.get)
      .mockRejectedValue(
        new Error('Servidor no disponible')
      )

    vi.spyOn(console, 'error')
      .mockImplementation(() => {})

    mostrar('/admin/producto-form?id=15')

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'No fue posible cargar el perfume.'
    )

  })

})
