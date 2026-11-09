import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // The dev proxy target is configurable so local development can read the
  // deployed API. Proxying keeps the call server-side, which avoids the
  // backend's CORS allowlist rejecting http://localhost:5173.
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_DEV_PROXY_TARGET || "http://localhost:5000";

  return {
    plugins: [
      TanStackRouterVite({
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    build: {
      target: "ES2020",
      // use esbuild for minification to avoid terser dependency issues
      minify: "esbuild",
      // drop console via esbuild options
      terserOptions: undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom"],
            "vendor-router": ["@tanstack/react-router"],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-ui": ["framer-motion", "lucide-react"],
            "vendor-forms": ["react-hook-form"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
        "/socket.io": { target: "http://localhost:5000", ws: true },
      },
    },
  };
});
