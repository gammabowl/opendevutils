import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { isExtension, isTauri } from "@/lib/platform";

const queryClient = new QueryClient();
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
// The desktop shell depends on Tauri-only UI. Keeping it lazy means web visitors
// never download it or its supporting modules.
const AppLayout = isTauri() ? DesktopLayout : Layout;
const isWeb = !isTauri() && !isExtension();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Suspense fallback={null}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              {isWeb && <Route path="/privacy" element={<PrivacyRedirect />} />}
              {isWeb && <Route path="/privacy/" element={<PrivacyRedirect />} />}
              <Route path="/:utilId" element={<UtilPage />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
