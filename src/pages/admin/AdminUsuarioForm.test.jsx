
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach
} from 'vitest'

import {
  render,
  screen,
  fireEvent,
  cleanup
} from '@testing-library/react'

import {
  MemoryRouter,
  Routes,
  Route
} from 'react-router'

import AdminUsuarioForm from './AdminUsuarioForm.jsx'

// ==========================================
// DATOS DE PRUEBA
// ==========================================

const usuarioBase = {
  rut: '1000005K',
  nombre: 'Maria',
  apellidos: 'Perez',
  fechaNacimiento: '1998-01-15',
  correo: 'maria@gmail.com',
  tipoUsuario: 'Cliente',
  region: 'Región Metropolitana',
  comuna: 'Santiago',
  direccion: 'Principal 123'
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function mostrar(ruta = '/admin/usuario-form') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route
          path="/admin/usuario-form"
          element={<AdminUsuarioForm />}
        />
        <Route
          path="/admin/usuarios"
          element={<p>Listado de usuarios</p>}
        />
      </Routes>
    </MemoryRouter>
  )
}

function cambiar(campo, valor) {
  fireEvent.change(screen.getByLabelText(campo), {
    target: { value: valor }
  })
}

function completarFormulario(cambios = {}) {
  const datos = { ...usuarioBase, ...cambios }

  cambiar('RUT', datos.rut)
  cambiar('Nombre', datos.nombre)
  cambiar('Apellidos', datos.apellidos)
  cambiar('Fecha de nacimiento', datos.fechaNacimiento)
  cambiar('Correo electrónico', datos.correo)
  cambiar('Tipo de usuario', datos.tipoUsuario)
  cambiar('Región', datos.region)
  cambiar('Comuna', datos.comuna)
  cambiar('Dirección', datos.direccion)
}

function enviarFormulario() {
  const boton = screen.getByRole('button', {
    name: /Crear usuario|Guardar cambios/i
  })

  fireEvent.submit(boton.closest('form'))
}

function obtenerGuardados() {
  return JSON.parse(localStorage.getItem('usuarios') || '[]')
}

function guardarUsuarios(usuarios) {
  localStorage.setItem('usuarios', JSON.stringify(usuarios))
}

