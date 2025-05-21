// vite.config.js - ESM version that's compatible with package.json type: "module"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic configuration for ESM
const config = {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    // Use relative paths for hmr websocket requests
    hmr: {
      protocol: 'ws',
      host: undefined, // Let Vite infer the host
      port: undefined, // Let Vite infer the port
    },
  },
  // Disable HMR in production builds
  define: {
    __HMR_DISABLED__: process.env.NODE_ENV === 'production',
  },
};

// Export as ESM default
export default defineConfig(config);
