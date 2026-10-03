import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { loadEnv, type Plugin } from "vite";
import { configDefaults, defineConfig } from "vitest/config";

function createApiProxy(target: string) {
  return { "/api": { target, changeOrigin: true } };
}

function apiPreconnect(apiUrl: string | undefined): Plugin {
  return {
    name: "fixflow-api-preconnect",
    transformIndexHtml() {
      if (!apiUrl) {
        return [];
      }
      return [
        {
          tag: "link",
          attrs: { rel: "preconnect", href: new URL(apiUrl).origin, crossorigin: true },
          injectTo: "head",
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.API_PROXY_TARGET;

  return {
    plugins: [react(), tailwindcss(), apiPreconnect(env.VITE_API_URL)],
    server: proxyTarget ? { proxy: createApiProxy(proxyTarget) } : {},
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: "react",
                test: /\/node_modules\/(react|react-dom|scheduler|react-router)\//,
              },
            ],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      exclude: [...configDefaults.exclude, "e2e/**"],
      restoreMocks: true,
      testTimeout: 15_000,
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
