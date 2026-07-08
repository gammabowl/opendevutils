import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider'
import { isExtension } from './lib/platform'

if (isExtension()) {
  document.documentElement.classList.add("extension");
  document.body.classList.add("extension");
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="opendevutils-theme">
    <App />
  </ThemeProvider>
);
