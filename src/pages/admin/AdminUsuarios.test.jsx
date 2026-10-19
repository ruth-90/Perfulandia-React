import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import AdminUsuarios from './AdminUsuarios.jsx'

const usuarios = [
  { rut: '1000005K', nombre: 'Maria', apellidos: 'Perez', correo: 'maria@gmail.com', tipoUsuario: 'Cliente' },
  { rut: '2000008K', nombre: 'Pedro', apellidos: 'Lopez', correo: 'pedro@gmail.com', tipoUsuario: 'Cliente' }
]
const mostrar = () => render(<MemoryRouter><AdminUsuarios /></MemoryRouter>)

describe('AdminUsuarios', () => {
  beforeEach(() => localStorage.setItem('usuarios', JSON.stringify(usuarios)))
  afterEach(() => vi.restoreAllMocks())

  test('muestra cuentas guardadas y enlaces de edición', () => {
    mostrar()
    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
    expect(screen.getByText('Pedro')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /editar/i })).toHaveLength(2)
  })
  
  test('no elimina un usuario si cancela la confirmación', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    mostrar()
    await user.click(screen.getAllByRole('button', { name: /eliminar/i })[0])
    expect(JSON.parse(localStorage.getItem('usuarios'))).toHaveLength(2)
  })
})