describe('AdminUsuarioForm - Perfulandia', () => {

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  // ==========================================
  // TEST 1: FORMULARIO DE CREACIÓN
  // ==========================================

  test('muestra los campos principales para crear usuario', () => {
    mostrar()

    expect(
      screen.getByRole('heading', {
        name: 'Crear usuario'
      })
    ).toBeInTheDocument()

    for (const label of [
      'RUT',
      'Nombre',
      'Apellidos',
      'Fecha de nacimiento',
      'Correo electrónico',
      'Tipo de usuario',
      'Región',
      'Comuna',
      'Dirección'
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }

    expect(
      screen.getByRole('button', {
        name: 'Crear usuario'
      })
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText('Tipo de usuario')
    ).toHaveValue('Cliente')

    expect(screen.getByLabelText('Comuna')).toBeDisabled()
  })

  // ==========================================
  // TEST 2: MODO EDICIÓN
  // ==========================================

  test('permite abrir el formulario en modo edición', () => {
    guardarUsuarios([usuarioBase])

    mostrar('/admin/usuario-form?rut=1000005K')

    expect(
      screen.getByRole('heading', {
        name: 'Editar usuario'
      })
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Nombre')).toHaveValue('Maria')
    expect(screen.getByLabelText('RUT')).toHaveValue('1000005K')
    expect(screen.getByLabelText('Comuna')).toHaveValue('Santiago')

    expect(
      screen.getByRole('button', {
        name: 'Guardar cambios'
      })
    ).toBeInTheDocument()
  })

  // ==========================================
  // TEST 3: CREAR USUARIO
  // ==========================================

  test('crea un usuario y lo guarda en localStorage', () => {
    mostrar()

    completarFormulario()
    enviarFormulario()

    const usuarios = obtenerGuardados()

    expect(usuarios).toHaveLength(1)
    expect(usuarios[0]).toEqual(usuarioBase)

    expect(
      screen.getByText('Listado de usuarios')
    ).toBeInTheDocument()
  })

  // ==========================================
  // TEST 4: CREAR ADMINISTRADOR
  // ==========================================

  test('permite crear un usuario administrador', () => {
    mostrar()

    completarFormulario({
      tipoUsuario: 'Administrador'
    })

    enviarFormulario()

    expect(obtenerGuardados()[0].tipoUsuario)
      .toBe('Administrador')
  })

  // ==========================================
  // TEST 5: NORMALIZAR DATOS
  // ==========================================

  test('normaliza RUT, correo y espacios de los campos', () => {
    mostrar()

    completarFormulario({
      rut: '1000005k',
      nombre: '  Maria  ',
      apellidos: '  Perez  ',
      correo: 'MARIA@GMAIL.COM',
      direccion: '  Principal 123  '
    })

    enviarFormulario()

    const usuario = obtenerGuardados()[0]

    expect(usuario).toEqual(
      expect.objectContaining({
        rut: '1000005K',
        nombre: 'Maria',
        apellidos: 'Perez',
        correo: 'maria@gmail.com',
        direccion: 'Principal 123'
      })
    )
  })

  // ==========================================
  // TEST 6: CAMPOS OBLIGATORIOS
  // ==========================================

  test('rechaza un formulario vacío', () => {
    mostrar()

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Debes completar todos los campos.'
    )

    expect(obtenerGuardados()).toHaveLength(0)
  })

  // ==========================================
  // TEST 7: VALIDACIONES
  // ==========================================

  test.each([
    [
      'nombre vacío',
      { nombre: '' },
      'Debes completar todos los campos.'
    ],
    [
      'apellidos vacíos',
      { apellidos: '' },
      'Debes completar todos los campos.'
    ],
    [
      'dirección vacía',
      { direccion: '' },
      'Debes completar todos los campos.'
    ],
    [
      'RUT demasiado corto',
      { rut: '12345' },
      'El RUT debe tener entre 7 y 9 caracteres.'
    ],
    [
      'formato incorrecto del RUT',
      { rut: '12.34567' },
      'Ingresa el RUT sin puntos ni guion.'
    ],
    [
      'nombre demasiado largo',
      { nombre: 'A'.repeat(51) },
      'Revisa la longitud del nombre y apellidos.'
    ],
    [
      'apellidos demasiado largos',
      { apellidos: 'B'.repeat(101) },
      'Revisa la longitud del nombre y apellidos.'
    ],
    [
      'usuario menor de edad',
      { fechaNacimiento: '2020-01-15' },
      'El usuario debe tener 18 años o más.'
    ],
    [
      'correo con formato incorrecto',
      { correo: 'correo-invalido' },
      'Ingresa un correo electrónico válido.'
    ],
    [
      'dominio no autorizado',
      { correo: 'usuario@yahoo.com' },
      'El dominio del correo no está permitido.'
    ],
    [
      'dirección demasiado larga',
      { direccion: 'C'.repeat(301) },
      'La dirección no puede superar los 300 caracteres.'
    ]
  ])(
    'valida correctamente %s',
    (_caso, cambios, mensajeEsperado) => {
      mostrar()

      completarFormulario(cambios)
      enviarFormulario()

      expect(screen.getByRole('alert'))
        .toHaveTextContent(mensajeEsperado)

      expect(obtenerGuardados()).toHaveLength(0)
    }
  )

  // ==========================================
  // TEST 8: FECHA FUTURA
  // ==========================================

  test('rechaza una fecha de nacimiento futura', () => {
    mostrar()

    const anioFuturo = new Date().getFullYear() + 1

    completarFormulario({
      fechaNacimiento: `${anioFuturo}-06-15`
    })

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'La fecha de nacimiento no puede ser futura.'
    )
  })

  // ==========================================
  // TEST 9: FECHA INEXISTENTE
  // ==========================================

  test('rechaza una fecha de nacimiento inexistente', () => {
    guardarUsuarios([
      {
        ...usuarioBase,
        fechaNacimiento: '2001-02-30'
      }
    ])

    mostrar('/admin/usuario-form?rut=1000005K')

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ingresa una fecha de nacimiento válida.'
    )
  })

  // ==========================================
  // TEST 10: MAYOR DE 18 AÑOS
  // ==========================================

  test('permite registrar a una persona de 18 años cumplidos', () => {
    mostrar()

    const hoy = new Date()
    const limite = new Date(
      hoy.getFullYear() - 18,
      hoy.getMonth(),
      hoy.getDate()
    )

    const fecha = [
      limite.getFullYear(),
      String(limite.getMonth() + 1).padStart(2, '0'),
      String(limite.getDate()).padStart(2, '0')
    ].join('-')

    completarFormulario({
      fechaNacimiento: fecha
    })

    enviarFormulario()

    expect(obtenerGuardados()).toHaveLength(1)
    expect(obtenerGuardados()[0].fechaNacimiento).toBe(fecha)
  })

  // ==========================================
  // TEST 11: REGIONES Y COMUNAS
  // ==========================================

  test('actualiza las comunas cuando cambia la región', () => {
    mostrar()

    const region = screen.getByLabelText('Región')
    const comuna = screen.getByLabelText('Comuna')

    expect(comuna).toBeDisabled()

    fireEvent.change(region, {
      target: { value: 'Región Metropolitana' }
    })

    expect(comuna).not.toBeDisabled()

    fireEvent.change(comuna, {
      target: { value: 'Santiago' }
    })

    expect(comuna).toHaveValue('Santiago')

    fireEvent.change(region, {
      target: { value: 'Valparaíso' }
    })

    expect(comuna).toHaveValue('')

    expect(
      screen.getByRole('option', { name: 'Viña del Mar' })
    ).toBeInTheDocument()
  })

  // ==========================================
  // TEST 12: RUT DUPLICADO
  // ==========================================

  test('impide registrar un RUT duplicado', () => {
    guardarUsuarios([usuarioBase])

    mostrar()

    completarFormulario({
      correo: 'otro@gmail.com'
    })

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este RUT ya está registrado.'
    )

    expect(obtenerGuardados()).toHaveLength(1)
  })

  // ==========================================
  // TEST 13: CORREO DUPLICADO
  // ==========================================

  test('impide registrar un correo duplicado', () => {
    guardarUsuarios([usuarioBase])

    mostrar()

    completarFormulario({
      rut: '1000006K',
      correo: 'MARIA@GMAIL.COM'
    })

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Este correo ya está registrado.'
    )

    expect(obtenerGuardados()).toHaveLength(1)
  })

  // ==========================================
  // TEST 14: EDITAR USUARIO
  // ==========================================

  test('actualiza los datos de un usuario existente', () => {
    guardarUsuarios([usuarioBase])

    mostrar('/admin/usuario-form?rut=1000005K')

    cambiar('Nombre', 'Maria Fernanda')
    cambiar('Apellidos', 'Gonzalez')
    cambiar('Dirección', 'Nueva dirección 456')
    cambiar('Tipo de usuario', 'Administrador')

    enviarFormulario()

    const usuarios = obtenerGuardados()

    expect(usuarios).toHaveLength(1)

    expect(usuarios[0]).toEqual(
      expect.objectContaining({
        rut: '1000005K',
        nombre: 'Maria Fernanda',
        apellidos: 'Gonzalez',
        direccion: 'Nueva dirección 456',
        tipoUsuario: 'Administrador'
      })
    )

    expect(
      screen.getByText('Listado de usuarios')
    ).toBeInTheDocument()
  })

  // ==========================================
  // TEST 15: CONSERVAR OTROS USUARIOS
  // ==========================================

  test('conserva los otros usuarios al editar', () => {
    const otroUsuario = {
      ...usuarioBase,
      rut: '1000006K',
      nombre: 'Pedro',
      correo: 'pedro@gmail.com'
    }

    guardarUsuarios([usuarioBase, otroUsuario])

    mostrar('/admin/usuario-form?rut=1000005K')

    cambiar('Nombre', 'Maria Actualizada')

    enviarFormulario()

    const usuarios = obtenerGuardados()

    expect(usuarios).toHaveLength(2)

    expect(usuarios[0].nombre).toBe('Maria Actualizada')
    expect(usuarios[1]).toEqual(otroUsuario)
  })

  // ==========================================
  // TEST 16: EDITAR USUARIO INEXISTENTE
  // ==========================================

  test('muestra error al editar un usuario inexistente', () => {
    mostrar('/admin/usuario-form?rut=9999999K')

    completarFormulario({
      rut: '9999999K'
    })

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se encontró el usuario.'
    )

    expect(obtenerGuardados()).toHaveLength(0)
  })

  // ==========================================
  // TEST 17: TIPO DE USUARIO INVÁLIDO
  // ==========================================

  test('rechaza un tipo de usuario inválido', () => {
    guardarUsuarios([
      {
        ...usuarioBase,
        tipoUsuario: 'Invitado'
      }
    ])

    mostrar('/admin/usuario-form?rut=1000005K')

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecciona un tipo de usuario válido.'
    )
  })

  // ==========================================
  // TEST 18: REGIÓN Y COMUNA INVÁLIDAS
  // ==========================================

  test('rechaza una región y comuna incompatibles', () => {
    guardarUsuarios([
      {
        ...usuarioBase,
        region: 'Valparaíso',
        comuna: 'Santiago'
      }
    ])

    mostrar('/admin/usuario-form?rut=1000005K')

    enviarFormulario()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecciona una región y comuna válidas.'
    )
  })

  // ==========================================
  // TEST 19: LIMPIAR ERROR
  // ==========================================

  test('limpia el mensaje de error al modificar un campo', () => {
    mostrar()

    enviarFormulario()

    expect(screen.getByRole('alert')).toBeInTheDocument()

    cambiar('Nombre', 'Maria')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // ==========================================
  // TEST 20: CANCELAR
  // ==========================================

  test('permite cancelar sin guardar información', () => {
    mostrar()

    cambiar('Nombre', 'Usuario temporal')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cancelar'
      })
    )

    expect(
      screen.getByText('Listado de usuarios')
    ).toBeInTheDocument()

    expect(obtenerGuardados()).toHaveLength(0)
  })

  // ==========================================
  // TEST 21: LOCALSTORAGE CON JSON INVÁLIDO
  // ==========================================

  test('maneja correctamente datos JSON inválidos', () => {
    localStorage.setItem('usuarios', '{dato-invalido')

    mostrar()

    completarFormulario()
    enviarFormulario()

    expect(obtenerGuardados()).toHaveLength(1)
  })

  // ==========================================
  // TEST 22: LOCALSTORAGE SIN ARREGLO
  // ==========================================

  test('maneja localStorage cuando no contiene un arreglo', () => {
    localStorage.setItem(
      'usuarios',
      JSON.stringify({ nombre: 'Dato incorrecto' })
    )

    mostrar()

    completarFormulario()
    enviarFormulario()

    expect(obtenerGuardados()).toHaveLength(1)
  })

  // ==========================================
  // TEST 23: CORREO DUOC PERMITIDO
  // ==========================================

  test.each([
    'alumno@duoc.cl',
    'docente@profesor.duoc.cl'
  ])('acepta el dominio permitido %s', (correo) => {
    mostrar()

    completarFormulario({ correo })
    enviarFormulario()

    expect(obtenerGuardados()).toHaveLength(1)

    expect(obtenerGuardados()[0].correo).toBe(correo)
  })
})
