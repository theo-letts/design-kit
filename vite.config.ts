import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { anthropicVision } from "./server/vision-plugin.ts";
import { saveKit } from "./server/kits-plugin.ts";

export default defineConfig({
  plugins: [react(), tailwindcss(), anthropicVision(), saveKit()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  /* Four products, one engine. The remixer is index.html; the specimen viewer
     is specimens.html, which ships the same theme code with no sidebar; the
     sandbox is studies.html; and kit.html is the house kit with nothing to
     turn. Each is its own document, so a page only pays for what it actually
     renders. */
  build: {
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL(".", import.meta.url)), "index.html"),
        specimens: resolve(fileURLToPath(new URL(".", import.meta.url)), "specimens.html"),
        studies: resolve(fileURLToPath(new URL(".", import.meta.url)), "studies.html"),
        kit: resolve(fileURLToPath(new URL(".", import.meta.url)), "kit.html"),
      },
    },
  },
  server: { port: 5173 },
});
