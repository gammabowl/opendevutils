import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { utils, Util, utilCategories } from "@/lib/utils";
import { prefetchUtil } from "@/lib/lazyUtils";
import { Keyboard, Heart, Monitor, Download, Chrome, Webhook, ExternalLink } from "lucide-react";
import { isExtension, isTauri } from "@/lib/platform";

const FAVORITES_STORAGE_KEY = "try-devutils-favourites";

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

interface UtilCardProps {
  util: Util;
  isFavourite: boolean;
  onToggleFavourite: (utilId: string) => void;
}

// Same card markup/size everywhere (web, desktop, extension) — only the
// surrounding grid's column count differs by platform.
function UtilCard({ util, isFavourite, onToggleFavourite }: UtilCardProps) {
  const IconComponent = util.icon;

  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavourite(util.id);
  };

  return (
    <Link
      to={`/${util.id}`}
      onMouseEnter={() => prefetchUtil(util.id)}
      className="group cursor-pointer p-6 bg-card/50 border border-border/50 rounded-lg hover:bg-card/80 hover:border-dev-primary/50 transition-all duration-200 hover:shadow-md hover:scale-105 relative"
    >
      <button
        onClick={handleFavouriteClick}
        className={`absolute top-2 right-2 p-1.5 rounded-md transition-all ${
          isFavourite
            ? "text-red-500 bg-red-500/10"
            : "text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10"
        }`}
        title={isFavourite ? "Remove from favourites" : "Add to favourites"}
      >
        <Heart className={`h-4 w-4 ${isFavourite ? "fill-current" : ""}`} />
      </button>
      <div className="flex flex-col items-center text-center space-y-3">
        <div className={`p-3 rounded-lg ${util.bgColor} group-hover:shadow-lg group-hover:shadow-current transition-all`}>
          <IconComponent className={`h-8 w-8 ${util.textColor}`} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors">{util.label}</h3>
          <p className="text-sm text-muted-foreground mt-1">{util.description}</p>
        </div>
      </div>
    </Link>
  );
}

