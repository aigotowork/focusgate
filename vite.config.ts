import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { build as viteBuild, defineConfig, type Plugin } from "vite";

function contentScriptBuildPlugin(): Plugin {
  return {
    name: "focusgate-content-script-build",
    apply: "build",
    async closeBundle() {
      await viteBuild({
        configFile: false,
        publicDir: false,
        build: {
          emptyOutDir: false,
          outDir: "dist",
          sourcemap: true,
          rollupOptions: {
            input: resolve(__dirname, "src/content/reminder-overlay.ts"),
            output: {
              entryFileNames: "assets/reminder-overlay.js",
              format: "iife",
              inlineDynamicImports: true,
              name: "FocusGateReminderOverlay"
            }
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), contentScriptBuildPlugin()],
  server: {
    host: "127.0.0.1",
    port: 5179,
    strictPort: false
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        welcome: resolve(__dirname, "welcome.html"),
        options: resolve(__dirname, "options.html"),
        block: resolve(__dirname, "block.html"),
        handoff: resolve(__dirname, "handoff.html"),
        background: resolve(__dirname, "src/background/index.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "assets/background.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});
