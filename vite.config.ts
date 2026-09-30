import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

function createApiProxy(target: string) {
  const route = { target, changeOrigin: true };
  return { "/api": route, "/health": route };
}

export default defineConfig(({ mode }) => {
  const proxyTarget = loadEnv(mode, process.cwd(), "").API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    server: proxyTarget ? { proxy: createApiProxy(proxyTarget) } : {},
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      restoreMocks: true,
      env: {
        TZ: "America/New_York",
      },
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}", "scripts/**/*.mjs", "eslint-rules/**/*.js"],
        reporter: ["text", ["text", { file: "coverage.txt" }]],
      },
    },
  };
});
