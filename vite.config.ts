import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

const host = process.env.TAURI_DEV_HOST;

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

      // Only enable PWA for production web builds
      ...(isWebProduction
        ? [
            VitePWA({
              registerType: "autoUpdate",
              workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                globIgnores: ["privacy/**"],
                runtimeCaching: [
                  {
                    urlPattern: ({ url }) =>
                      url.pathname === "/privacy" ||
                      url.pathname.startsWith("/privacy/"),
                    handler: "NetworkOnly",
                  },
                ],
              },
              includeAssets: [
                "favicon.ico",
                "favicon.png",
                "og_opendevutils.png",
              ],
              manifest: {
                name: "OpenDevUtils",
                short_name: "OpenDevUtils",
                description: "Essential Developer Utilities",
                theme_color: "#000000",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                scope: "/",
                icons: [
                  {
                    src: "favicon.png",
                    sizes: "32x32",
                    type: "image/png",
                  },
                  {
                    src: "logo.png",
                    sizes: "32x32",
                    type: "image/png",
                    purpose: "any maskable",
                  },
                ],
                categories: ["developer", "productivity", "utilities"],
                lang: "en",
                dir: "ltr",
              },
            }),
          ]
        : []),
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
