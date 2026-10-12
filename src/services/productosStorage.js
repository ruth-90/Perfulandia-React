// =======================================================
// FUENTE DE DATOS Y CRUD CON PERSISTENCIA (LOCALSTORAGE)
// Requisito Evaluación 2: Simulación de base de datos
// =======================================================

const productosIniciales = [
  {
    id: 1,
    nombre: "ASAD de Lattafa EDP 100 ML",
    categoria: "Hombre",
    precio: 39990,
    stock: 12,
    imagen: "/img/Perfume1.webp",
    descripcion: "Fragancia intensa, elegante y especiada, ideal para ocasiones especiales."
  },
  {
    id: 2,
    nombre: "Club de Nuit Woman EDP 105 ML Mujer de Armaf",
    categoria: "Mujer",
    precio: 44990,
    stock: 8,
    imagen: "/img/Perfume3.webp",
    descripcion: "Fragancia femenina con notas florales, frutales y sofisticadas."
  },
  {
    id: 3,
    nombre: "Armaf Club de Nuit Intense EDT 105 ML",
    categoria: "Hombre",
    precio: 49990,
    stock: 10,
    imagen: "/img/Perfume2.webp",
    descripcion: "Una fragancia intensa con notas cítricas, amaderadas y elegantes."
  },
  {
    id: 4,
    nombre: "Azzaro The Most Wanted Intense EDT 100 ML",
    categoria: "Hombre",
    precio: 64990,
    stock: 6,
    imagen: "/img/Perfume11.webp",
    descripcion: "Fragancia masculina intensa, cálida y sofisticada."
  },
  {
    id: 5,
    nombre: "Ô OUI EDT 100 ML Lancôme",
    categoria: "Mujer",
    precio: 35990,
    stock: 15,
    imagen: "/img/Perfume4.webp",
    descripcion: "Fragancia fresca y femenina, perfecta para el uso diario."
  },
  {
    id: 6,
    nombre: "Paco Rabanne Olympea",
    categoria: "Mujer",
    precio: 39990,
    stock: 9,
    imagen: "/img/Perfume5.webp",
    descripcion: "Fragancia femenina elegante, intensa y sofisticada."
  },
  {
    id: 7,
    nombre: "Liquid Brun French Avenue",
    categoria: "Unisex",
    precio: 42990,
    stock: 11,
    imagen: "/img/Perfume6.webp",
    descripcion: "Fragancia cálida y envolvente con un aroma moderno y sofisticado."
  },
  {
    id: 8,
    nombre: "Yara Tous EDP 100 ML Mujer",
    categoria: "Mujer",
    precio: 45990,
    stock: 7,
    imagen: "/img/Perfume7.webp",
    descripcion: "Fragancia femenina dulce, tropical y elegante."
  },
  {
    id: 9,
    nombre: "Power Of You EDP 50 ML",
    categoria: "Mujer",
    precio: 49990,
    stock: 5,
    imagen: "/img/Perfume8.webp",
    descripcion: "Fragancia moderna y femenina con un aroma intenso y atractivo."
  },
  {
    id: 10,
    nombre: "Sapphire Gemstone EDP",
    categoria: "Unisex",
    precio: 54990,
    stock: 4,
    imagen: "/img/Perfume9.webp",
    descripcion: "Fragancia elegante con notas sofisticadas y una esencia duradera."
  },
  {
    id: 11,
    nombre: "Taj Mahal Wow EDP 100 ML",
    categoria: "Unisex",
    precio: 59990,
    stock: 3,
    imagen: "/img/Perfume10.webp",
    descripcion: "Fragancia intensa y sofisticada con un aroma elegante y distintivo."
  },
  {
    id: 12,
    nombre: "Armaf Odyssey Mandarin Sky Limited Edit. EDP 100 ML",
    categoria: "Unisex",
    precio: 59990,
    stock: 0,
    imagen: "/img/Perfume12.webp",
    descripcion: "Fragancia intensa y sofisticada con un aroma elegante y distintivo."
  }
]

const STORAGE_KEY = 'productosAdmin'

// 1. LEER (READ): Obtener todos los productos
export function obtenerProductos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    // Si no existe, inicializar con los productos base
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productosIniciales))
    return productosIniciales
  } catch (error) {
    console.error('Error al leer productos de localStorage:', error)
    return productosIniciales
  }
}

// 2. LEER UNO (READ BY ID): Obtener un producto por ID
export function obtenerProductoPorId(id) {
  const lista = obtenerProductos()
  return lista.find((item) => Number(item.id) === Number(id)) || null
}

// 3. CREAR (CREATE): Agregar un nuevo producto
export function crearProducto(datos) {
  const lista = obtenerProductos()
  const nuevoProducto = {
    id: Date.now(),
    nombre: datos.nombre.trim(),
    categoria: datos.categoria || 'Unisex',
    precio: Number(datos.precio) || 0,
    stock: Number(datos.stock) || 0,
    imagen: datos.imagen.trim() || '/img/Perfume1.webp',
    descripcion: datos.descripcion.trim() || ''
  }
  const listaActualizada = [nuevoProducto, ...lista]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaActualizada))
  return nuevoProducto
}

// 4. ACTUALIZAR (UPDATE): Editar un producto existente
export function actualizarProducto(id, datosActualizados) {
  const lista = obtenerProductos()
  const index = lista.findIndex((item) => Number(item.id) === Number(id))
  if (index === -1) return null

  lista[index] = {
    ...lista[index],
    nombre: datosActualizados.nombre.trim(),
    categoria: datosActualizados.categoria,
    precio: Number(datosActualizados.precio),
    stock: Number(datosActualizados.stock),
    imagen: datosActualizados.imagen.trim(),
    descripcion: datosActualizados.descripcion.trim()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  return lista[index]
}

// 5. ELIMINAR (DELETE): Borrar un producto
export function eliminarProducto(id) {
  const lista = obtenerProductos()
  const listaFiltrada = lista.filter((item) => Number(item.id) !== Number(id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listaFiltrada))
  return true
}

// 6. ESTADÍSTICAS: Para el Dashboard de administración
export function obtenerEstadisticas() {
  const lista = obtenerProductos()
  const totalProductos = lista.length
  const stockTotal = lista.reduce((acc, p) => acc + Number(p.stock || 0), 0)
  const sinStock = lista.filter((p) => Number(p.stock || 0) === 0).length

  return { totalProductos, stockTotal, sinStock }
}

// 7. FORMATO MONEDA CLP
export function formatearPrecio(precio) {
  return `$${Number(precio || 0).toLocaleString('es-CL')}`
}

