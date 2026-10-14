
 // REGIONES Y COMUNAS DISPONIBLES
export const regionesComunas = {
  'Región Metropolitana': [
    'Santiago',
    'Providencia',
    'Las Condes',
    'Ñuñoa',
    'Maipú',
    'Puente Alto'
  ],
  Valparaíso: [
    'Valparaíso',
    'Viña del Mar',
    'Quilpué',
    'Villa Alemana',
    'Quillota'
  ],
  Biobío: [
    'Concepción',
    'Talcahuano',
    'Chiguayante',
    'San Pedro de la Paz',
    'Los Ángeles'
  ],
  'La Araucanía': [
    'Temuco',
    'Padre Las Casas',
    'Villarrica',
    'Pucón',
    'Angol'
  ],
  'Los Lagos': [
    'Puerto Montt',
    'Puerto Varas',
    'Osorno',
    'Castro',
    'Ancud'
  ]
}

// FORMATEAR FECHA PARA EL CALENDARIO HTML
export function formatearFecha(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

// VALIDAR FECHA DE NACIMIENTO
export function validarFechaNacimiento(fechaNacimiento) {

  // COMPROBAR CAMPO OBLIGATORIO
  if (!fechaNacimiento) {
    return 'La fecha de nacimiento es obligatoria.'
  }

  const [anio, mes, dia] = fechaNacimiento
    .split('-')
    .map(Number)

  const fecha = new Date(anio, mes - 1, dia)

  // COMPROBAR QUE LA FECHA EXISTA
  if (
    !anio ||
    !mes ||
    !dia ||
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return 'Ingresa una fecha de nacimiento válida.'
  }

  // OBTENER FECHA ACTUAL
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // RECHAZAR FECHAS FUTURAS
  if (fecha > hoy) {
    return 'La fecha de nacimiento no puede ser futura.'
  }

  // CALCULAR EDAD
  let edad = hoy.getFullYear() - anio

  if (
    hoy.getMonth() + 1 < mes ||
    (
      hoy.getMonth() + 1 === mes &&
      hoy.getDate() < dia
    )
  ) {
    edad--
  }

  // VALIDAR EDAD MÍNIMA
  if (edad < 18) {
    return 'Debes tener 18 años o más para crear una cuenta.'
  }

  // SIN ERRORES
  return ''
}
