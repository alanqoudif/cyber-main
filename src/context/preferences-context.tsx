"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_LOCALE, Locale, localeDirections } from "@/lib/i18n/config";

type Theme = "light" | "dark";

type PreferencesContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  direction: "ltr" | "rtl";
  ready: boolean;
};

const PREFERENCES_STORAGE_KEYS = {
  theme: "cm-theme",
  locale: "cm-locale",
} as const;

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const isTheme = (value: string | null): value is Theme => value === "light" || value === "dark";
const isLocale = (value: string | null): value is Locale => value === "en" || value === "ar";

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const hasStoredThemeRef = useRef(false);

  // Hydrate from storage and system preferences
  useEffect(() => {
    if (typeof window === "undefined") {
      setReady(true);
      return;
    }

    const storedTheme = window.localStorage.getItem(PREFERENCES_STORAGE_KEYS.theme);
    const storedLocale = window.localStorage.getItem(PREFERENCES_STORAGE_KEYS.locale);
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const initialTheme = isTheme(storedTheme) ? storedTheme : media.matches ? "dark" : "light";
    const initialLocale = isLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;

    hasStoredThemeRef.current = isTheme(storedTheme);
    setThemeState(initialTheme);
    setLocaleState(initialLocale);
    setReady(true);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (hasStoredThemeRef.current) {
        return;
      }
      setThemeState(event.matches ? "dark" : "light");
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleMediaChange);
      return () => media.removeEventListener("change", handleMediaChange);
    }

    if (typeof media.addListener === "function") {
      media.addListener(handleMediaChange);
      return () => media.removeListener(handleMediaChange);
    }

    return () => undefined;
  }, []);

  // Sync theme with DOM + storage
  useEffect(() => {
    if (!ready || typeof document === "undefined") {
      return;
    }
    document.body.dataset.theme = theme;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEYS.theme, theme);
      hasStoredThemeRef.current = true;
    }
  }, [theme, ready]);

  // Sync locale + direction
  useEffect(() => {
    if (!ready || typeof document === "undefined") {
      return;
    }

    const direction = localeDirections[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.dataset.locale = locale;
    document.body.dataset.direction = direction;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEYS.locale, locale);
    }
  }, [locale, ready]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
  };

  const toggleLocale = () => {
    setLocaleState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      locale,
      setLocale,
      toggleLocale,
      direction: localeDirections[locale],
      ready,
    }),
    [theme, locale, ready]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

export type { Theme };
