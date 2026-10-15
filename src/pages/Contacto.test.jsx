// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE CONTACTO
// =============================================

// Herramientas de Vitest
import { describe, test, expect } from "vitest";

// Herramientas para probar componentes React
import { render, screen } from "@testing-library/react";

// Simula las acciones de un usuario
import userEvent from "@testing-library/user-event";

// Componente que vamos a probar
import Contacto from "./Contacto.jsx";

// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("Formulario de Contacto - Perfulandia", () => {

    // PRUEBA 1: MOSTRAR EL FORMULARIO
    test("muestra los campos del formulario", () => {

        // PREPARAR
        render(<Contacto />);

        // COMPROBAR
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


    // PRUEBA 2: CAMPOS OBLIGATORIOS
    test("muestra errores al enviar campos vacíos", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
        await user.click(
            screen.getByRole("button", { name: /enviar mensaje/i })
        );

        // COMPROBAR
        expect(
            screen.getByText("El nombre es obligatorio.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("El comentario es obligatorio.")
        ).toBeInTheDocument();

    });


    // PRUEBA 3: CORREO INVÁLIDO
    test("detecta un correo con formato incorrecto", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
        await user.type(
            screen.getByRole("textbox", { name: /correo/i }),
            "correo-invalido"
        );

        // COMPROBAR
        expect(
            screen.getByText("Ingresa un correo válido.")
        ).toBeInTheDocument();

    });


    // PRUEBA 4: DOMINIO NO PERMITIDO
    test("rechaza correos de dominios no autorizados", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
        await user.type(
            screen.getByRole("textbox", { name: /correo/i }),
            "persona@outlook.com"
        );

        // COMPROBAR
        expect(
            screen.getByText(/Solo se permiten correos/i)
        ).toBeInTheDocument();

    });


    // PRUEBA 5: CONTADOR DE CARACTERES
    test("actualiza el contador del comentario", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
        await user.type(
            screen.getByRole("textbox", { name: /comentario/i }),
            "Hola"
        );

        // COMPROBAR
        expect(
            screen.getByText(/4\s*\/\s*500/)
        ).toBeInTheDocument();

    });


    // PRUEBA 6: CORREO OPCIONAL
    test("permite validar el formulario sin correo", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
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

        // COMPROBAR
        expect(
            screen.getByRole("status")
        ).toHaveTextContent("Formulario validado correctamente.");

        expect(
            screen.getByRole("textbox", { name: /nombre/i })
        ).toHaveValue("");

    });


    // PRUEBA 7: ENVÍO CON CORREO VÁLIDO
    test("valida correctamente un formulario completo", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<Contacto />);

        // ACTUAR
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

        // COMPROBAR
        expect(
            screen.getByRole("status")
        ).toHaveTextContent("Formulario validado correctamente.");

    });

});