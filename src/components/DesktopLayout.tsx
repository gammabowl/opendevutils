import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { utils, utilCategories } from "@/lib/utils";
import { getPlatformSync, getModifierKey, isTauri, isExtension } from "@/lib/platform";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp, useGlobalKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { Search, ChevronLeft, ChevronRight, Home, Bug, Lightbulb, Keyboard, Monitor, EyeOff, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getVersion } from "@tauri-apps/api/app";

const FAVORITES_STORAGE_KEY = "try-devutils-favourites";
const SIDEBAR_WIDTH_STORAGE_KEY = "opendevutils-sidebar-width";
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 420;
const SIDEBAR_DEFAULT_WIDTH = 240;

function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getStoredSidebarWidth(): number {
  try {
    const stored = Number(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= SIDEBAR_MIN_WIDTH && stored <= SIDEBAR_MAX_WIDTH) {
      return stored;
    }
  } catch {
    // Ignore; fall through to default.
  }
  return SIDEBAR_DEFAULT_WIDTH;
}

/**
 * Desktop-specific layout with a collapsible sidebar, native-feeling title bar,
 * and tight integration with the Tauri window chrome.
 */
export function DesktopLayout() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const { showHelp, setShowHelp } = useGlobalKeyboardShortcuts();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(getStoredSidebarWidth);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [favourites, setFavourites] = useState<string[]>(getFavorites());
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const platform = getPlatformSync();
  const modKey = getModifierKey();
  const isDesktopApp = isTauri();
  const inExtension = isExtension();
  // Native window chrome (traffic-light spacing, taller drag region) only
  // applies to the actual Tauri window — the extension runs in a normal
  // browser tab/popup with no native title bar to make room for.
  const isMac = isDesktopApp && platform === "macos";

  // Refresh favourites on storage change (other windows)
  useEffect(() => {
    const handleStorage = () => setFavourites(getFavorites());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (isDesktopApp) {
      getVersion()
        .then((version) => setAppVersion(version))
        .catch(() => {
          // Best effort; keep footer readable even if version fetch fails.
        });
    } else if (inExtension) {
      try {
        setAppVersion(chrome.runtime.getManifest().version);
      } catch {
        // Best effort; keep footer readable even if this fails.
      }
    }
  }, [isDesktopApp, inExtension]);

  // Active util
  const activeUtilId = location.pathname.replace("/", "") || null;

  // Filtered and grouped
  const filtered = useMemo(() => {
    const q = sidebarFilter.toLowerCase();
    return utils.filter(
      (u) =>
        u.label.toLowerCase().includes(q) ||
        u.description.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [sidebarFilter]);

  const favouriteUtils = filtered.filter((u) => favourites.includes(u.id));

  // Group non-favourite utils by category
  const categorizedSidebar = useMemo(() => {
    const nonFav = filtered.filter((u) => !favourites.includes(u.id));
    const grouped = new Map<string, typeof utils>();
    for (const cat of utilCategories) {
      const items = nonFav.filter((u) => u.category === cat);
      if (items.length > 0) grouped.set(cat, items);
    }
    return grouped;
  }, [filtered, favourites]);

  // Drag-to-resize sidebar
  const startSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    setIsResizingSidebar(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, startWidth + (moveEvent.clientX - startX))
      );
      setSidebarWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setSidebarWidth((current) => {
        try {
          localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(current));
        } catch {
          // Best effort; width just won't persist across sessions.
        }
        return current;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [sidebarWidth]);

  // Focus sidebar filter with Cmd/Ctrl+F
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = platform === "macos" ? e.metaKey : e.ctrlKey;
      if (isMod && e.key === "f") {
        e.preventDefault();
        filterInputRef.current?.focus();
      }
    },
    [platform]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={cn("h-screen flex flex-col bg-background overflow-hidden desktop", isResizingSidebar && "select-none cursor-col-resize")}>
      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} />
      <KeyboardShortcutsHelp isOpen={showHelp} onOpenChange={setShowHelp} />

      {/* Desktop title / toolbar bar */}
      <header
        data-tauri-drag-region
        className="flex items-center justify-between border-b border-border/50 bg-card/70 backdrop-blur-md px-3 shrink-0 select-none"
        style={{ height: isMac ? 52 : 40, paddingTop: isMac ? 12 : 0 }}
      >
        {/* Left – logo + breadcrumb (leave space for macOS traffic lights) */}
        <div data-tauri-drag-region className="flex items-center gap-2 flex-1 min-w-0" style={{ marginLeft: isMac ? 70 : 0 }}>
          <img src="/favicon.png" alt="" className="h-5 w-5 shrink-0 pointer-events-none" />
          <span className="text-sm font-semibold text-foreground pointer-events-none">
            OpenDevUtils
          </span>
          {activeUtilId && (
            <>
              <span className="text-muted-foreground/50 pointer-events-none">/</span>
              <span className="text-sm text-muted-foreground truncate pointer-events-none">
                {utils.find((u) => u.id === activeUtilId)?.label ?? activeUtilId}
              </span>
            </>
          )}
        </div>

        {/* Right – actions */}
        <div className="flex items-center gap-1.5">
          {/* GitHub */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="View source on GitHub"
            onClick={() => window.open("https://github.com/gammabowl/opendevutils", "_blank")}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </Button>

          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-7 gap-1.5 text-muted-foreground hover:text-foreground text-xs px-2"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px]">
              {modKey}K
            </kbd>
          </Button>

          {/* Keyboard shortcuts */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Keyboard shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          <ThemeToggle />
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-border/50 bg-card/40 shrink-0 select-none",
            !isResizingSidebar && "transition-[width] duration-200 ease-in-out"
          )}
          style={{ width: sidebarCollapsed ? 48 : sidebarWidth }}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-2 gap-1 shrink-0">
            {!sidebarCollapsed && (
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  ref={filterInputRef}
                  value={sidebarFilter}
                  onChange={(e) => setSidebarFilter(e.target.value)}
                  placeholder="Filter"
                  className="h-7 text-sm bg-background/60 border-border/40"
                  // Inline styles (not pl-7/pr-9 classes) so this can never
                  // lose a cascade tie to the Input component's own base
                  // "px-3" class once tool.css (see tool.css / index.css's
                  // "Home shell layout" comment) loads a second copy of it
                  // on visiting any util — inline styles always win
                  // regardless of stylesheet load order.
                  style={{ paddingLeft: "1.75rem", paddingRight: "2.25rem" }}
                />
                <kbd className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-4 items-center rounded border bg-muted px-1 font-mono text-[9px] text-muted-foreground/70">
                  {modKey}F
                </kbd>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Home link */}
          <div className="px-2 pb-1 shrink-0">
            <Link
              to="/"
              title={sidebarCollapsed ? "All Utilities" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                !activeUtilId
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>All Utilities</span>}
            </Link>
          </div>

          {/* Scrollable util list */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-2 pb-2 space-y-3">
              {/* Favourites */}
              {favouriteUtils.length > 0 && (
                <div>
                  {!sidebarCollapsed && (
                    <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-semibold px-2 mb-1">
                      Favourites
                    </p>
                  )}
                  <nav className="space-y-0.5">
                    {favouriteUtils.map((util) => (
                      <SidebarItem
                        key={util.id}
                        util={util}
                        active={activeUtilId === util.id}
                        collapsed={sidebarCollapsed}
                      />
                    ))}
                  </nav>
                  {!sidebarCollapsed && (
                    <div className="border-b border-border/30 mx-2 mt-2" />
                  )}
                </div>
              )}

              {/* Categorized Utils */}
              {Array.from(categorizedSidebar.entries()).map(([category, items]) => (
                <div key={category}>
                  {!sidebarCollapsed && (
                    <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-semibold px-2 mb-1">
                      {category}
                    </p>
                  )}
                  <nav className="space-y-0.5">
                    {items.map((util) => (
                      <SidebarItem
                        key={util.id}
                        util={util}
                        active={activeUtilId === util.id}
                        collapsed={sidebarCollapsed}
                      />
                    ))}
                  </nav>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar footer */}
          {!sidebarCollapsed && (
            <div className="border-t border-border/30 p-2 text-[10px] text-muted-foreground/50 text-center shrink-0">
              {appVersion ? `v${appVersion} · ${isDesktopApp ? "Desktop" : "Extension"}` : (isDesktopApp ? "Desktop" : "Extension")}
            </div>
          )}
        </aside>

        {/* Sidebar resize handle */}
        {!sidebarCollapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onMouseDown={startSidebarResize}
            className={cn(
              "w-1.5 shrink-0 cursor-col-resize hover:bg-dev-primary/40 transition-colors",
              isResizingSidebar && "bg-dev-primary/60"
            )}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden bg-background flex flex-col min-h-0">
          <div className="px-4 py-3 flex-1 flex flex-col min-h-0 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer — kept identical (markup and content) to Layout.tsx's
          footer so web, desktop, and extension all render the same one. */}
      <footer className="border-t border-border/40 bg-background/75 backdrop-blur-xl mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 lg:gap-x-14">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:gap-x-8 text-sm">
              <span className="shell-footer-compact font-medium text-xs">Local . Private . Ad-free . Opensource</span>
              <div className="shell-footer-detail items-center gap-2 text-muted-foreground" title="All processing happens locally">
                <Monitor className="h-4 w-4 text-green-600" />
                <span className="font-medium">All processing happens locally</span>
              </div>
              <div className="shell-footer-detail items-center gap-2 text-muted-foreground" title="No tracking, not even analytics">
                <EyeOff className="h-4 w-4 text-blue-600" />
                <span className="font-medium">No tracking, not even analytics</span>
              </div>
              <div className="shell-footer-detail items-center gap-2 text-muted-foreground" title="Ad-free">
                <span className="text-red-500 text-sm">🚫</span>
                <span className="font-medium">Ad-free</span>
              </div>
              <div className="shell-footer-detail items-center gap-2 text-muted-foreground" title="Open source">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Open source</span>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-8 text-sm">
              <a
                href="https://github.com/gammabowl/opendevutils/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Feature Request"
              >
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="shell-footer-link-label font-medium">Feature Request</span>
              </a>
              <a
                href="https://github.com/gammabowl/opendevutils/issues/new?template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Report Bug"
              >
                <Bug className="h-4 w-4 text-red-500" />
                <span className="shell-footer-link-label font-medium">Report Bug</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Sidebar nav item ─── */
interface SidebarItemProps {
  util: (typeof utils)[number];
  active: boolean;
  collapsed: boolean;
}

function SidebarItem({ util, active, collapsed }: SidebarItemProps) {
  const Icon = util.icon;
  return (
    <Link
      to={`/${util.id}`}
      title={collapsed ? util.label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors group",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", util.textColor)} />
      {!collapsed && (
        <span className="truncate flex-1">{util.label}</span>
      )}
    </Link>
  );
}
