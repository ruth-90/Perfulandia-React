// ============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// PÁGINA LOGIN
// ============================================

// Herramientas de Vitest
import { describe, test, expect, vi } from "vitest";

// Herramientas para probar componentes React
import { render, screen } from "@testing-library/react";

// Importamos la página que vamos a probar
import Login from "./Login.jsx";

// Simulamos LoginForm para probar solamente Login
vi.mock("../components/LoginForm.jsx", () => ({
    default: () => (
        <div data-testid="login-form-mock">
            Formulario de login simulado
        </div>
    ),
}));

// ============================================
// GRUPO DE PRUEBAS
// ============================================

describe("Página Login - Perfulandia", () => {

    // PRUEBA 1: MOSTRAR TEXTO DE BIENVENIDA
    test("muestra el mensaje de inicio de sesión", () => {

        // PREPARAR
        render(<Login />);

        // COMPROBAR
        expect(
            screen.getByText("Ingresa a tu cuenta")
        ).toBeInTheDocument();

    });


    // PRUEBA 2: MOSTRAR EL LOGO
    test("muestra el logo de Perfulandia", () => {

        // PREPARAR
        render(<Login />);

        // COMPROBAR
        const logo = screen.getByRole("img", {
            name: "Logo Perfulandia",
        });

        expect(logo).toBeInTheDocument();

        expect(logo).toHaveAttribute(
            "src",
            "/img/Logo.png"
        );

    });


    // PRUEBA 3: MOSTRAR EL FORMULARIO
    test("incluye el componente LoginForm", () => {

        // PREPARAR
        render(<Login />);

        // COMPROBAR
        expect(
            screen.getByTestId("login-form-mock")
        ).toBeInTheDocument();

    });


    // PRUEBA 4: ENLACE DE REGISTRO
    test("muestra el enlace para crear una cuenta", () => {

        // PREPARAR
        render(<Login />);

        // COMPROBAR
        const enlace = screen.getByRole("link", {
            name: "Crear una cuenta",
        });

        expect(enlace).toBeInTheDocument();

        expect(enlace).toHaveAttribute(
            "href",
            "/registro"
        );

    });

});