import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { utils } from "@/lib/utils";
import { isTauri } from "@/lib/platform";

export function UtilPage() {
  const { utilId } = useParams<{ utilId: string }>();
  const navigate = useNavigate();
  
  const util = utils.find((u) => u.id === utilId);

  // Handle ESC key to go back to grid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (!util) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Util not found</h2>
        <p className="text-muted-foreground">The util "{utilId}" doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-dev-primary text-dev-primary-foreground hover:bg-dev-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all utils
        </Link>
      </div>
    );
  }

  const UtilComponent = util.component;

  // Special handling for utils that need navigation prop
  const needsNavigate = utilId === "base64" || utilId === "zlib";

  // Set page title and meta description
  useEffect(() => {
    document.title = `OpenDevUtils - ${util.label}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', util.description);
    }
  }, [util]);

  const isDesktop = isTauri();

  return (
    <div className={isDesktop ? "flex flex-col flex-1 min-h-0" : "space-y-6"}>
      <Toaster />
      {/* Structured Data */}
      {!isDesktop && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": util.label,
            "description": util.description,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "url": `https://opendevutils.com/util/${util.id}`
          })}
        </script>
      )}
      {/* Back navigation */}
      {!isDesktop && (
        <div className="flex justify-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/30 hover:border-border/60 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">All utils</span>
            <span className="text-muted-foreground/40">|</span>
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-background border border-border/50 rounded shadow-sm">
              ESC
            </kbd>
          </Link>
        </div>
      )}

      {/* Util Component */}
      <div className={isDesktop ? "flex-1 flex flex-col min-h-0" : "max-w-[1400px] mx-auto"}>
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-dev-primary" />
          </div>
        }>
          {needsNavigate ? (
            <UtilComponent navigate={(id: string | null) => navigate(id ? `/${id}` : "/")} />
          ) : (
            <UtilComponent />
          )}
        </Suspense>
      </div>
    </div>
  );
}
