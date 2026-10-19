import { describe, test, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AdminUsuarioForm from './AdminUsuarioForm.jsx'

const mostrar = (ruta = '/admin/usuario-form') => render(
  <MemoryRouter initialEntries={[ruta]}><AdminUsuarioForm /></MemoryRouter>
)

describe('AdminUsuarioForm', () => {
  beforeEach(() => localStorage.clear())
  test('muestra los campos principales para crear usuario', () => {
    mostrar()
    expect(screen.getByRole('heading', { name: 'Crear usuario' })).toBeInTheDocument()
    for (const label of ['RUT', 'Nombre', 'Apellidos', 'Correo electrónico', 'Región', 'Comuna', 'Dirección']) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'Crear usuario' })).toBeInTheDocument()
  })
  test('permite abrir el formulario en modo edición', () => {
    localStorage.setItem('usuarios', JSON.stringify([{ rut: '1000005K', nombre: 'Maria', apellidos: 'Perez', correo: 'maria@gmail.com', tipoUsuario: 'Cliente', fechaNacimiento: '1998-01-15', region: 'Región Metropolitana', comuna: 'Santiago', direccion: 'Principal 123' }]))
    mostrar('/admin/usuario-form?rut=1000005K')
    expect(screen.getByRole('heading', { name: 'Editar usuario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Maria')
  })
})
