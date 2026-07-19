import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { isExtension, isTauri } from "@/lib/platform";

const Index = lazy(() => import("./pages/Index"));
const UtilPage = lazy(() => import("./pages/UtilPage").then(({ UtilPage }) => ({ default: UtilPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyRedirect = lazy(() => import("./pages/PrivacyRedirect"));
const DesktopLayout = lazy(() =>
  import("./components/DesktopLayout").then(({ DesktopLayout }) => ({ default: DesktopLayout }))
);

/**
 * Use HashRouter in Tauri/extension (no History API),
 * BrowserRouter for the web version.
 */
const Router = isTauri() || isExtension() ? HashRouter : BrowserRouter;
const AppLayout = isTauri() ? DesktopLayout : Layout;
const isWeb = !isTauri() && !isExtension();

const App = () => (
  <TooltipProvider>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            {isWeb && <Route path="/privacy" element={<PrivacyRedirect />} />}
            {isWeb && <Route path="/privacy/" element={<PrivacyRedirect />} />}
            <Route path="/:utilId" element={<UtilPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  </TooltipProvider>
);

export default App;
