import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Read BACKEND_URL from the root .env file (one folder up)
  const env = loadEnv(mode, "..", "");
  const backendUrl = env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error(
      "BACKEND_URL is missing in your root .env file (e.g. BACKEND_URL=http://127.0.0.1:8000)."
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});