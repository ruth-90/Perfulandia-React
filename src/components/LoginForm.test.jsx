
import {
  describe,
  test,
  expect,
  beforeEach,
  vi
} from 'vitest'

import {
  render,
  screen
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import LoginForm from './LoginForm.jsx'

// SIMULAR LA NAVEGACIÓN DE REACT ROUTER
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}))

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}))

// PRUEBAS DEL FORMULARIO DE INICIO DE SESIÓN
describe('LoginForm - Perfulandia', () => {

  // LIMPIAR LOS DATOS ANTES DE CADA PRUEBA
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockNavigate.mockReset()
  })

  // PRUEBA 1: MOSTRAR LOS CAMPOS
  test('muestra correo y contraseña', () => {

    render(<LoginForm />)

    expect(
      screen.getByLabelText('Correo electrónico')
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText('Contraseña')
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Iniciar sesión'
      })
    ).toBeInTheDocument()

  })

  // PRUEBA 2: CAMPOS OBLIGATORIOS
  test('muestra errores al enviar campos vacíos', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión'
      })
    )

    expect(
      screen.getByText(
        'El correo electrónico es obligatorio.'
      )
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'La contraseña es obligatoria.'
      )
    ).toBeInTheDocument()

  })

  // PRUEBA 3: CORREO CON FORMATO INVÁLIDO
  test('detecta un correo con formato inválido', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'correo-invalido'
    )

    await user.tab()

    expect(
      screen.getByText(
        'Ingresa un correo electrónico válido.'
      )
    ).toBeInTheDocument()

  })

  // PRUEBA 4: DOMINIO NO PERMITIDO
  test('rechaza correos no autorizados', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'usuario@outlook.com'
    )

    await user.tab()

    expect(
      screen.getByText(
        /Solo se permiten correos/i
      )
    ).toBeInTheDocument()

  })

  // PRUEBA 5: CONTRASEÑA CORTA
  test('rechaza contraseñas menores a 4 caracteres', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(
      screen.getByLabelText('Contraseña'),
      '123'
    )

    await user.tab()

    expect(
      screen.getByText(
        'La contraseña debe tener al menos 4 caracteres.'
      )
    ).toBeInTheDocument()

  })

  // PRUEBA 6: MOSTRAR Y OCULTAR CONTRASEÑA
  test('permite mostrar y ocultar la contraseña', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    const inputContrasena =
      screen.getByLabelText('Contraseña')

    // COMPROBAR QUE LA CONTRASEÑA ESTÁ OCULTA
    expect(inputContrasena).toHaveAttribute(
      'type',
      'password'
    )

    // MOSTRAR CONTRASEÑA
    await user.click(
      screen.getByLabelText('Mostrar contraseña')
    )

    expect(inputContrasena).toHaveAttribute(
      'type',
      'text'
    )

    // OCULTAR CONTRASEÑA NUEVAMENTE
    await user.click(
      screen.getByLabelText('Mostrar contraseña')
    )

    expect(inputContrasena).toHaveAttribute(
      'type',
      'password'
    )

  })

  // PRUEBA 7: INGRESO DEL ADMINISTRADOR
  test('permite ingresar como administrador', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    // INGRESAR CREDENCIALES DEL ADMINISTRADOR DEMO
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'admin@duoc.cl'
    )

    await user.type(
      screen.getByLabelText('Contraseña'),
      '1234'
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión'
      })
    )

    // COMPROBAR MENSAJE
    expect(
      screen.getByText(
        'Ingreso administrador correcto.'
      )
    ).toBeInTheDocument()

    // COMPROBAR NAVEGACIÓN
    expect(mockNavigate).toHaveBeenCalledWith(
      '/admin'
    )

    // COMPROBAR SESIÓN DEMO
    expect(
      sessionStorage.getItem('adminActivo')
    ).toBe('true')

  })

  // PRUEBA 8: USUARIO NO REGISTRADO
  test('muestra error cuando el usuario no existe', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    // INGRESAR UN CORREO QUE NO EXISTE
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'desconocido@gmail.com'
    )

    await user.type(
      screen.getByLabelText('Contraseña'),
      '1234'
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión'
      })
    )

    // COMPROBAR EL MENSAJE REAL DEL LOGIN
    expect(
      screen.getByText(
        'Correo o contraseña incorrectos.'
      )
    ).toBeInTheDocument()

    // NO DEBE NAVEGAR
    expect(mockNavigate).not.toHaveBeenCalled()

    // NO DEBE CREAR UNA SESIÓN
    expect(
      localStorage.getItem('clienteActivo')
    ).toBeNull()

    expect(
      sessionStorage.getItem('adminActivo')
    ).toBeNull()

  })

  // PRUEBA 9: INGRESO DE CLIENTE DEMO
  test('permite ingresar a un cliente registrado', async () => {

    const user = userEvent.setup()
    render(<LoginForm />)

    // UTILIZAR UN CLIENTE QUE EXISTE EN usuariosDemo.js
    await user.type(
      screen.getByLabelText('Correo electrónico'),
      'cliente1@gmail.com'
    )

    await user.type(
      screen.getByLabelText('Contraseña'),
      '1234'
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Iniciar sesión'
      })
    )

    // COMPROBAR MENSAJE
    expect(
      screen.getByText(
        'Ingreso cliente correcto.'
      )
    ).toBeInTheDocument()

    // COMPROBAR NAVEGACIÓN
    expect(mockNavigate).toHaveBeenCalledWith(
      '/productos'
    )

    // COMPROBAR CLIENTE ACTIVO
    expect(
      JSON.parse(localStorage.getItem('clienteActivo'))
    ).toEqual({
      nombre: 'Cliente Uno',
      correo: 'cliente1@gmail.com'
    })

    // EL CLIENTE NO DEBE TENER SESIÓN ADMINISTRATIVA
    expect(
      sessionStorage.getItem('adminActivo')
    ).toBeNull()

  })

})
