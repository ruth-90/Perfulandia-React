import { describe, test, expect, beforeEach } from 'vitest'
import { obtenerUsuarios, guardarUsuario, eliminarUsuario } from './usuariosStorage.js'

describe('usuariosStorage - gestión de usuarios', () => {
  beforeEach(() => localStorage.clear())

  test('retorna arreglo vacío si no hay datos', () => {
    expect(obtenerUsuarios()).toEqual([])
  })

  test('crea y recupera usuarios', () => {
    guardarUsuario({ rut: '1000005K', nombre: 'Maria' })
    expect(obtenerUsuarios()).toEqual([{ rut: '1000005K', nombre: 'Maria' }])
  })

  test('rechaza RUT duplicado incluso con distinta capitalización', () => {
    guardarUsuario({ rut: '1000005K', nombre: 'Maria' })
    expect(() => guardarUsuario({ rut: '1000005k', nombre: 'Ana' })).toThrow('Este RUN ya está registrado.')
  })

  test('edita un usuario existente sin eliminar los demás atributos', () => {
    guardarUsuario({ rut: '1000005K', nombre: 'Maria', correo: 'maria@gmail.com' })
    guardarUsuario({ rut: '22222222K', nombre: 'Pedro' })
    guardarUsuario({ rut: '1000005K', nombre: 'Maria Editada' }, '1000005K')
    expect(obtenerUsuarios()[0]).toEqual({ rut: '1000005K', nombre: 'Maria Editada', correo: 'maria@gmail.com' })
    expect(obtenerUsuarios()).toHaveLength(2)
  })

  test('rechaza editar un usuario que no existe', () => {
    expect(() => guardarUsuario({ rut: '1000005K', nombre: 'Maria' }, 'no-existe')).toThrow('El usuario que intentas editar ya no existe.')
  })

  test('elimina un usuario conservando al resto', () => {
    guardarUsuario({ rut: '11111111K', nombre: 'Maria' })
    guardarUsuario({ rut: '22222222K', nombre: 'Pedro' })
    eliminarUsuario('11111111K')
    expect(obtenerUsuarios()).toEqual([{ rut: '22222222K', nombre: 'Pedro' }])
  })

  test('rechaza almacenamiento con estructura incorrecta', () => {
    localStorage.setItem('usuarios', JSON.stringify({ rut: '123' }))
    expect(() => obtenerUsuarios()).toThrow('El formato de los usuarios guardados no es válido.')
  })
})
