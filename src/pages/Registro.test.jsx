// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// PÁGINA REGISTRO
// =============================================

// HERRAMIENTAS DE VITEST
import {
    describe,
    test,
    expect,
    vi
} from "vitest";

// HERRAMIENTAS DE TESTING LIBRARY
import {
    render,
    screen
} from "@testing-library/react";

// REACT ROUTER PARA LAS PRUEBAS
import { MemoryRouter } from "react-router";

// COMPONENTE QUE VAMOS A PROBAR
import Registro from "./Registro.jsx";


// =============================================
// SIMULAR EL FORMULARIO DE REGISTRO
// =============================================

vi.mock("../components/RegistroForm.jsx", () => ({
    default: () => (
        <div data-testid="registro-form-mock">
            Formulario de registro simulado
        </div>
    )
}));


// =============================================
// FUNCIÓN PARA PREPARAR LA PÁGINA
// =============================================

function renderizarRegistro() {

    return render(
        <MemoryRouter>
            <Registro />
        </MemoryRouter>
    );

}


// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("Página Registro - Perfulandia", () => {


    // =========================================
    // PRUEBA 1: MOSTRAR ENCABEZADO
    // =========================================

    test("muestra el mensaje para crear una cuenta", () => {

        // PREPARAR
        renderizarRegistro();

        // COMPROBAR
        expect(
            screen.getByText("Crea tu cuenta")
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 2: MOSTRAR LOGO
    // =========================================

    test("muestra el logo de Perfulandia", () => {

        // PREPARAR
        renderizarRegistro();

        // COMPROBAR
        const logo = screen.getByRole("img", {
            name: "Logo Perfulandia"
        });

        expect(logo).toBeInTheDocument();

        expect(logo).toHaveAttribute(
            "src",
            "/img/Logo.png"
        );

    });


    // =========================================
    // PRUEBA 3: MOSTRAR FORMULARIO
    // =========================================

    test("incluye el componente RegistroForm", () => {

        // PREPARAR
        renderizarRegistro();

        // COMPROBAR
        expect(
            screen.getByTestId("registro-form-mock")
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 4: ENLACE AL LOGIN
    // =========================================

    test("muestra el enlace para iniciar sesión", () => {

        // PREPARAR
        renderizarRegistro();

        // COMPROBAR
        expect(
            screen.getByText("¿Ya tienes una cuenta?")
        ).toBeInTheDocument();

        const enlace = screen.getByRole("link", {
            name: "Iniciar sesión"
        });

        expect(enlace).toBeInTheDocument();

        expect(enlace).toHaveAttribute(
            "href",
            "/login"
        );

    });

});