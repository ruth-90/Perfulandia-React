
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],

      // Incluir todos los archivos JS y JSX
      include: ["src/**/*.{js,jsx}"],

      // Excluir archivos de pruebas
      exclude: [
        "src/**/*.test.{js,jsx}",
        "src/**/*.spec.{js,jsx}",
        "src/test/**",
      ],
    },
  },
});

