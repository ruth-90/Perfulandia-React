
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

import { iniciarSesion } from '../services/api.js'
import { leerSesion } from '../services/sesion.js'
import LoginForm from './LoginForm.jsx'

// SIMULAR LA NAVEGACIÓN DE REACT ROUTER
const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn()
}))

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate
}))

vi.mock('../services/api.js', () => ({ iniciarSesion: vi.fn() }))

// PRUEBAS DEL FORMULARIO DE INICIO DE SESIÓN
describe('LoginForm - Perfulandia', () => {

  // LIMPIAR LOS DATOS ANTES DE CADA PRUEBA
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mockNavigate.mockReset()
    iniciarSesion.mockReset()
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
  async function enviarLogin(correo, password) {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/correo electrónico/i), correo)
    await user.type(screen.getByLabelText(/^contraseña$/i), password)
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))
  }

  test.each([['ADMINISTRADOR', '/admin'], ['CLIENTE', '/productos'], ['VENDEDOR', '/pedidos']])(
    'guarda el JWT y dirige al usuario con rol %s', async (rol, destino) => {
      const usuario = { id: 3, nombre: 'Usuario', correo: 'prueba@perfulandia.cl', rol, token: 'jwt-de-prueba' }
      iniciarSesion.mockResolvedValue(usuario)
      const onLogin = vi.fn()
      render(<LoginForm onLogin={onLogin} />)
      await enviarLogin(usuario.correo, 'contraseña-de-prueba')
      expect(iniciarSesion).toHaveBeenCalledWith({ correo: usuario.correo, password: 'contraseña-de-prueba' })
      expect(leerSesion()).toEqual(usuario)
      expect(onLogin).toHaveBeenCalledWith(usuario)
      expect(mockNavigate).toHaveBeenCalledWith(destino)
    }
  )

  test('muestra el rechazo de las credenciales y no guarda una sesión', async () => {
    iniciarSesion.mockRejectedValue({ response: { status: 401 } })
    render(<LoginForm />)
    await enviarLogin('prueba@perfulandia.cl', 'contraseña-de-prueba')
    expect(await screen.findByText('Correo o contraseña incorrectos.')).toBeInTheDocument()
    expect(leerSesion()).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
