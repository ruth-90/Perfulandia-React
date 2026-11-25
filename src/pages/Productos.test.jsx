
 // =============================================
 // PERFULANDIA - PRUEBAS UNITARIAS
 // PÁGINA PRODUCTOS
 // INTEGRACIÓN CON SPRING BOOT + H2
 // =============================================

 // HERRAMIENTAS DE VITEST
 import {
   describe,
   test,
   expect,
   beforeEach,
   afterEach,
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

 // SERVICIO API DE PRODUCTOS
 import {
   obtenerProductosApi
 } from "../services/productosApi.js";


 // =============================================
 // SIMULAR EL SERVICIO API DE PRODUCTOS
 // =============================================

 vi.mock("../services/productosApi.js", () => ({
   obtenerProductosApi: vi.fn()
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
 // DATOS SIMULADOS DE SPRING BOOT
 // =============================================

 const productosSimulados = [
   {
     id: 1,
     nombre: "Rosa Floral",
     categoria: "Mujer",
     precio: 29990,
     stock: 8
   },
   {
     id: 2,
     nombre: "Bosque Intenso",
     categoria: "Hombre",
     precio: 38990,
     stock: 5
   },
   {
     id: 3,
     nombre: "Brisa",
     categoria: "Unisex",
     precio: 34990,
     stock: 3
   }
 ];


 // =============================================
 // GRUPO DE PRUEBAS
 // =============================================

 describe("Página Productos - Perfulandia", () => {

   // PREPARACIÓN ANTES DE CADA PRUEBA
   beforeEach(() => {

     vi.clearAllMocks();

     // Simulamos una respuesta exitosa de Spring Boot.
     vi.mocked(obtenerProductosApi)
       .mockResolvedValue(productosSimulados);

   });


   // LIMPIEZA DESPUÉS DE CADA PRUEBA
   afterEach(() => {
     vi.restoreAllMocks();
   });


   // =========================================
   // PRUEBA 1: MOSTRAR PRODUCTOS
   // =========================================

   test("muestra los productos del catálogo", async () => {

     const onAgregarProducto = vi.fn();

     render(
       <Productos onAgregarProducto={onAgregarProducto} />
     );

     // Esperamos la respuesta simulada de Spring Boot.
     expect(
       await screen.findByText("Rosa Floral")
     ).toBeInTheDocument();

     expect(obtenerProductosApi).toHaveBeenCalled();

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

     const user = userEvent.setup();

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     // Esperamos a que cargue el catálogo.
     await screen.findByText("Rosa Floral");

     await user.type(
       screen.getByRole("textbox", {
         name: "Buscar perfume"
       }),
       "Rosa"
     );

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

     const user = userEvent.setup();

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     await screen.findByText("Rosa Floral");

     await user.selectOptions(
       screen.getByRole("combobox"),
       "Hombre"
     );

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

     const user = userEvent.setup();

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     await screen.findByText("Rosa Floral");

     await user.type(
       screen.getByRole("textbox", {
         name: "Buscar perfume"
       }),
       "Perfume inexistente"
     );

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

     const user = userEvent.setup();

     const onAgregarProducto = vi.fn();

     render(
       <Productos onAgregarProducto={onAgregarProducto} />
     );

     await screen.findByText("Rosa Floral");

     await user.click(
       screen.getByRole("button", {
         name: "Agregar Rosa Floral"
       })
     );

     expect(onAgregarProducto).toHaveBeenCalledWith(
       productosSimulados[0]
     );

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

     const user = userEvent.setup();

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     await screen.findByText("Brisa");

     await user.click(
       screen.getByRole("button", {
         name: "Agregar Brisa"
       })
     );

     expect(
       screen.getByRole("status")
     ).toHaveTextContent(
       "Brisa fue agregado al carrito."
     );

     await user.click(
       screen.getByRole("button", {
         name: "Cerrar mensaje"
       })
     );

     expect(
       screen.queryByRole("status")
     ).not.toBeInTheDocument();

   });


   // =========================================
   // PRUEBA 7: CATÁLOGO VACÍO
   // =========================================

   test("muestra aviso cuando no existen productos", async () => {

     // Spring Boot devuelve una lista vacía.
     vi.mocked(obtenerProductosApi)
       .mockResolvedValue([]);

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     expect(
       await screen.findByText("No encontramos productos")
     ).toBeInTheDocument();

     expect(
       screen.getByText("Intenta buscar otro perfume.")
     ).toBeInTheDocument();

   });


   // =========================================
   // PRUEBA 8: PRODUCTO SIN STOCK
   // =========================================

   test("impide agregar un producto sin stock", async () => {

     const user = userEvent.setup();
     const onAgregarProducto = vi.fn();

     // Simulamos un perfume agotado.
     vi.mocked(obtenerProductosApi)
       .mockResolvedValue([
         {
           id: 4,
           nombre: "Perfume Agotado",
           categoria: "Unisex",
           precio: 25990,
           stock: 0
         }
       ]);

     render(
       <Productos onAgregarProducto={onAgregarProducto} />
     );

     await screen.findByText("Perfume Agotado");

     await user.click(
       screen.getByRole("button", {
         name: "Agregar Perfume Agotado"
       })
     );

     // No debe llegar al carrito.
     expect(onAgregarProducto).not.toHaveBeenCalled();

     expect(
       screen.getByRole("status")
     ).toHaveTextContent(
       "Perfume Agotado no tiene stock disponible."
     );

   });


   // =========================================
   // PRUEBA 9: ERROR DE CONEXIÓN
   // =========================================

   test("muestra un error cuando Spring Boot no responde", async () => {

     // Evitamos mostrar el error esperado en la terminal.
     const errorConsola = vi.spyOn(
       console,
       "error"
     ).mockImplementation(() => {});

     vi.mocked(obtenerProductosApi)
       .mockRejectedValue(
         new Error("No se pudo conectar con Spring Boot")
       );

     render(
       <Productos onAgregarProducto={vi.fn()} />
     );

     expect(
       await screen.findByRole("alert")
     ).toHaveTextContent(
       "No fue posible cargar los perfumes."
     );

     expect(
       screen.queryByText("No encontramos productos")
     ).not.toBeInTheDocument();

     expect(errorConsola).toHaveBeenCalled();

   });

 });
