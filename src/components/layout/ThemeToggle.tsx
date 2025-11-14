"use client";

import { usePreferences } from "@/context/preferences-context";
import { Moon, Sun } from "lucide-react";

type ThemeToggleVariant = "full" | "icon";

const labelMap = {
  en: {
    dark: "Dark mode",
    light: "Light mode",
    toDark: "Switch to dark mode",
    toLight: "Switch to light mode",
  },
  ar: {
    dark: "نمط داكن",
    light: "نمط مضيء",
    toDark: "التبديل إلى النمط الداكن",
    toLight: "التبديل إلى النمط المضئ",
  },
};

interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
  className?: string;
}

export function ThemeToggle({ variant = "full", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, locale } = usePreferences();
  const labels = labelMap[locale];
  const isLight = theme === "light";
  const visibleLabel = isLight ? labels.dark : labels.light;
  const ariaLabel = isLight ? labels.toDark : labels.toLight;

  const baseClasses =
    variant === "icon"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface/70 text-sm font-medium text-foreground transition hover:bg-surface-muted"
      : "inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted";

  return (
    <button type="button" onClick={toggleTheme} className={`${baseClasses} ${className}`} aria-label={ariaLabel}>
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {variant === "full" && <span>{visibleLabel}</span>}
    </button>
  );
}
