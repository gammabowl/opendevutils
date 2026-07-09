import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles, Info, Search, Keyboard, Shield, CheckCircle, Twitter, EyeOff, Code, Monitor, Bug, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp, useGlobalKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { isExtension } from "@/lib/platform";
import { cn } from "@/lib/utils";

export function Layout() {
  const { isOpen, setIsOpen } = useCommandPalette();
  const { showHelp, setShowHelp } = useGlobalKeyboardShortcuts();
  const extensionMode = isExtension();

  return (
    <div
      className={cn(
        "min-h-screen bg-background flex flex-col",
        !extensionMode && "relative overflow-x-clip"
      )}
    >
      {!extensionMode && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.55),transparent_72%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_calc(100%-1px),hsl(var(--border)/0.28)_100%),linear-gradient(to_bottom,transparent_0,transparent_calc(100%-1px),hsl(var(--border)/0.28)_100%)] bg-[size:72px_72px] opacity-[0.14]" />
        </>
      )}

      {/* Command Palette */}
      <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen} />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp isOpen={showHelp} onOpenChange={setShowHelp} />

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-20",
          extensionMode
            ? "border-b border-border/50 bg-card/50 backdrop-blur-sm"
            : "border-b border-border/40 bg-background/75 backdrop-blur-xl"
        )}
      >
        <div className={cn(
          extensionMode ? "container mx-auto px-4 py-3 sm:py-6" : "mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10"
        )}>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="OpenDevUtils Logo" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">OpenDevUtils</h1>
                {!extensionMode && (
                  <p className="hidden lg:block text-[11px] uppercase tracking-[0.22em] text-muted-foreground/75">
                    privacy-first developer utils
                  </p>
                )}
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              {/* Action buttons group */}
              <div className="flex items-center">
                {/* GitHub repository link */}
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="View source on GitHub"
                >
                  <a href="https://github.com/gammabowl/opendevutils" target="_blank" rel="noopener noreferrer">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </Button>
                {/* Keyboard shortcuts button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelp(true)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </div>

              {/* Search button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-8 px-3"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="text-xs">Search</span>
                <kbd className="pointer-events-none h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium hidden lg:inline-flex">
                  ⌘K
                </kbd>
              </Button>

              {/* Privacy notice */}
              <div
                className={cn(
                  "hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
                  extensionMode
                    ? "bg-muted/30"
                    : "border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 shadow-sm"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span className="text-xs font-medium text-foreground whitespace-nowrap">No data leaves your browser</span>
              </div>

              {/* Info dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="About OpenDevUtils">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="text-center pb-2">
                    <div className="mx-auto mb-4">
                      <img src="/logo.png" alt="OpenDevUtils Logo" className="h-16 w-16 rounded-xl" />
                    </div>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      Why Choose OpenDevUtils?
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2">
                      Clean, fast, and privacy-focused developer utilities — available on the web and as a desktop app for macOS, Windows, and Linux
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Most developer utils websites are bloated with ads, trackers, and unnecessary scripts.
                        OpenDevUtils delivers essential utils in a clean, distraction-free interface — use it in your browser or download the native desktop app for macOS, Windows, and Linux.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Privacy First Approach
                      </h4>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>All processing happens locally in your browser</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>No external fonts or tracking scripts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>No analytics or usage tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>No ads or third-party services</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Only localStorage for your preferences</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/50 pt-4 mt-4">
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <span>Crafted by</span>
                        <a
                          href="http://x.com/gammabowl"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-dev-primary hover:underline font-medium"
                        >
                          <Twitter className="h-3 w-3" />
                          @gammabowl
                        </a>
                        <span className="flex items-center gap-1">
                          <span className="italic">Assisted by</span>
                          <span className="text-lg">🤖✨</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 relative z-10",
          extensionMode ? "max-w-6xl mx-auto w-full px-4 py-4" : "w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
        )}
      >
        <div className={cn(!extensionMode && "mx-auto w-full max-w-7xl")}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer
        className={cn(
          "border-t mt-auto",
          extensionMode
            ? "border-border/50 bg-card/30 backdrop-blur-sm"
            : "border-border/40 bg-background/75 backdrop-blur-xl"
        )}
      >
        <div className={cn(
          extensionMode ? "container mx-auto px-4 py-2 md:py-3" : "mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10"
        )}>
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Compact footer for all except desktop */}
            <div className="flex items-center gap-2 lg:gap-6 text-sm">
              <span className="font-medium lg:hidden text-xs">Local . Private . Ad-free . Opensource</span>
              <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground" title="All processing happens locally">
                <Monitor className="h-4 w-4 text-green-600" />
                <span className="font-medium">All processing happens locally</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground" title="No tracking, not even analytics">
                <EyeOff className="h-4 w-4 text-blue-600" />
                <span className="font-medium">No tracking, not even analytics</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground" title="Ad-free">
                <span className="text-red-500 text-sm">🚫</span>
                <span className="font-medium">Ad-free</span>
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground" title="Open source">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Open source</span>
              </div>
            </div>
            {/* Links - always visible */}
            <div className="flex items-center gap-2 md:gap-6 text-sm">
              <a
                href="https://github.com/gammabowl/opendevutils/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Feature Request"
              >
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-medium hidden md:inline">Feature Request</span>
              </a>
              <a
                href="https://github.com/gammabowl/opendevutils/issues/new?template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Report Bug"
              >
                <Bug className="h-4 w-4 text-red-500" />
                <span className="font-medium hidden md:inline">Report Bug</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
