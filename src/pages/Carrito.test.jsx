// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE CARRITO
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
    screen,
    fireEvent,
    within
} from "@testing-library/react";

// SIMULAR ACCIONES DEL USUARIO
import userEvent from "@testing-library/user-event";

// SIMULAR REACT ROUTER
import { MemoryRouter } from "react-router";

// COMPONENTE QUE VAMOS A PROBAR
import Carrito from "./Carrito.jsx";

// SERVICIO DE PRODUCTOS
import { crearPedido } from "../services/api.js";


// =============================================
// SIMULAR CONSULTA DE INVENTARIO
// =============================================

vi.mock("../services/api.js", () => ({
    crearPedido: vi.fn()
}));


// =============================================
// PRODUCTO SIMULADO PARA LAS PRUEBAS
// =============================================

const productoSimulado = {
    id: 1,
    nombre: "Rosa Floral",
    precio: 19990,
    cantidad: 1,
    imagen: "/img/rosa-floral.jpg",
    stock: 5
};


// =============================================
// FUNCIÓN PARA PREPARAR EL CARRITO
// =============================================

function renderizarCarrito(productos = [productoSimulado]) {

    const funciones = {
        onModificarCantidad: vi.fn(),
        onEliminarProducto: vi.fn(),
        onVaciarCarrito: vi.fn()
    };

    render(
        <MemoryRouter>
            <Carrito
                carrito={productos}
                usuarioActivo={{ rol: "CLIENTE" }}
                {...funciones}
            />
        </MemoryRouter>
    );

    return funciones;
}


// =============================================
// COMPLETAR FORMULARIO DE COMPRA
// =============================================

async function completarFormulario(user) {

    await user.type(
        screen.getByLabelText("Nombre completo"),
        "Maria Perez"
    );

    await user.type(
        screen.getByLabelText("Correo electrónico"),
        "maria@gmail.com"
    );

    await user.type(
        screen.getByLabelText("Teléfono"),
        "912345678"
    );

    await user.selectOptions(
        screen.getByLabelText("Región"),
        "Región Metropolitana"
    );

    await user.selectOptions(
        screen.getByLabelText("Comuna"),
        "Santiago"
    );

    await user.type(
        screen.getByLabelText("Dirección de despacho"),
        "Av. Principal 123"
    );

    await user.selectOptions(
        screen.getByLabelText("Método de pago"),
        "Transferencia Electrónica"
    );

}


// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("Carrito de Compras - Perfulandia", () => {

    // PREPARACIÓN ANTES DE CADA PRUEBA
    beforeEach(() => {

        vi.clearAllMocks();

    });


    // =========================================
    // PRUEBA 1: CARRITO VACÍO
    // =========================================

    test("muestra mensaje cuando el carrito está vacío", () => {

        // PREPARAR
        renderizarCarrito([]);

        // COMPROBAR
        expect(
            screen.getByText("Tu carrito está vacío")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: "Explorar catálogo de perfumes"
            })
        ).toHaveAttribute("href", "/productos");

    });


    // =========================================
    // PRUEBA 2: MOSTRAR PRODUCTOS Y TOTAL
    // =========================================

    test("muestra el producto y calcula el total", () => {

        // PREPARAR
        renderizarCarrito();

        // COMPROBAR PRODUCTO
        expect(
            screen.getByText("Rosa Floral")
        ).toBeInTheDocument();

        // VERIFICAR RESUMEN
        const resumen = screen.getByRole("complementary");

        // SUBTOTAL
        expect(
            within(resumen).getByText("$19.990")
        ).toBeInTheDocument();

        // DESPACHO
        expect(
            within(resumen).getByText("$3.990")
        ).toBeInTheDocument();

        // TOTAL = 19990 + 3990
        expect(
            within(resumen).getByText("$23.980")
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 3: ENVÍO GRATIS
    // =========================================

    // =========================================
    // PRUEBA 3: ENVÍO GRATIS (CORREGIDA)
    // =========================================

    test("aplica envío gratis desde $40.990", () => {

        // PREPARAR
        const producto = {
            ...productoSimulado,
            precio: 40990
        };

        renderizarCarrito([producto]);

        // COMPROBAR
        const resumen = screen.getByRole("complementary");

        // Verificar que el despacho sea gratis
        expect(
            within(resumen).getByText("Gratis")
        ).toBeInTheDocument();

        // Subtotal y total deben ser iguales
        const precios = within(resumen).getAllByText("$40.990");

        expect(precios).toHaveLength(2);

    });


    // =========================================
    // PRUEBA 4: AUMENTAR CANTIDAD
    // =========================================

    test("ejecuta la función para aumentar cantidad", async () => {

        // PREPARAR
        const user = userEvent.setup();

        const funciones = renderizarCarrito();

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: "Aumentar cantidad"
            })
        );

        // COMPROBAR
        expect(
            funciones.onModificarCantidad
        ).toHaveBeenCalledWith(1, 1);

        expect(
            funciones.onModificarCantidad
        ).toHaveBeenCalledTimes(1);

    });


    // =========================================
    // PRUEBA 5: DISMINUIR CANTIDAD
    // =========================================

    test("ejecuta la función para disminuir cantidad", async () => {

        // PREPARAR
        const user = userEvent.setup();

        const funciones = renderizarCarrito();

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: "Disminuir cantidad"
            })
        );

        // COMPROBAR
        expect(
            funciones.onModificarCantidad
        ).toHaveBeenCalledWith(1, -1);

    });


    // =========================================
    // PRUEBA 6: LÍMITE DE STOCK
    // =========================================

    test("bloquea aumentar cuando alcanza el stock máximo", () => {

        // PREPARAR
        const producto = {
            ...productoSimulado,
            cantidad: 5
        };

        renderizarCarrito([producto]);

        // COMPROBAR
        expect(
            screen.getByRole("button", {
                name: "Aumentar cantidad"
            })
        ).toBeDisabled();

        expect(
            screen.getByText(/Límite de stock alcanzado/i)
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 7: ELIMINAR PRODUCTO
    // =========================================

    test("ejecuta la función para eliminar producto", async () => {

        // PREPARAR
        const user = userEvent.setup();

        const funciones = renderizarCarrito();

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: "Eliminar producto"
            })
        );

        // COMPROBAR
        expect(
            funciones.onEliminarProducto
        ).toHaveBeenCalledWith(1);

    });


    // =========================================
    // PRUEBA 8: VACIAR CARRITO
    // =========================================

    test("ejecuta la función para vaciar el carrito", async () => {

        // PREPARAR
        const user = userEvent.setup();

        const funciones = renderizarCarrito();

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: /Vaciar Carrito/i
            })
        );

        // COMPROBAR
        expect(
            funciones.onVaciarCarrito
        ).toHaveBeenCalledTimes(1);

    });


    // =========================================
    // PRUEBA 9: SELECCIÓN DE REGIÓN Y COMUNA
    // =========================================

    test("actualiza las comunas según la región", async () => {

        // PREPARAR
        const user = userEvent.setup();

        renderizarCarrito();

        const region = screen.getByLabelText("Región");
        const comuna = screen.getByLabelText("Comuna");

        // COMPROBAR ESTADO INICIAL
        expect(comuna).toBeDisabled();

        // ACTUAR
        await user.selectOptions(
            region,
            "Región Metropolitana"
        );

        // COMPROBAR
        expect(comuna).toBeEnabled();

        expect(
            within(comuna).getByRole("option", {
                name: "Santiago"
            })
        ).toBeInTheDocument();

        // CAMBIAR REGIÓN
        await user.selectOptions(region, "Valparaíso");

        // COMPROBAR QUE SE REINICIA LA COMUNA
        expect(comuna).toHaveValue("");

        expect(
            within(comuna).getByRole("option", {
                name: "Viña del Mar"
            })
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 10: CAMPOS OBLIGATORIOS
    // =========================================

    test("muestra error cuando faltan datos de compra", () => {

        // PREPARAR
        const funciones = renderizarCarrito();

        const botonPagar = screen.getByRole("button", {
            name: /Enviar pedido/i
        });

        // ACTUAR
        // Enviamos el formulario directamente para
        // comprobar la validación de React.
        fireEvent.submit(botonPagar.closest("form"));

        // COMPROBAR
        expect(
            screen.getByRole("alert")
        ).toHaveTextContent(
            "Por favor completa todos los campos de entrega y pago."
        );

        expect(
            funciones.onVaciarCarrito
        ).not.toHaveBeenCalled();

    });


    // =========================================
    // PRUEBA 11: PRODUCTO SIN STOCK
    // =========================================

    test.each([[404, /ya no está disponible/i], [409, /cambió el stock/i]])(
        "conserva el carrito cuando el backend responde %s", async (status, mensaje) => {
            crearPedido.mockRejectedValue({ response: { status } });
            const user = userEvent.setup();
            const funciones = renderizarCarrito();
            await completarFormulario(user);
            await user.click(screen.getByRole("button", { name: /Enviar pedido/i }));
            expect(await screen.findByRole("alert")).toHaveTextContent(mensaje);
            expect(funciones.onVaciarCarrito).not.toHaveBeenCalled();
        }
    );

    test("genera una orden cuando la compra es válida", async () => {
        crearPedido.mockResolvedValue({
            id: 74, estado: "PENDIENTE",
            entrega: { nombre: "Maria Perez", correo: "maria@gmail.com" },
            metodoPago: "Transferencia Electrónica",
            items: [{ productoId: 1, nombre: "Rosa Floral", cantidad: 1, subtotal: 20500 }],
            subtotal: 20500, costoEnvio: 3990, total: 24490
        });

        // PREPARAR
        const user = userEvent.setup();

        const funciones = renderizarCarrito();

        await completarFormulario(user);

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: /Enviar pedido/i
            })
        );

        // COMPROBAR
        expect(
            screen.getByRole("heading", {
                name: /Pedido recibido/i
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Código de orden: #74/i)
        ).toBeInTheDocument();

        expect(crearPedido).toHaveBeenCalledWith(expect.objectContaining({
            items: [{ productoId: 1, cantidad: 1 }], metodoPago: "Transferencia Electrónica"
        }));
        expect(screen.getByText("PENDIENTE")).toBeInTheDocument();

        // COMPROBAR QUE SE SOLICITA VACIAR EL CARRITO
        expect(
            funciones.onVaciarCarrito
        ).toHaveBeenCalledTimes(1);

        // COMPROBAR QUE APARECE EL RESUMEN
        expect(
            screen.getByText("Datos de despacho")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Resumen de fragancias")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", {
                name: "Seguir comprando"
            })
        ).toHaveAttribute("href", "/productos");

    });

});