import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { utils, Util, utilCategories } from "@/lib/utils";
import { prefetchUtil } from "@/lib/lazyUtils";
import { Keyboard, Heart, Monitor, Download, Search, Chrome } from "lucide-react";
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
  compact?: boolean;
}

function UtilCard({ util, isFavourite, onToggleFavourite, compact }: UtilCardProps) {
  const IconComponent = util.icon;
  
  const handleFavouriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavourite(util.id);
  };

  // Desktop: compact card-style layout
  if (compact) {
    return (
      <Link
        to={`/${util.id}`}
        onMouseEnter={() => prefetchUtil(util.id)}
        className="group cursor-pointer bg-card/60 border border-border/40 rounded-lg hover:bg-accent/60 hover:border-border/60 transition-all duration-200 relative overflow-hidden p-4"
      >
        <button
          onClick={handleFavouriteClick}
          className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-all z-10 ${
            isFavourite
              ? "text-red-500 bg-red-500/10"
              : "text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10"
          }`}
          title={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart className={`h-3.5 w-3.5 ${isFavourite ? "fill-current" : ""}`} />
        </button>
        <div className="flex flex-col items-center text-center space-y-2 min-w-0">
          <div className={`p-2.5 rounded-lg ${util.bgColor} shrink-0`}>
            <IconComponent className={`h-6 w-6 ${util.textColor}`} />
          </div>
          <div className="min-w-0 w-full">
            <h3 className="text-sm font-semibold text-foreground leading-tight truncate">{util.label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{util.description}</p>
            <span className="sr-only">{util.category}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Web: original card style
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
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const isDesktop = isTauri();
  const extensionMode = isExtension();

  useEffect(() => {
    setFavourites(getFavorites());
    // Set page title when on the grid
    document.title = extensionMode || isDesktop
      ? "OpenDevUtils – Essential developer utilities"
      : "OpenDevUtils – Essential developer utilities — Web, Desktop App & Chrome Extension";
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

  const desktopGridCols = "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";
  const webGridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (extensionMode) {
    const categories = ["All", ...utilCategories];
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (util: Util) => {
      if (!normalizedQuery) return true;
      return (
        util.label.toLowerCase().includes(normalizedQuery) ||
        util.description.toLowerCase().includes(normalizedQuery) ||
        util.category.toLowerCase().includes(normalizedQuery)
      );
    };

    const matchesCategory = (util: Util) =>
      activeCategory === "All" || util.category === activeCategory;

    const filteredFavourites = favouriteUtils
      .filter(matchesQuery)
      .filter(matchesCategory);

    const filteredOtherUtils = otherUtils
      .filter(matchesQuery)
      .filter(matchesCategory);

    return (
      <div className="flex gap-4">
        <aside className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-[72px] space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Categories
              </div>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                      activeCategory === category
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {favouriteUtils.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Favourites
                </div>
                <div className="space-y-1">
                  {favouriteUtils.slice(0, 6).map((util) => (
                    <Link
                      key={util.id}
                      to={`/${util.id}`}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    >
                      <util.icon className={`h-4 w-4 ${util.textColor}`} />
                      <span className="truncate">{util.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="flex items-center gap-2 bg-card/60 border border-border/50 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search utilities, categories, or descriptions"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="hidden md:flex items-center gap-1 text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">
              ⌘K
            </div>
          </div>

          {favouriteUtils.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                <h3 className="text-sm font-semibold text-foreground">Favourites</h3>
                <span className="text-[11px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-full">
                  {filteredFavourites.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredFavourites.map((util) => (
                  <UtilCard
                    key={util.id}
                    util={util}
                    isFavourite={true}
                    onToggleFavourite={toggleFavourite}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">All Utilities</h3>
              <span className="text-[11px] text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-full">
                {filteredOtherUtils.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredOtherUtils.map((util) => (
                <UtilCard
                  key={util.id}
                  util={util}
                  isFavourite={false}
                  onToggleFavourite={toggleFavourite}
                  compact
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isDesktop) {
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
            <div className={`grid ${desktopGridCols} gap-3`}>
              {favouriteUtils.map((util) => (
                <UtilCard key={util.id} util={util} isFavourite={true} onToggleFavourite={toggleFavourite} compact />
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
          <div className={`grid ${desktopGridCols} gap-3`}>
            {desktopSortedOtherUtils.map((util) => (
              <UtilCard key={util.id} util={util} isFavourite={false} onToggleFavourite={toggleFavourite} compact />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Web: original layout from main
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Keyboard className="h-3.5 w-3.5" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">/</kbd>
            <span>to search or</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">?</kbd>
            <span>for shortcuts</span>
          </div>
          {/* Download pills */}
          <a
            href="https://github.com/gammabowl/try-devutils/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 px-3 py-1.5 rounded-full hover:text-foreground transition-all duration-200 group"
            aria-label="Download desktop app for macOS, Windows, and Linux"
          >
            <Monitor className="h-3.5 w-3.5 text-blue-500" />
            <span>Get the Desktop App</span>
            <Download className="h-3 w-3 text-blue-500 group-hover:translate-y-0.5 transition-transform" />
          </a>
          <a
            href="https://chromewebstore.google.com/detail/trydevutils/mkbkmocnckocblfdonfjmeeneojabadg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-gradient-to-r from-blue-500/10 via-red-500/10 to-yellow-500/10 border border-blue-500/25 hover:border-blue-500/45 px-3 py-1.5 rounded-full hover:text-foreground transition-all duration-200 group"
            aria-label="Install OpenDevUtils Chrome extension"
          >
            <Chrome className="h-3.5 w-3.5 text-blue-500" />
            <span>Get the Chrome Extension</span>
            <Download className="h-3 w-3 text-blue-500 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Favorites Section */}
      {favouriteUtils.length > 0 && (
        <div className="space-y-4">
          <div className="border border-blue-200/30 dark:border-blue-800/30 rounded-xl p-6 bg-card/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Heart className="h-5 w-5 text-blue-500 fill-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Your Favourites</h3>
                <p className="text-sm text-muted-foreground">Quick access to your most-used utilities</p>
              </div>
            </div>
            <div className={`grid ${webGridCols} gap-4`}>
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

      {/* All Utils Section */}
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
        <div className={`grid ${webGridCols} gap-4`}>
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
