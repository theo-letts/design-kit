import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    /* The kit index globs its folder with import.meta.glob, which only Vite
       understands — so these run through Vite rather than bare node. */
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
