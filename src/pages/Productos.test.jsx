// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// PÁGINA PRODUCTOS
// =============================================

// HERRAMIENTAS DE VITEST
import {
  describe,
  test,
  expect,
  beforeEach,
  vi
} from "vitest";

// HERRAMIENTAS DE TESTING LIBRARY
import {
  render,
  screen
} from "@testing-library/react";

// SIMULAR ACCIONES DEL USUARIO
import userEvent from "@testing-library/user-event";

// COMPONENTE QUE VAMOS A PROBAR
import Productos from "./Productos.jsx";

// SERVICIO DE PRODUCTOS
import { obtenerProductos } from "../services/productosStorage.js";


// =============================================
// SIMULAR EL SERVICIO DE PRODUCTOS
// =============================================

vi.mock("../services/productosStorage.js", () => ({
  obtenerProductos: vi.fn()
}));


// =============================================
// SIMULAR LA TARJETA DE PRODUCTO
// =============================================

vi.mock("../components/ProductoCatalogoCard.jsx", () => ({
  default: ({ producto, onAgregar }) => (
    <div data-testid={`producto-${producto.id}`}>

      <h2>{producto.nombre}</h2>

      <button
        type="button"
        onClick={() => onAgregar(producto)}
      >
        Agregar {producto.nombre}
      </button>

    </div>
  )
}));


// =============================================
// DATOS DE PRUEBA
// =============================================

const productosSimulados = [
  {
    id: 1,
    nombre: "Rosa Floral",
    categoria: "Mujer",
    precio: 29990
  },
  {
    id: 2,
    nombre: "Bosque Intenso",
    categoria: "Hombre",
    precio: 38990
  },
  {
    id: 3,
    nombre: "Brisa",
    categoria: "Unisex",
    precio: 34990
  }
];


// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("Página Productos - Perfulandia", () => {

  // PREPARACIÓN ANTES DE CADA PRUEBA
  beforeEach(() => {

    // Limpiar historial de los mocks
    vi.clearAllMocks();

    // Preparar los productos simulados
    vi.mocked(obtenerProductos)
      .mockReturnValue(productosSimulados);

  });


  // =========================================
  // PRUEBA 1: MOSTRAR PRODUCTOS
  // =========================================

  test("muestra los productos del catálogo", () => {

    // PREPARAR
    const onAgregarProducto = vi.fn();

    render(
      <Productos onAgregarProducto={onAgregarProducto} />
    );

    // COMPROBAR
    expect(obtenerProductos).toHaveBeenCalled();

    expect(
      screen.getByText("Rosa Floral")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Bosque Intenso")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Brisa")
    ).toBeInTheDocument();

  });


  // =========================================
  // PRUEBA 2: BUSCAR PRODUCTOS
  // =========================================

  test("filtra productos por nombre", async () => {

    // PREPARAR
    const user = userEvent.setup();

    render(
      <Productos onAgregarProducto={vi.fn()} />
    );

    // ACTUAR
    await user.type(
      screen.getByRole("textbox", {
        name: "Buscar perfume"
      }),
      "Rosa"
    );

    // COMPROBAR
    expect(
      screen.getByText("Rosa Floral")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Bosque Intenso")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Brisa")
    ).not.toBeInTheDocument();

  });


  // =========================================
  // PRUEBA 3: FILTRAR POR CATEGORÍA
  // =========================================

  test("filtra productos por categoría", async () => {

    // PREPARAR
    const user = userEvent.setup();

    render(
      <Productos onAgregarProducto={vi.fn()} />
    );

    // ACTUAR
    await user.selectOptions(
      screen.getByRole("combobox"),
      "Hombre"
    );

    // COMPROBAR
    expect(
      screen.getByText("Bosque Intenso")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Rosa Floral")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Brisa")
    ).not.toBeInTheDocument();

  });


  // =========================================
  // PRUEBA 4: PRODUCTO NO ENCONTRADO
  // =========================================

  test("muestra mensaje cuando no encuentra productos", async () => {

    // PREPARAR
    const user = userEvent.setup();

    render(
      <Productos onAgregarProducto={vi.fn()} />
    );

    // ACTUAR
    await user.type(
      screen.getByRole("textbox", {
        name: "Buscar perfume"
      }),
      "Perfume inexistente"
    );

    // COMPROBAR
    expect(
      screen.getByText("No encontramos productos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Intenta buscar otro perfume.")
    ).toBeInTheDocument();

  });


  // =========================================
  // PRUEBA 5: AGREGAR AL CARRITO
  // =========================================

  test("ejecuta la función al agregar un producto", async () => {

    // PREPARAR
    const user = userEvent.setup();

    const onAgregarProducto = vi.fn();

    render(
      <Productos onAgregarProducto={onAgregarProducto} />
    );

    // ACTUAR
    await user.click(
      screen.getByRole("button", {
        name: "Agregar Rosa Floral"
      })
    );

    // COMPROBAR
    expect(
      onAgregarProducto
    ).toHaveBeenCalledWith(productosSimulados[0]);

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Rosa Floral fue agregado al carrito."
    );

  });


  // =========================================
  // PRUEBA 6: CERRAR MENSAJE
  // =========================================

  test("permite cerrar el mensaje de confirmación", async () => {

    // PREPARAR
    const user = userEvent.setup();

    render(
      <Productos onAgregarProducto={vi.fn()} />
    );

    // ACTUAR
    await user.click(
      screen.getByRole("button", {
        name: "Agregar Brisa"
      })
    );

    // COMPROBAR MENSAJE
    expect(
      screen.getByRole("status")
    ).toBeInTheDocument();

    // ACTUAR NUEVAMENTE
    await user.click(
      screen.getByRole("button", {
        name: "Cerrar mensaje"
      })
    );

    // COMPROBAR
    expect(
      screen.queryByRole("status")
    ).not.toBeInTheDocument();

  });


  // =========================================
  // PRUEBA 7: CATÁLOGO VACÍO
  // =========================================

  test("muestra aviso cuando no existen productos", () => {

    // PREPARAR
    vi.mocked(obtenerProductos).mockReturnValue([]);

    render(
      <Productos onAgregarProducto={vi.fn()} />
    );

    // COMPROBAR
    expect(
      screen.getByText("No encontramos productos")
    ).toBeInTheDocument();

  });

});