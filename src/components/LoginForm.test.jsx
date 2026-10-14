// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE LOGINFORM
// =============================================

import {
    describe,
    test,
    expect,
    beforeEach,
    vi
} from "vitest";

import {
    render,
    screen
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import LoginForm from "./LoginForm.jsx";

// =============================================
// SIMULAR LA NAVEGACIÓN
// =============================================

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn()
}));

vi.mock("react-router", () => ({
    useNavigate: () => mockNavigate
}));

// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("LoginForm - Perfulandia", () => {

    // LIMPIAR DATOS ANTES DE CADA PRUEBA
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockReset();
    });


    // PRUEBA 1: MOSTRAR LOS CAMPOS
    test("muestra correo y contraseña", () => {

        // PREPARAR
        render(<LoginForm />);

        // COMPROBAR
        expect(
            screen.getByLabelText("Correo electrónico")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Contraseña")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        ).toBeInTheDocument();

    });


    // PRUEBA 2: CAMPOS OBLIGATORIOS
    test("muestra errores al enviar campos vacíos", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        );

        // COMPROBAR
        expect(
            screen.getByText(
                "El correo electrónico es obligatorio."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "La contraseña es obligatoria."
            )
        ).toBeInTheDocument();

    });


    // PRUEBA 3: CORREO INCORRECTO
    test("detecta un correo con formato inválido", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "correo-invalido"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText(
                "Ingresa un correo electrónico válido."
            )
        ).toBeInTheDocument();

    });


    // PRUEBA 4: DOMINIO NO PERMITIDO
    test("rechaza correos no autorizados", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "usuario@outlook.com"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText(
                /Solo se permiten correos/i
            )
        ).toBeInTheDocument();

    });


    // PRUEBA 5: CONTRASEÑA CORTA
    test("rechaza contraseñas menores a 4 caracteres", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Contraseña"),
            "123"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText(
                "La contraseña debe tener al menos 4 caracteres."
            )
        ).toBeInTheDocument();

    });


    // PRUEBA 6: MOSTRAR CONTRASEÑA
    test("permite mostrar y ocultar la contraseña", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        const inputContrasena =
            screen.getByLabelText("Contraseña");

        // COMPROBAR ESTADO INICIAL
        expect(inputContrasena).toHaveAttribute(
            "type",
            "password"
        );

        // ACTUAR
        await user.click(
            screen.getByLabelText("Mostrar contraseña")
        );

        // COMPROBAR
        expect(inputContrasena).toHaveAttribute(
            "type",
            "text"
        );

        // ACTUAR NUEVAMENTE
        await user.click(
            screen.getByLabelText("Mostrar contraseña")
        );

        // COMPROBAR
        expect(inputContrasena).toHaveAttribute(
            "type",
            "password"
        );

    });


    // PRUEBA 7: INGRESO ADMINISTRADOR
    test("permite ingresar como administrador", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "admin@duoc.cl"
        );

        await user.type(
            screen.getByLabelText("Contraseña"),
            "1234"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        );

        // COMPROBAR
        expect(
            screen.getByText(
                "Ingreso administrador correcto."
            )
        ).toBeInTheDocument();

        expect(mockNavigate).toHaveBeenCalledWith(
            "/admin"
        );

    });


    // PRUEBA 8: USUARIO NO REGISTRADO
    test("muestra error cuando el usuario no existe", async () => {

        // PREPARAR
        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "desconocido@gmail.com"
        );

        await user.type(
            screen.getByLabelText("Contraseña"),
            "1234"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        );

        // COMPROBAR
        expect(
            screen.getByText(
                /Este correo no está registrado/i
            )
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();

    });


    // PRUEBA 9: CLIENTE REGISTRADO
    test("permite ingresar a un cliente registrado", async () => {

        // PREPARAR
        const cliente = {
            nombre: "Maria",
            apellidos: "Perez",
            correo: "maria@gmail.com"
        };

        localStorage.setItem(
            "usuarios",
            JSON.stringify([cliente])
        );

        const user = userEvent.setup();
        render(<LoginForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "maria@gmail.com"
        );

        await user.type(
            screen.getByLabelText("Contraseña"),
            "1234"
        );

        await user.click(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        );

        // COMPROBAR
        expect(
            screen.getByText(
                "Ingreso cliente correcto."
            )
        ).toBeInTheDocument();

        expect(mockNavigate).toHaveBeenCalledWith(
            "/productos"
        );

        expect(
            JSON.parse(localStorage.getItem("clienteActivo"))
        ).toEqual({
            nombre: "Maria Perez",
            correo: "maria@gmail.com"
        });

    });

});