import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/@pixi/") ||
            id.includes("/node_modules/pixi.js/")
          ) {
            return "pixi";
          }

          if (id.includes("/node_modules/pixi-live2d-display/")) {
            return "pixi-live2d";
          }

          if (id.includes("/node_modules/pixi-spine/")) {
            return "pixi-spine";
          }
        },
      },
    },
  },
});
