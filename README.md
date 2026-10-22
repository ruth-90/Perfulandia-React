
# Perfulandia-React

## Descripción del proyecto

Perfulandia es una aplicación web de comercio electrónico orientada a la venta de perfumes.

Fue desarrollada como proyecto académico de la asignatura Desarrollo Fullstack II, utilizando React y Vite.

La aplicación permite explorar un catálogo de perfumes, consultar información de los productos, utilizar un carrito de compras y acceder a funcionalidades de administración.

## Integrantes del equipo

- Ruth
- Darling
- Polette

## Tecnologías utilizadas

- React
- Vite
- JavaScript
- HTML5
- CSS3
- Bootstrap
- React Router
- Vitest
- React Testing Library

## Funcionalidades implementadas

### Tienda virtual

- Página de inicio con carruseles y productos destacados.
- Catálogo de perfumes.
- Búsqueda y filtrado de productos.
- Visualización del detalle de cada perfume.
- Carrito de compras.
- Control de cantidades según el stock disponible.
- Formulario de contacto.
- Páginas informativas: Nosotros y Blog.

### Gestión de usuarios

- Formulario de registro.
- Inicio de sesión con cuentas de demostración.
- Validaciones de campos obligatorios.
- Validación de formato de RUT y correo electrónico.
- Restricción de edad mínima de 18 años.
- Validación de dominios de correo permitidos.
- Mensajes de error en los formularios.
- Cierre de sesión.

### Panel administrativo

- Panel principal con información del inventario.
- Listado y búsqueda de productos.
- Creación y modificación de productos.
- Administración de usuarios.
- Creación, edición y eliminación de usuarios.
- Validación de datos y detección de duplicados.
- Acceso a rutas administrativas según la sesión de demostración.
- Navegación entre el panel administrativo y la tienda.

## Estructura del proyecto

El proyecto utiliza una organización basada en componentes de React.

```text
src/
├── components/    # Componentes reutilizables
├── pages/         # Páginas de la tienda y administración
│   └── admin/     # Vistas administrativas
├── data/          # Datos y configuraciones de demostración
├── services/      # Funciones de almacenamiento
├── styles/        # Archivos CSS
├── test/          # Configuración de pruebas
├── App.jsx        # Rutas y estado principal
└── main.jsx       # Punto de entrada
```

## Instalación y ejecución

### Requisitos

- Node.js y npm
- Visual Studio Code u otro editor de código
- Navegador web

### 1. Clonar el repositorio

```bash
git clone https://github.com/ruth-90/Perfulandia-React.git
```

### 2. Ingresar al proyecto

```bash
cd Perfulandia-React
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Ejecutar la aplicación

```bash
npm run dev
```

Abrir la dirección local que indique Vite, normalmente:

http://localhost:5173/

## Cuentas de demostración

### Administrador

- Correo: admin@duoc.cl
- Contraseña: 1234

### Cliente 1

- Correo: cliente1@gmail.com
- Contraseña: 1234

### Cliente 2

- Correo: cliente2@duoc.cl
- Contraseña: 5678

**Nota:** estas credenciales son exclusivamente para demostración académica.

## Pruebas automatizadas

Se implementaron pruebas con Vitest y React Testing Library para comprobar el comportamiento de componentes, páginas, formularios, funcionalidades administrativas y servicios.

Para ejecutar las pruebas:

```bash
npx vitest run
```

### Últimos resultados verificados

- 28 archivos de pruebas aprobados.
- 184 pruebas automatizadas aprobadas.
- 0 pruebas fallidas.

## Cobertura de pruebas

Para generar el informe de cobertura:

```bash
npm run test:coverage
```

Resultados de la última medición:

| Métrica | Cobertura |
|---|---:|
| Sentencias | 92,64 % |
| Condiciones | 86,08 % |
| Funciones | 91,92 % |
| Líneas | 92,65 % |

El informe visual se genera en:

```text
coverage/index.html
```

En Windows, puede abrirse mediante:

```powershell
start coverage/index.html
```

La cobertura muestra qué partes del código fueron ejecutadas durante las pruebas. Un porcentaje alto no garantiza por sí solo que la aplicación esté libre de errores.

## Almacenamiento y limitaciones

Esta versión es un proyecto académico desarrollado principalmente en el frontend.

Se utiliza `localStorage` para persistir información de demostración, como productos, usuarios y carrito de compras.

La sesión administrativa de demostración utiliza `sessionStorage`.

El proyecto no dispone de una autenticación de producción respaldada por un servidor. Las cuentas de demostración se utilizan para comprobar los flujos de inicio de sesión.

## Repositorio

https://github.com/ruth-90/Perfulandia-React

## Proyecto académico

Desarrollo Fullstack II — Duoc UC

2026