const Index = () => {
  const [favourites, setFavourites] = useState<string[]>([]);
  const isDesktop = isTauri();
  const extensionMode = isExtension();

  useEffect(() => {
    setFavourites(getFavorites());
    // Set page title when on the grid
    document.title = extensionMode || isDesktop
      ? "OpenDevUtils – Privacy-first developer utils"
      : "OpenDevUtils – Privacy-first developer utils — Web, Desktop App & Chrome Extension";
  }, []);

  const toggleFavourite = (utilId: string) => {
    setFavourites((prev) => {
      const newFavourites = prev.includes(utilId)
        ? prev.filter((id) => id !== utilId)
        : [...prev, utilId];
      saveFavorites(newFavourites);
      return newFavourites;
    });
  };

  const favouriteUtils = utils.filter((util) => favourites.includes(util.id));
  const otherUtils = utils.filter((util) => !favourites.includes(util.id));

  // Arrange otherUtils by category, so similar categories are adjacent
  const categorizedOtherUtils = utilCategories
    .map((cat) => otherUtils.filter((util) => util.category === cat))
    .flat();
  const desktopSortedOtherUtils = categorizedOtherUtils;

  // Plain hand-written classes (defined in index.css), not Tailwind utilities:
  // util pages load their own separate Tailwind stylesheet (tool.css) which
  // can independently generate identically-named utility classes (e.g.
  // "hidden lg:block", "xl:grid-cols-4") whenever any tool component happens
  // to use them too. Whichever stylesheet loads into <head> later wins the
  // cascade tie, breaking these shared shell elements after visiting any
  // util page. See the "Home shell layout" comment in index.css.
  const desktopGridCols = "shell-grid-desktop";
  const webGridCols = "shell-grid-web";

  // Extension and desktop share the same chrome (DesktopLayout: sidebar with
  // categories/favourites/filter, title bar, footer) — see App.tsx — so they
  // share this compact grid-only body too.
  if (isDesktop || extensionMode) {
    return (
      <div className="space-y-5 flex-1">
        {/* Favorites Section */}
        {favouriteUtils.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              <h3 className="text-sm font-semibold text-foreground">Favourites</h3>
              <span className="text-[11px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-full">{favouriteUtils.length}</span>
            </div>
            <div className={desktopGridCols}>
              {favouriteUtils.map((util) => (
                <UtilCard key={util.id} util={util} isFavourite={true} onToggleFavourite={toggleFavourite} />
              ))}
            </div>
          </div>
        )}

        {/* All Utils */}
        <div className="space-y-2">
          {favouriteUtils.length > 0 && (
            <div className="flex items-center gap-2">
              <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">All Utilities</h3>
              <span className="text-[11px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-full">{desktopSortedOtherUtils.length}</span>
            </div>
          )}
          <div className={desktopGridCols}>
            {desktopSortedOtherUtils.map((util) => (
              <UtilCard key={util.id} util={util} isFavourite={false} onToggleFavourite={toggleFavourite} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Web: original layout with updated accent colours
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Keyboard className="h-4 w-4" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">/</kbd>
            <span>to search or</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">?</kbd>
            <span>for shortcuts</span>
          </div>
          <a
            href="https://github.com/gammabowl/opendevutils/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sm font-medium text-sky-700 transition-all duration-200 hover:border-sky-500/50 hover:bg-sky-500/15 dark:text-sky-300 group"
            aria-label="Download desktop app for macOS, Windows, and Linux"
          >
            <Monitor className="h-3.5 w-3.5 text-sky-600" />
            <span>Get the Desktop App</span>
            <Download className="h-3 w-3 text-sky-600 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <a
            href="https://chromewebstore.google.com/detail/trydevutils/mkbkmocnckocblfdonfjmeeneojabadg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-700 transition-all duration-200 hover:border-amber-500/55 hover:bg-amber-500/15 dark:text-amber-300 group"
            aria-label="Install OpenDevUtils Chrome extension"
          >
            <Chrome className="h-3.5 w-3.5 text-amber-600" />
            <span>Get the Chrome Extension</span>
            <Download className="h-3 w-3 text-amber-600 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {!isDesktop && !extensionMode && (
      <section
        aria-labelledby="webhook-inspector-title"
        className="relative overflow-hidden rounded-xl border border-violet-500/30 bg-card/70 p-4 shadow-sm sm:p-5"
      >
        <div className="relative flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-lg bg-violet-500/15 p-2.5 text-violet-600 ring-1 ring-violet-500/20 dark:text-violet-400">
              <Webhook className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h2 id="webhook-inspector-title" className="text-lg font-bold text-foreground sm:text-xl">
                Test and Inspect Webhooks
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Get a unique URL and inspect incoming webhook headers and payloads instantly.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 sm:justify-end">
            <a
              href="https://webhook.opendevutils.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/70 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-lg sm:px-3.5 sm:py-2 sm:text-sm"
              aria-label="Open Webhook Inspector"
            >
              <span className="hidden sm:inline">Open Webhook Inspector</span>
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </a>
            <a
              href="https://github.com/gammabowl/webhook-inspector"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/70 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-lg sm:px-3.5 sm:py-2 sm:text-sm"
              aria-label="View Webhook Inspector source code on GitHub"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">View source</span>
            </a>
          </div>
        </div>
      </section>
      )}

      {favouriteUtils.length > 0 && (
        <div className="space-y-4">
          <div className="border border-sky-200/30 dark:border-sky-800/30 rounded-xl p-6 bg-card/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <Heart className="h-5 w-5 text-sky-600 fill-sky-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your Favourites</h3>
                <p className="text-sm text-muted-foreground">Quick access to your most-used utilities</p>
              </div>
            </div>
            <div className={webGridCols}>
              {favouriteUtils.map((util) => (
                <UtilCard
                  key={util.id}
                  util={util}
                  isFavourite={true}
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {favouriteUtils.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted/50 rounded-lg">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">All Utilities</h3>
              <p className="text-sm text-muted-foreground">Explore all available developer utilities</p>
            </div>
          </div>
        )}
        <div className={webGridCols}>
          {utilCategories
            .map((cat) => otherUtils.filter((util) => util.category === cat))
            .flat()
            .map((util) => (
              <UtilCard
                key={util.id}
                util={util}
                isFavourite={false}
                onToggleFavourite={toggleFavourite}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
