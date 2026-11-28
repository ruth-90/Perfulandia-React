// =============================================
// PERFULANDIA - PRUEBAS UNITARIAS
// COMPONENTE REGISTROFORM
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
    fireEvent
} from "@testing-library/react";

// SIMULAR ACCIONES DEL USUARIO
import userEvent from "@testing-library/user-event";

// COMPONENTE A PROBAR
import { registrarUsuario } from "../services/api.js";
import RegistroForm from "./RegistroForm.jsx";


// =============================================
// SIMULAR NAVEGACIÓN
// =============================================

const { mockNavigate } = vi.hoisted(() => ({
    mockNavigate: vi.fn()
}));

vi.mock("react-router", () => ({
    useNavigate: () => mockNavigate
}));


// =============================================
// FUNCIÓN PARA COMPLETAR EL FORMULARIO
// =============================================

vi.mock("../services/api.js", () => ({ registrarUsuario: vi.fn() }));

async function completarRegistro(user, rut = "1000005K") {

    // Nombre
    await user.type(
        screen.getByLabelText("Nombre"),
        "Maria"
    );

    // Apellidos
    await user.type(
        screen.getByLabelText("Apellidos"),
        "Perez"
    );

    // RUT
    await user.type(
        screen.getByLabelText("RUT"),
        rut
    );

    // Fecha de nacimiento válida
    const anio = new Date().getFullYear() - 25;

    fireEvent.change(
        screen.getByLabelText("Fecha de nacimiento"),
        {
            target: {
                value: `${anio}-01-15`
            }
        }
    );

    // Correo electrónico
    await user.type(
        screen.getByLabelText("Correo electrónico"),
        "maria@gmail.com"
    );

    // Región
    await user.selectOptions(
        screen.getByLabelText("Región"),
        "Región Metropolitana"
    );

    // Comuna
    await user.selectOptions(
        screen.getByLabelText("Comuna"),
        "Santiago"
    );

    // Dirección
    await user.type(
        screen.getByLabelText("Dirección"),
        "Av. Principal 123"
    );

    // Contraseña
    await user.type(
        screen.getByLabelText("Contraseña"),
        "12345678"
    );

    // Confirmar contraseña
    await user.type(
        screen.getByLabelText("Confirmar contraseña"),
        "12345678"
    );

}


// =============================================
// GRUPO DE PRUEBAS
// =============================================

