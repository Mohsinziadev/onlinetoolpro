"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-bg-subtle hover:text-ink"
      aria-label="Toggle color theme"
    >
      {/* Both icons render; CSS picks one so there is no hydration mismatch. */}
      <Sun aria-hidden className="hidden h-4 w-4 dark:block" strokeWidth={1.75} />
      <Moon aria-hidden className="h-4 w-4 dark:hidden" strokeWidth={1.75} />
    </button>
  );
}
