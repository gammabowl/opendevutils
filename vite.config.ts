import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

const deferEntryStylesheets = {
  name: "defer-entry-stylesheets",
  enforce: "post" as const,
  transformIndexHtml(html: string) {
    return html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
      (_, href: string) =>
        `<link rel="preload" crossorigin href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
        `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
    );
  },
};

export default defineConfig(({ mode }) => {
  const isExtension = mode === "extension";
  const isTauri = !!process.env.TAURI_ENV_PLATFORM;
  const isWebProduction = mode === "production" && !isTauri;

  return {
    server: {
      host: host || "::",
      port: host ? 1420 : 8080,
      strictPort: true,
      hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
      watch: {
        ignored: ["**/src-tauri/**"],
      },
    },

    preview: {
      port: 8080,
    },

    appType: "spa",
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],

    plugins: [
      react(),
      ...(isWebProduction ? [deferEntryStylesheets] : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      // ⭐ THIS is the key addition
      outDir: isExtension ? "dist-extension" : "dist",

      emptyOutDir: true,

      minify: "terser",

      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: [
            "console.log",
            "console.info",
            "console.debug",
            "console.warn",
          ],
          passes: 2,
        },
        mangle: {
          toplevel: true,
          safari10: true,
        },
        format: {
          comments: false,
        },
      },

      sourcemap: false,
      cssMinify: true,
      cssCodeSplit: true,

      modulePreload: {
        polyfill: false,
      },

      rollupOptions: {
        // ⭐ REQUIRED for extension background script
        input: isExtension
          ? {
              index: path.resolve(__dirname, "extension/index.html"),
              background: path.resolve(
                __dirname,
                "extension/background.ts"
              ),
            }
          : undefined,

        output: {
          entryFileNames: "[name].js",

          manualChunks: isExtension
            ? undefined
            : {
                vendor: [
                  "react",
                  "react-dom",
                  "react-router-dom",
                ],
                ui: [
                  "@radix-ui/react-dialog",
                  "@radix-ui/react-tabs",
                  "@radix-ui/react-collapsible",
                  "@radix-ui/react-dropdown-menu",
                ],
                utils: [
                  "date-fns",
                  "cronstrue",
                  "diff",
                  "js-yaml",
                  "uuid",
                ],
              },
        },

        onwarn(warning, warn) {
          if (
            warning.code === "MODULE_LEVEL_DIRECTIVE" ||
            (warning.message &&
              warning.message.includes(
                "externalized for browser compatibility"
              ))
          ) {
            return;
          }
          warn(warning);
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});
