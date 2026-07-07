/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { utils } from "@/lib/utils";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Context to share keyboard shortcut state
interface KeyboardShortcutsContextType {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType>({
  showHelp: false,
  setShowHelp: () => {},
});

export function useKeyboardShortcutsContext() {
  return useContext(KeyboardShortcutsContext);
}

// Keyboard shortcuts help modal
export function KeyboardShortcutsHelp({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["⌘", "K"], description: "Open command palette" },
        { keys: ["/"], description: "Open command palette" },
        { keys: ["Esc"], description: "Go back to homepage / Close dialog" },
        { keys: ["?"], description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "Util Actions",
      items: [
        { keys: ["⌘", "Enter"], description: "Execute / Format / Convert" },
        { keys: ["⌘", "Shift", "C"], description: "Copy output to clipboard" },
        { keys: ["⌘", "L"], description: "Clear all inputs" },
        { keys: ["⌘", "Shift", "V"], description: "Paste from clipboard" },
      ],
    },
    {
      category: "General",
      items: [
        { keys: ["Tab"], description: "Navigate between elements" },
        { keys: ["↑", "↓"], description: "Navigate in lists" },
        { keys: ["Enter"], description: "Select / Confirm" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            A list of all available keyboard shortcuts for the application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 rounded border bg-muted text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          Press <kbd className="px-1 rounded border bg-muted">?</kbd> anytime to
          show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // "?" to show keyboard shortcuts help (when not typing)
      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // ESC to go back to homepage (when on a tool page and not in a dialog)
      if (e.key === "Escape" && !isTyping) {
        // Check if any dialog is open
        const openDialog = document.querySelector('[role="dialog"]');
        if (!openDialog && location.pathname !== "/") {
          e.preventDefault();
          navigate("/");
          return;
        }
      }

      // Cmd/Ctrl + L to clear inputs
      if ((e.metaKey || e.ctrlKey) && e.key === "l" && !e.shiftKey) {
        // Don't prevent default as it might interfere with browser URL bar
        // Instead, dispatch a custom event that utils can listen to
        const clearEvent = new CustomEvent("opendevutils:clear");
        window.dispatchEvent(clearEvent);
        return;
      }

      // Cmd/Ctrl + Enter to execute
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        const executeEvent = new CustomEvent("opendevutils:execute");
        window.dispatchEvent(executeEvent);
        return;
      }

      // Cmd/Ctrl + Shift + C to copy output
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "c") {
        // Only if not selecting text
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          e.preventDefault();
          const copyEvent = new CustomEvent("opendevutils:copy");
          window.dispatchEvent(copyEvent);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [location.pathname, navigate]);

  return { showHelp, setShowHelp };
}

// Custom hook for utils to use keyboard shortcuts
export function useUtilKeyboardShortcuts({
  onExecute,
  onClear,
  onCopy,
}: {
  onExecute?: () => void;
  onClear?: () => void;
  onCopy?: () => void;
}) {
  useEffect(() => {
    const handleExecute = () => onExecute?.();
    const handleClear = () => onClear?.();
    const handleCopy = () => onCopy?.();

    if (onExecute) {
      window.addEventListener("opendevutils:execute", handleExecute);
    }
    if (onClear) {
      window.addEventListener("opendevutils:clear", handleClear);
    }
    if (onCopy) {
      window.addEventListener("opendevutils:copy", handleCopy);
    }

    return () => {
      window.removeEventListener("opendevutils:execute", handleExecute);
      window.removeEventListener("opendevutils:clear", handleClear);
      window.removeEventListener("opendevutils:copy", handleCopy);
    };
  }, [onExecute, onClear, onCopy]);
}
