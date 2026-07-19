import baseConfig from "./tailwind.config";

// Utility pages are lazy routes. Their Tailwind utilities are generated into a
// separate stylesheet so the landing page only downloads styles it can render.
export default {
  ...baseConfig,
  content: [
    "./src/lib/utils.ts",
    "./src/pages/UtilPage.tsx",
    "./src/components/utils/**/*.{ts,tsx}",
    "./src/components/tabs/**/*.{ts,tsx}",
    "./src/components/{CodeEditor,JsonLinter}.tsx",
    "./src/components/ui/**/*.{ts,tsx}",
    "./src/hooks/use-toast.ts",
  ],
};
