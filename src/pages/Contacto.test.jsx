
 // =============================================
 // PERFULANDIA - PRUEBAS AUTOMATIZADAS
 // COMPONENTE CONTACTO
 // REACT + VITEST + AXIOS SIMULADO
 // =============================================

import {
    describe,
    test,
    expect,
    vi,
    beforeEach
} from "vitest";

import {
    render,
    screen,
    waitFor
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Contacto from "./Contacto.jsx";

import { enviarMensajeContacto } from "../services/contactoApi.js";


// =============================================
// SIMULAR EL SERVICIO DE CONTACTO
// =============================================

// Evita realizar solicitudes reales a Spring Boot.
// Así las pruebas no modifican la base de datos H2.

vi.mock("../services/contactoApi.js", () => ({
    enviarMensajeContacto: vi.fn()
}));


// =============================================
// PREPARACIÓN ANTES DE CADA PRUEBA
// =============================================

beforeEach(() => {

    vi.resetAllMocks();

    // Por defecto, el servidor responde correctamente.
    enviarMensajeContacto.mockResolvedValue({
        id: 1,
        nombre: "Cliente de Prueba",
        correo: null,
        comentario: "Mensaje de prueba",
        estado: "PENDIENTE"
    });

});


// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("Formulario de Contacto - Perfulandia", () => {

    // ==========================================
    // PRUEBA 1: MOSTRAR EL FORMULARIO
    // ==========================================

    test("muestra los campos del formulario", () => {

        render(<Contacto />);

        expect(
            screen.getByRole("textbox", { name: /nombre/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("textbox", { name: /correo/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("textbox", { name: /comentario/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /enviar mensaje/i })
        ).toBeInTheDocument();

    });


    // ==========================================
    // PRUEBA 2: CAMPOS OBLIGATORIOS
    // ==========================================

    test("muestra errores al enviar campos vacíos", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        expect(
            screen.getByText("El nombre es obligatorio.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("El comentario es obligatorio.")
        ).toBeInTheDocument();

        // No debe enviar datos inválidos.
        expect(enviarMensajeContacto).not.toHaveBeenCalled();

    });


    // ==========================================
    // PRUEBA 3: CORREO INVÁLIDO
    // ==========================================

    test("detecta un correo con formato incorrecto", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /correo/i }),
            "correo-invalido"
        );

        expect(
            screen.getByText("Ingresa un correo válido.")
        ).toBeInTheDocument();

    });


    // ==========================================
    // PRUEBA 4: DOMINIO NO PERMITIDO
    // ==========================================

    test("rechaza correos de dominios no autorizados", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /correo/i }),
            "persona@outlook.com"
        );

        expect(
            screen.getByText(/Solo se permiten correos/i)
        ).toBeInTheDocument();

    });


    // ==========================================
    // PRUEBA 5: CONTADOR DE CARACTERES
    // ==========================================

    test("actualiza el contador del comentario", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Hola"
        );

        expect(
            screen.getByText(/4\s*\/\s*500/)
        ).toBeInTheDocument();

    });


    // ==========================================
    // PRUEBA 6: CORREO OPCIONAL
    // ==========================================

    test("permite enviar el formulario sin correo", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /nombre/i }),
            "Maria"
        );

        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Quiero consultar por un perfume."
        );

        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        // Comprobar que se llamó al servicio.
        await waitFor(() => {

            expect(enviarMensajeContacto).toHaveBeenCalledWith({
                nombre: "Maria",
                correo: "",
                comentario: "Quiero consultar por un perfume."
            });

        });

        // Confirmar envío exitoso.
        expect(
            await screen.findByRole("status")
        ).toHaveTextContent(
            "¡Tu mensaje fue enviado y registrado correctamente!"
        );

        // El formulario debe limpiarse.
        expect(
            screen.getByRole("textbox", { name: /nombre/i })
        ).toHaveValue("");

        expect(
            screen.getByRole("textbox", { name: /comentario/i })
        ).toHaveValue("");

    });


    // ==========================================
    // PRUEBA 7: ENVÍO CON CORREO VÁLIDO
    // ==========================================

    test("envía correctamente un formulario completo", async () => {

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /nombre/i }),
            "Ana"
        );

        await user.type(
            screen.getByRole("textbox", { name: /correo/i }),
            "ana@gmail.com"
        );

        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Necesito información sobre los productos."
        );

        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        await waitFor(() => {

            expect(enviarMensajeContacto).toHaveBeenCalledWith({
                nombre: "Ana",
                correo: "ana@gmail.com",
                comentario: "Necesito información sobre los productos."
            });

        });

        expect(
            await screen.findByRole("status")
        ).toHaveTextContent(
            "¡Tu mensaje fue enviado y registrado correctamente!"
        );

    });


    // ==========================================
    // PRUEBA 8: ERROR DE CONEXIÓN
    // ==========================================

    test("muestra un error si Spring Boot no responde", async () => {

        // Simular una falla de conexión.
        enviarMensajeContacto.mockRejectedValue(
            new Error("Network Error")
        );

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /nombre/i }),
            "Cliente"
        );

        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Necesito ayuda con mi pedido."
        );

        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "No fue posible enviar tu mensaje."
        );

        // Los datos deben conservarse.
        expect(
            screen.getByRole("textbox", { name: /nombre/i })
        ).toHaveValue("Cliente");

        expect(
            screen.getByRole("textbox", { name: /comentario/i })
        ).toHaveValue("Necesito ayuda con mi pedido.");

    });


    // ==========================================
    // PRUEBA 9: ERROR DE VALIDACIÓN DEL SERVIDOR
    // ==========================================

    test("muestra un error si Spring Boot rechaza los datos", async () => {

        // Simular HTTP 400.
        enviarMensajeContacto.mockRejectedValue({
            response: {
                status: 400
            }
        });

        const user = userEvent.setup();

        render(<Contacto />);

        await user.type(
            screen.getByRole("textbox", { name: /nombre/i }),
            "Cliente"
        );

        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Consulta sobre perfumes."
        );

        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent(
            "El servidor rechazó los datos del formulario."
        );

        // El formulario no debe limpiarse.
        expect(
            screen.getByRole("textbox", { name: /nombre/i })
        ).toHaveValue("Cliente");

    });

});