describe("RegistroForm - Perfulandia", () => {

    // PREPARACIÓN ANTES DE CADA PRUEBA
    beforeEach(() => {

        // Limpiar los usuarios almacenados
        localStorage.clear();

        // Limpiar navegación simulada
        mockNavigate.mockReset();
        registrarUsuario.mockReset();

    });


    // =========================================
    // PRUEBA 1: MOSTRAR FORMULARIO
    // =========================================

    test("muestra los campos del registro", () => {

        // PREPARAR
        render(<RegistroForm />);

        // COMPROBAR
        expect(
            screen.getByLabelText("Nombre")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Apellidos")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("RUT")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Fecha de nacimiento")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Correo electrónico")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Contraseña")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Confirmar contraseña")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Crear cuenta"
            })
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 2: CAMPOS OBLIGATORIOS
    // =========================================

    test("muestra errores cuando los campos están vacíos", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        // ACTUAR
        await user.click(
            screen.getByRole("button", {
                name: "Crear cuenta"
            })
        );

        // COMPROBAR
        expect(
            screen.getByText("El nombre es obligatorio.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Los apellidos son obligatorios.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("El RUN es obligatorio.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("La fecha de nacimiento es obligatoria.")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent(
            "Revisa los campos marcados antes de continuar."
        );

        expect(mockNavigate).not.toHaveBeenCalled();

    });


    // =========================================
    // PRUEBA 3: FORMATO DEL RUT
    // =========================================

    test("rechaza un RUT con formato incorrecto", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("RUT"),
            "12.34567"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText(
                "Ingrese el RUN sin puntos ni guion."
            )
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 4: RUT DUPLICADO
    // =========================================

    test("rechaza correos con formato incorrecto", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

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


    // =========================================
    // PRUEBA 6: DOMINIOS NO PERMITIDOS
    // =========================================

    test("rechaza usuarios menores de 18 años", () => {

        // PREPARAR
        render(<RegistroForm />);

        // Fecha de una persona menor de 18 años
        const anio = new Date().getFullYear() - 10;

        const fecha = screen.getByLabelText(
            "Fecha de nacimiento"
        );

        // ACTUAR
        fireEvent.change(fecha, {
            target: {
                value: `${anio}-01-15`
            }
        });

        fireEvent.blur(fecha);

        // COMPROBAR

        expect(
            screen.getByLabelText("Fecha de nacimiento")
        ).toHaveClass("is-invalid");

        expect(
            screen.getAllByText(
                "Debes tener 18 años o más para crear una cuenta."
            )
        ).toHaveLength(2);
    });


    // =========================================
    // PRUEBA 8: REGIÓN Y COMUNA
    // =========================================

    test("actualiza las comunas según la región", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        const region = screen.getByLabelText("Región");
        const comuna = screen.getByLabelText("Comuna");

        // ESTADO INICIAL
        expect(comuna).toBeDisabled();

        // ACTUAR
        await user.selectOptions(
            region,
            "Región Metropolitana"
        );

        // COMPROBAR
        expect(comuna).toBeEnabled();

        expect(
            screen.getByRole("option", {
                name: "Santiago"
            })
        ).toBeInTheDocument();

        // SELECCIONAR COMUNA
        await user.selectOptions(comuna, "Santiago");

        expect(comuna).toHaveValue("Santiago");

        // CAMBIAR REGIÓN
        await user.selectOptions(
            region,
            "Valparaíso"
        );

        // LA COMUNA DEBE REINICIARSE
        expect(comuna).toHaveValue("");

        expect(
            screen.getByRole("option", {
                name: "Viña del Mar"
            })
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 9: CONTRASEÑA CORTA
    // =========================================

    test("rechaza contraseñas menores de 8 caracteres", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Contraseña"),
            "123"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText(
                "La contraseña debe tener al menos 8 caracteres."
            )
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 10: CONTRASEÑAS DIFERENTES
    // =========================================

    test("detecta cuando las contraseñas no coinciden", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        // ACTUAR
        await user.type(
            screen.getByLabelText("Contraseña"),
            "12345678"
        );

        await user.type(
            screen.getByLabelText("Confirmar contraseña"),
            "5678"
        );

        await user.tab();

        // COMPROBAR
        expect(
            screen.getByText("Las contraseñas no coinciden.")
        ).toBeInTheDocument();

    });


    // =========================================
    // PRUEBA 11: MOSTRAR CONTRASEÑAS
    // =========================================

    test("permite mostrar y ocultar las contraseñas", async () => {

        // PREPARAR
        const user = userEvent.setup();

        render(<RegistroForm />);

        const password = screen.getByLabelText("Contraseña");

        const confirmar = screen.getByLabelText(
            "Confirmar contraseña"
        );

        const mostrar = screen.getByLabelText(
            "Mostrar contraseñas"
        );

        // COMPROBAR ESTADO INICIAL
        expect(password).toHaveAttribute("type", "password");
        expect(confirmar).toHaveAttribute("type", "password");

        // ACTUAR
        await user.click(mostrar);

        // COMPROBAR
        expect(password).toHaveAttribute("type", "text");
        expect(confirmar).toHaveAttribute("type", "text");

        // OCULTAR NUEVAMENTE
        await user.click(mostrar);

        expect(password).toHaveAttribute("type", "password");
        expect(confirmar).toHaveAttribute("type", "password");

    });


    // =========================================
    // PRUEBA 12: REGISTRO EXITOSO
    // =========================================

    test("envía los datos del registro al backend y vuelve al login", async () => {
        registrarUsuario.mockResolvedValue({ id: 1 });
        const user = userEvent.setup();
        render(<RegistroForm />);
        await completarRegistro(user);
        await user.click(screen.getByRole("button", { name: /registrar|crear cuenta/i }));
        expect(registrarUsuario).toHaveBeenCalledWith(expect.objectContaining({
            rut: "1000005-K", correo: "maria@gmail.com", password: "12345678"
        }));
        expect(mockNavigate).toHaveBeenCalledWith("/login", { state: { registroExitoso: true } });
        expect(localStorage.getItem("usuarios")).toBeNull();
    });

    test("muestra los conflictos informados por el servidor", async () => {
        registrarUsuario.mockRejectedValue({ response: { status: 409, data: { mensaje: "El RUT ya está registrado." } } });
        const user = userEvent.setup();
        render(<RegistroForm />);
        await completarRegistro(user);
        await user.click(screen.getByRole("button", { name: /registrar|crear cuenta/i }));
        expect(await screen.findByText("El RUT ya está registrado.")).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
