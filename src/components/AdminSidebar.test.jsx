import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import AdminSidebar from './AdminSidebar.jsx'

function mostrarSidebar(ruta = '/admin') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="*" element={<AdminSidebar />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminSidebar', () => {
  beforeEach(() => sessionStorage.clear())

  test('incluye enlaces a las secciones del administrador', () => {
    mostrarSidebar()
    const rutas = [
      ['Inicio', '/admin'], ['Ver productos', '/admin/productos'],
      ['Crear producto', '/admin/producto-form'],
      ['Ver usuarios', '/admin/usuarios'], ['Crear usuario', '/admin/usuario-form'],
      ['Volver a la tienda', '/']
    ]
    rutas.forEach(([nombre, ruta]) => {
      expect(screen.getByRole('link', { name: nombre })).toHaveAttribute('href', ruta)
    })
  })

  test('marca como activo el enlace correspondiente a la ruta', () => {
    mostrarSidebar('/admin/productos')
    expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveClass('active')
    expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveClass('active')
  })

  test('cierra la sesión administrativa y vuelve al login', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem('adminActivo', 'true')
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminSidebar />
        <Routes><Route path="/login" element={<h1>Login de destino</h1>} /></Routes>
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))
    expect(sessionStorage.getItem('adminActivo')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Login de destino' })).toBeInTheDocument()
  })
})
