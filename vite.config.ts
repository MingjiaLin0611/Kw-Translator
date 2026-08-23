import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = new URL(".", import.meta.url).pathname;

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: `${projectRoot}index.html`,
        background: `${projectRoot}src/background/main.ts`,
        content: `${projectRoot}src/content/main.ts`,
      },
      output: {
        entryFileNames: "assets/[name].js",
      },
    },
  },
});
